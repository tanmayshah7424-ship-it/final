import os
import json
import sys
from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool
from dotenv import load_dotenv
import requests
from memory_service import memory_service
import io
import logging

# Force UTF-8 for Windows terminal compatibility
if sys.platform == "win32":
    try:
        import sys, io
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

os.environ["PYTHONUTF8"] = "1"
os.environ["OTEL_SDK_DISABLED"] = "true" # Disable telemetry to reduce EventBus noise

load_dotenv()

# Suppress verbose logging
logging.getLogger('crewai').setLevel(logging.ERROR)
logging.getLogger('opentelemetry').setLevel(logging.ERROR)
logging.getLogger('litellm').setLevel(logging.ERROR)

# --- TOOLS ---

@tool("fetch_live_data")
def fetch_live_data(goal: str):
    """Fetches real-time cricket match data from the primary API"""
    url = "https://api.cricapi.com/v1/currentMatches"
    params = {"apikey": os.getenv("CRICAPI_KEY")}
    try:
        res = requests.get(url, params=params, timeout=10).json()
        raw_data = res.get('data', [])
        
        # Filter out junk (social links, urls, etc)
        valid_data = []
        for m in raw_data:
            name = m.get('name', '')
            if not name: continue
            if 'http' in name or '.com' in name: continue
            # Actual matches have ' vs ' or ' v '
            if ' vs ' not in name and ' v ' not in name: continue
            valid_data.append(m)
            
        data = valid_data[:3]
        return json.dumps(data, ensure_ascii=False)
    except Exception as e:
        return f"Live Data Error: {str(e)}"

@tool("query_historical_memory")
def query_memory(query: str):
    """Queries the ChromaDB vector database for historical match context"""
    context = memory_service.query_memory(query)
    return " ".join(context) if context else "No historical context found for this query."

@tool("save_to_memory")
def save_memory(fact: str):
    """Saves a new finding or match fact into the ChromaDB vector database"""
    memory_service.store_match_fact(fact)
    return "Fact successfully committed to long-term memory."

def get_llm_candidates():
    candidates = []
    
    if os.getenv("GROQ_API_KEY"):
        candidates.append({
            "name": "Groq Llama 3.3",
            "model": "groq/llama-3.3-70b-versatile",
            "api_key": os.getenv("GROQ_API_KEY")
        })
    
    if os.getenv("GEMINI_API_KEY"):
        candidates.append({
            "name": "Gemini 2.0 Flash",
            "model": "gemini/gemini-2.0-flash",
            "api_key": os.getenv("GEMINI_API_KEY")
        })
        
    if os.getenv("OPENAI_API_KEY"):
        candidates.append({
            "name": "OpenAI GPT-4o-Mini",
            "model": "openai/gpt-4o-mini",
            "api_key": os.getenv("OPENAI_API_KEY")
        })

    if os.getenv("OPENROUTER_API_KEY"):
        candidates.append({
            "name": "OpenRouter Llama 3.1",
            "model": "openrouter/meta-llama/llama-3.1-8b-instruct",
            "api_key": os.getenv("OPENROUTER_API_KEY"),
            "max_tokens": 4000
        })
        
    return candidates

def run_agentic_mission(goal, llm_config):
    kwargs = {
        "model": llm_config["model"],
        "api_key": llm_config["api_key"],
        "temperature": 0.7
    }
    if "max_tokens" in llm_config:
        kwargs["max_tokens"] = llm_config["max_tokens"]
        
    llm = LLM(**kwargs)
    
    agent = Agent(
        role='Chief Cricket Intelligence Officer',
        goal=f'Execute the complex sports mission: {goal}',
        backstory='''You are the world's leading expert in cricket analytics. 
        You have direct access to live match data and historical vector memory. 
        Your job is to provide a complete, premium report by yourself.''',
        llm=llm,
        tools=[fetch_live_data, query_memory, save_memory],
        verbose=False
    )
    
    task = Task(
        description=f'Perform a complete analysis and write a premium report for: {goal}.',
        agent=agent,
        expected_output='A full, professional sports article in Markdown format.'
    )
    
    crew = Crew(
        agents=[agent],
        tasks=[task],
        process=Process.sequential,
        verbose=False
    )
    
    return crew.kickoff()

if __name__ == "__main__":
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print(json.dumps({"error": "No mission goal provided"}, ensure_ascii=False))
        sys.exit(1)
    
    query = sys.argv[1]
    candidates = get_llm_candidates()
    
    if not candidates:
        print(json.dumps({"error": "Configuration Error", "detail": "No AI credentials found in environment"}, ensure_ascii=False))
        sys.exit(1)
        
    last_error = "No LLM candidates available"
    for config in candidates:
        try:
            sys.stderr.write(f"[AgenticAI] Attempting mission with {config['name']}...\n")
            result = run_agentic_mission(query, config)
            
            # CrewOutput handling
            report_text = getattr(result, 'raw', str(result))
            
            # If successful, print and exit
            print(json.dumps({"report": report_text}, ensure_ascii=False))
            sys.exit(0)
            
        except Exception as e:
            last_error = str(e)
            sys.stderr.write(f"[AgenticAI] {config['name']} failed: {last_error}\n")
            continue
            
    # If all candidates failed
    sys.stderr.write("[AgenticAI] CRITICAL: All LLM tiers exhausted.\n")
    print(json.dumps({
        "error": "Agentic Orchestration Failure",
        "detail": f"All LLM tiers exhausted. Last error: {last_error}"
    }, ensure_ascii=False))
    sys.exit(1)
