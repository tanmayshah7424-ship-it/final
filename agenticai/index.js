const { spawn } = require("child_process");
const path = require("path");
const genAi = require("../genai");

class AgenticAiService {
  /**
   * High-level mission kickoff. 
   * Orchestrates the CrewAI system and processes the report.
   */
  async runMission(goal) {
    return new Promise((resolve, reject) => {
      console.log(`[AgenticAI] Mission Kickoff: ${goal}`);
      
      const pythonProcess = spawn(".venv/Scripts/python.exe", [
        path.join(__dirname, "../agent_system.py"),
        goal
      ]);

      let result = "";
      let error = "";

      pythonProcess.stdout.on("data", (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        error += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("[AgenticAI] Mission Error:", error);
          reject(new Error(error || "Mission failed"));
        } else {
          try {
            const parsed = JSON.parse(result);
            resolve(parsed.report);
          } catch (e) {
            resolve(result); // Return raw if JSON fails
          }
        }
      });
    });
  }

  /**
   * Fast planning tool. 
   * Uses Gemini to break a goal into steps before execution.
   */
  async createPlan(goal) {
    const prompt = `You are a Sports Strategic Planner. 
    Break the following goal into 3-5 tactical steps: "${goal}".
    Format the output as a numbered list with specific sports-data tools mentioned.`;
    
    return await genAi.generate(prompt);
  }
}

module.exports = new AgenticAiService();
