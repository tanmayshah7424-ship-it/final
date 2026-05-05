const agenticAi = require("../../ai/modules/agentic");
const genAi = require("../../ai/modules/gen");

/**
 * Handles complex multi-agent missions via CrewAI
 */
exports.processAgenticTask = async (req, res) => {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: "Goal is required" });

    try {
        const report = await agenticAi.runMission(goal);
        res.json({ report });
    } catch (error) {
        console.error("[AI Controller] Agentic Error:", error);
        res.status(500).json({ error: "Agentic mission failed", detail: error.message });
    }
};

/**
 * Handles fast content generation and planning
 */
exports.generateFastAnalysis = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const content = await genAi.generate(prompt);
        res.json({ content });
    } catch (error) {
        res.status(500).json({ error: "Fast analysis failed" });
    }
};

/**
 * Handles strategic planning
 */
exports.createPlan = async (req, res) => {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: "Goal is required" });

    try {
        const plan = await agenticAi.createPlan(goal);
        res.json({ plan });
    } catch (error) {
        res.status(500).json({ error: "Planning failed" });
    }
};

/**
 * Explicit handler for General AI Content Generation
 */
exports.generateContent = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const content = await genAi.generate(prompt);
        res.json({ content });
    } catch (error) {
        console.error("[AI Controller] GenAI Error:", error);
        res.status(500).json({ error: "Generation failed", detail: error.message });
    }
};
