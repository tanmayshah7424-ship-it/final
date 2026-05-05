const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Groq } = require("groq-sdk");
require("dotenv").config();

class GenAiService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.orApiKey = process.env.OPENROUTER_API_KEY;
    
    // Model preference list
    this.models = [
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ];
    
    if (this.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    }
    
    if (this.groqApiKey) {
      this.groq = new Groq({ apiKey: this.groqApiKey });
    }
  }

  async generate(prompt, modelIndex = 0) {
    // Tier 1: OpenRouter (Industry Standard)
    if (this.orApiKey) {
        try {
            console.log("[GenAI] Using OpenRouter (Gemini 2.0 Flash)...");
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.orApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-3.1-8b-instruct",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 1000
                })
            });
            const data = await response.json();
            if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
            
            // Tier 2: Groq Fallback (High Speed)
            const groqKey = process.env.GROQ_API_KEY;
            if (groqKey) {
                console.log("[GenAI] Falling back to Groq (Llama 3.3)...");
                const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${groqKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: prompt }],
                        max_tokens: 1000
                    })
                });
                const groqData = await groqRes.json();
                if (groqData.choices?.[0]?.message?.content) {
                    return groqData.choices[0].message.content;
                }
            }

            throw new Error("All AI providers failed");
        } catch (error) {
            console.error("[GenAI] Generation Error:", error);
        }
    }

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
    if (!this.groq) return "AI services are currently at peak capacity. Please check back in 1 minute.";
    try {
      console.log(`[GenAI] Falling back to Groq (Llama 3.1 8B)...`);
      const response = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      });
      return response.choices[0]?.message?.content || "The AI analyst is currently taking a short break. Please try again in 30 seconds.";
    } catch (err) {
      if (err.message?.includes("rate_limit")) {
          return "The AI analyst is currently at peak capacity. I've successfully fetched the latest cricket data for you, but my reasoning engine needs a short break. Please try again in 30 seconds!";
      }
      return "AI intelligence services are temporarily unavailable. Please verify your API keys or wait for quota reset.";
    }
  }
}

module.exports = new GenAiService();
