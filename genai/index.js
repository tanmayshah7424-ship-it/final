const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Groq } = require("groq-sdk");
require("dotenv").config();

class GenAiService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.groqApiKey = process.env.GROQ_API_KEY;
    
    // Model preference list
    this.models = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];
    
    if (this.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    }
    
    if (this.groqApiKey) {
      this.groq = new Groq({ apiKey: this.groqApiKey });
    }
  }

  async generate(prompt, modelIndex = 0) {
    if (!this.genAI) return await this.generateFallbackGroq(prompt);

    if (modelIndex >= this.models.length) {
      return await this.generateFallbackGroq(prompt);
    }

    const modelName = this.models[modelIndex];
    console.log(`[GenAI] Attempting ${modelName}...`);

    try {
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error(`[GenAI] ${modelName} failed:`, error.message);
      // Fallback on rate limits or capacity issues
      return this.generate(prompt, modelIndex + 1);
    }
  }

  async generateFallbackGroq(prompt) {
    if (!this.groq) return "AI services are currently at peak capacity.";
    try {
      console.log(`[GenAI] Falling back to Groq (Llama 3.3)...`);
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      });
      return response.choices[0]?.message?.content || "No content generated.";
    } catch (err) {
      return "All AI engines are temporarily busy.";
    }
  }
}

module.exports = new GenAiService();
