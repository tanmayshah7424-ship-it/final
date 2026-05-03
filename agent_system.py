import os
import json
import sys
from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool
from dotenv import load_dotenv
import requests
from memory_service import memory_service

load_dotenv()

# --- LLM CONFIGURATION ---
def get_llm():
    """Returns Gemini 2.0 Flash as the primary engine for CrewAI."""
    return LLM(
        model="gemini/gemini-2.0-flash",
        api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.7
    )

llm = get_llm()

# --- TOOLS ---

@tool("fetch_live_data")
def fetch_live_data(goal: str):
    """Fetches real-time cricket match data from the primary API."""
    url = "https://api.cricapi.com/v1/currentMatches"
    params = {"apikey": os.getenv("CRICAPI_KEY")}
    try:
        res = requests.get(url, params=params).json()
        data = res.get('data', [])[:3]
        return json.dumps(data)
    except Exception as e:
        return f"Live Data Error: {e}"

@tool("query_historical_memory")
def query_memory(query: str):
    """Queries the ChromaDB vector database for historical match context and trends."""
    context = memory_service.query_memory(query)
    return " ".join(context) if context else "No historical context found for this query."

@tool("save_to_memory")
def save_memory(fact: str):
    """Saves a new finding or match fact into the ChromaDB vector database for future reference."""
    memory_service.store_match_fact(fact)
    return "Fact successfully committed to long-term memory."

# --- AGENTS ---

researcher = Agent(
    role='Lead Data Scientist (Sports)',
    goal='Gather live stats and historical context for {goal}',
    backstory='''You are an expert in sports data extraction. You use 
    live APIs and your own historical vector memory (ChromaDB) to build 
    a complete picture of any match or player.''',
    llm=llm,
    tools=[fetch_live_data, query_memory],
    verbose=True
)

analyst = Agent(
    role='Chief Tactical Analyst',
    goal='Analyze dynamics and predict outcomes for {goal}',
    backstory='''A veteran coach who identifies tactical shifts. You 
    cross-reference live data with historical trends retrieved from 
    ChromaDB to find winning patterns.''',
    llm=llm,
    tools=[query_memory, save_memory],
    verbose=True
)

journalist = Agent(
    role='Senior Sports Editor',
    goal='Write a premium, data-driven report for {goal}',
    backstory='''An award-winning writer for ScoreHub. You transform 
    complex tactical data into engaging sports journalism. You ensure 
    key insights are saved to memory for future reports.''',
    llm=llm,
    tools=[save_memory],
    verbose=True
)

# --- TASKS ---

task1 = Task(
    description='Search live data and historical memory for {goal}. Identify key player form and venue stats.',
    agent=researcher,
    expected_output='A comprehensive data summary including live scores and historical trends.'
)

task2 = Task(
    description='Perform a tactical deep-dive into {goal}. Predict match momentum based on historical context.',
    agent=analyst,
    expected_output='A professional tactical breakdown with high-confidence predictions.'
)

task3 = Task(
    description='Draft a final editorial for ScoreHub. Save the most critical match facts to the vector database.',
    agent=journalist,
    expected_output='A premium sports article in Markdown. Confirmation of memory storage.'
)

# --- CREW ---

crew = Crew(
    agents=[researcher, analyst, journalist],
    tasks=[task1, task2, task3],
    process=Process.sequential,
    verbose=True
)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input provided"}))
        sys.exit(1)
    
    query = sys.argv[1]
    # Kickoff the crew
    result = crew.kickoff(inputs={"goal": query})
    
    # Final output
    print(json.dumps({"report": str(result)}))
