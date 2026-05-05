import { useState } from "react";
import { Brain, Send, ListChecks, Trash2 } from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";

const AgenticAI = () => {
    const [goal, setGoal] = useState("");
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState("");

    const handleStartMission = async () => {
        if (!goal) return;
        setLoading(true);
        setReport("");
        try {
            const response = await api.post("/ai/agentic", { goal: goal });
            setReport(response.data.report || "No data received.");
        } catch (error: any) {
            console.error("Agentic Orchestration Error:", error);
            toast.error(error.response?.data?.message || "Agentic Orchestration Failure");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setGoal("");
        setReport("");
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#050505]">
            <div className="container py-8 flex flex-col flex-1 max-w-6xl mx-auto overflow-hidden">
                {/* Header with Reset */}
                <div className="flex items-center justify-between mb-8 w-full shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <ListChecks className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">AI Orchestrator</h1>
                            <p className="text-gray-500 text-sm font-medium">Agentic Intelligence Module</p>
                        </div>
                    </div>
                    {(report || goal) && (
                        <button 
                            onClick={handleReset}
                            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold"
                        >
                            <Trash2 className="w-4 h-4" />
                            Reset
                        </button>
                    )}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                    {!report && !loading ? (
                        <div className="space-y-10 animate-in fade-in duration-1000">
                            <div className="flex justify-center">
                                <ListChecks className="w-16 h-16 text-[#3b82f6]" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-white tracking-tight">
                                    Orchestrate Complex Goals
                                </h2>
                                <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
                                    Provide a goal like "Analyze Player Performance" or "Plan a Tournament" to see the agent's task decomposition.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl mx-auto h-full flex flex-col overflow-hidden">
                            {loading ? (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                    <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Orchestrating...</p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto p-8 text-left prose prose-invert prose-blue max-w-none scrollbar-hide">
                                    <div dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br/>') }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Input Bar */}
            <div className="p-8 border-t border-white/5 bg-[#050505] shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="flex-1 relative">
                        <input 
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStartMission()}
                            placeholder="Sports analysis goal..."
                            className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl py-4 px-6 text-lg text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-600"
                        />
                    </div>
                    <button 
                        onClick={handleStartMission}
                        disabled={loading || !goal}
                        title="Send goal"
                        className="w-14 h-14 rounded-xl bg-[#2563eb] flex items-center justify-center text-white hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgenticAI;
