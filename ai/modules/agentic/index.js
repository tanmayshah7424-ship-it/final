const { spawn } = require("child_process");
const path = require("path");
const genAi = require("../gen");

class AgenticAiService {
  /**
   * High-level mission kickoff.
   * Orchestrates the CrewAI system and processes the report.
   */
  async runMission(goal) {
    return new Promise((resolve, reject) => {
      console.log(`[AgenticAI] Mission Kickoff: ${goal}`);

      // Use Linux/Docker Python executable
      const pythonPath = "python3";

      const pythonProcess = spawn(
        pythonPath,
        [
          path.join(__dirname, "../../engine/agent_system.py"),
          goal
        ],
        {
          cwd: path.join(__dirname, "../../.."),
          env: {
            ...process.env,
            PYTHONIOENCODING: "utf-8",
            PYTHONUTF8: "1",
            OTEL_SDK_DISABLED: "true"
          }
        }
      );

      let result = "";
      let error = "";

      pythonProcess.stdout.on("data", (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        error += data.toString();
      });

      pythonProcess.on("error", (err) => {
        console.error("[AgenticAI] Failed to start python process:", err);
        reject(err);
      });

      pythonProcess.on("close", (code) => {

        if (code !== 0) {
          console.error("[AgenticAI] Mission Error:", error);

          reject(
            new Error(error || "Mission failed")
          );

        } else {

          try {
            // Try extracting JSON report
            const jsonStart = result.lastIndexOf('{"report":');

            if (jsonStart !== -1) {

              const jsonStr = result.substring(jsonStart);

              const parsed = JSON.parse(jsonStr);

              resolve(parsed.report);

            } else {

              // Fallback raw output
              resolve(result.trim());
            }

          } catch (e) {

            resolve(result.trim());
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

    const prompt = `
You are a Sports Strategic Planner.

Break the following goal into 3-5 tactical steps:

"${goal}"

Format the output as a numbered list with specific sports-data tools mentioned.
`;

    return await genAi.generate(prompt);
  }
}

module.exports = new AgenticAiService();