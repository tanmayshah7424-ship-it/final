import { useState } from "react";
import { Zap, Send, RefreshCcw, Trash2, Bot } from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";

const GenAI = () => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        setResult("");
        try {
            const response = await api.post("/ai/genai", { prompt });
            setResult(response.data.content || "No content generated.");
        } catch (error: any) {
            console.error("Gen AI Error:", error);
            toast.error(error.response?.data?.message || "Generation Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setPrompt("");
        setResult("");
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#050505]">
            <div className="container py-8 flex flex-col h-full max-w-6xl">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Sports Content Creator</h1>
                            <p className="text-gray-500 text-sm font-medium">Gen AI Journalism Module</p>
                        </div>
                    </div>
                    {(result || prompt) && (
                        <button 
                            onClick={handleReset}
                            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold"
                        >
                            <Trash2 className="w-4 h-4" />
                            Reset
                        </button>
                    )}
                </div>

                {/* Main Workspace */}
                <div className="flex-1 relative rounded-[32px] border border-white/5 bg-[#080808] overflow-hidden flex flex-col min-h-[500px]">
                    {!result && !loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-1000">
                            <div className="flex justify-center">
                                <Bot className="w-16 h-16 text-orange-500/80" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Generate Professional Recaps</h2>
                                <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
                                    Enter a match or player name to generate news-style summaries and insights.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-6">
                                    <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                    <p className="text-orange-500 font-bold uppercase tracking-widest text-xs">Generating Content...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-orange max-w-none animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bottom Input */}
                    <div className="p-8 border-t border-white/5 bg-black/20">
                        <div className="relative max-w-4xl mx-auto flex items-center gap-4">
                            <input 
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                placeholder="Match or player to recap..."
                                className="flex-1 bg-[#0c0c0c] border border-white/10 rounded-xl py-4 px-6 text-lg text-white focus:outline-none focus:border-orange-500/30 transition-all placeholder:text-gray-700"
                            />
                            <button 
                                onClick={handleGenerate}
                                disabled={loading || !prompt}
                                title="Generate recap"
                                className="w-14 h-14 rounded-xl bg-orange-600 flex items-center justify-center text-white hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenAI;
