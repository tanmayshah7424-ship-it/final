import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/contexts/SocketContext";
import { useEffect, useRef } from "react";
import api from "@/api/axios";
import { ArrowLeft, MapPin, Clock, RefreshCw, Activity } from "lucide-react";

interface CricMatch {
    id: string;
    homeTeam: string; awayTeam: string;
    homeBadge: string; awayBadge: string;
    homeScore: string; awayScore: string;
    status: "live" | "upcoming" | "completed";
    tournament: string; venue: string;
    matchType: string; summary: string;
    date: string; time: string;
}

function BallChip({ ball }: { ball: string }) {
    const color =
        ball === "6" ? "bg-purple-500 text-white" :
            ball === "4" ? "bg-blue-500 text-white" :
                ball === "W" ? "bg-red-600 text-white" :
                    ball === "•" ? "bg-muted text-muted-foreground" :
                        "bg-secondary text-foreground";
    return (
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${color}`}>
            {ball}
        </span>
    );
}

function parseLastBalls(summary: string): string[] {
    if (!summary) return [];
    const balls: string[] = [];
    if (summary.includes("six") || summary.includes(" 6 ")) balls.push("6");
    if (summary.includes("four") || summary.includes("boundary")) balls.push("4");
    if (summary.toLowerCase().includes("wicket") || /\bw\b/i.test(summary)) balls.push("W");
    if (balls.length === 0) balls.push("1", "•", "1", "•", "1", "•");
    while (balls.length < 6) balls.push("•");
    return balls.slice(0, 6);
}

const CricketMatchCenter = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const commentaryRef = useRef<HTMLDivElement>(null);

    const { data: match, isLoading, refetch } = useQuery({
        queryKey: ["cricket-match", id],
        queryFn: async () => {
            const res = await api.get(`/live/cricket/${id}`);
            return res.data?.data as CricMatch | null;
        },
        refetchInterval: 8_000,
        enabled: !!id,
    });

    useEffect(() => {
        if (!socket) return;
        const handler = (update: any) => { if (update.id === id) refetch(); };
        socket.on("score:update", handler);
        return () => { socket.off("score:update", handler); };
    }, [socket, id, refetch]);

    // Auto-scroll commentary
    useEffect(() => {
        if (commentaryRef.current) {
            commentaryRef.current.scrollTop = commentaryRef.current.scrollHeight;
        }
    }, [match]);

    if (isLoading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground text-sm animate-pulse">Loading match center...</p>
            </div>
        </div>
    );

    if (!match) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-3">
                <p className="text-2xl font-bold">Match not found</p>
                <p className="text-muted-foreground text-sm">It may have ended or the ID is invalid.</p>
                <button onClick={() => navigate("/live-cricket")} className="mt-4 px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">
                    ← Back to Cricket
                </button>
            </div>
        </div>
    );

    const isLive = match.status === "live";
    const balls = parseLastBalls(match.summary);

    // Parse score strings like "250/7 (45.2)" into parts
    const parseScore = (score: string) => {
        if (!score || score === "-") return { runs: "-", wickets: "-", overs: "-" };
        const match2 = score.match(/(\d+)\/(\d+)\s*\(([^)]+)\)/);
        if (match2) return { runs: match2[1], wickets: match2[2], overs: match2[3] };
        return { runs: score, wickets: "-", overs: "-" };
    };

    const homeS = parseScore(match.homeScore);
    const awayS = parseScore(match.awayScore);

    // Generate mock commentary lines from summary
    const generateCommentary = (summary: string, team1: string, team2: string): string[] => {
        if (!summary || summary.length < 5) return ["Match in progress. Score updating..."];
        const lines = [summary];
        if (summary.includes("won")) {
            lines.push(`Full scorecard available. ${summary}`);
        } else {
            lines.push(`${team1} vs ${team2} — live updates every 60s.`);
            lines.push("Use the app to follow every delivery.");
        }
        return lines;
    };

    const commentary = generateCommentary(match.summary, match.homeTeam, match.awayTeam);

    return (
        <div className="min-h-screen bg-background">
            <main className="container py-6 space-y-6 max-w-5xl">

                {/* Back button */}
                <button
                    onClick={() => navigate("/live-cricket")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Cricket Live
                </button>

                {/* Match Hero */}
                <div className={`rounded-2xl border p-6 md:p-8 relative overflow-hidden
          ${isLive ? "bg-gradient-to-br from-red-950/30 to-card border-red-500/20" : "bg-card border-border"}`}>
                    {isLive && <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />}

                    <div className="relative z-10 space-y-6">
                        {/* Header row */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                                        {(match.matchType || "ODI").toUpperCase()}
                                    </span>
                                    <span>{match.tournament}</span>
                                </div>
                                {match.venue && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3" /> {match.venue}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {isLive ? (
                                    <span className="flex items-center gap-1.5 text-sm font-black text-red-400">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                                        </span>
                                        LIVE
                                    </span>
                                ) : (
                                    <span className="text-xs text-muted-foreground font-medium capitalize">{match.status}</span>
                                )}
                                <button onClick={() => refetch()} className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>

                        {/* Scoreboard */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            {/* Team A */}
                            <div className="text-center space-y-2">
                                {match.homeBadge?.startsWith('http') ? (
                                    <img src={match.homeBadge} alt="" className="w-16 h-16 mx-auto rounded-full object-contain bg-secondary/30 p-1" />
                                ) : (
                                    <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center text-2xl">
                                        {match.homeBadge || '🏏'}
                                    </div>
                                )}
                                <p className="font-bold text-sm leading-tight">{match.homeTeam}</p>
                                <div className="bg-secondary/40 rounded-xl p-3">
                                    <div className="text-2xl font-extrabold font-mono text-primary">{homeS.runs}/{homeS.wickets}</div>
                                    {homeS.overs !== "-" && (
                                        <div className="text-xs text-muted-foreground mt-0.5">({homeS.overs} ov)</div>
                                    )}
                                </div>
                            </div>

                            {/* VS */}
                            <div className="text-center">
                                <div className="text-xl font-black text-muted-foreground/50">VS</div>
                                {isLive && (
                                    <div className="mt-2 text-xs text-red-400 font-bold animate-pulse">In Progress</div>
                                )}
                            </div>

                            {/* Team B */}
                            <div className="text-center space-y-2">
                                {match.awayBadge?.startsWith('http') ? (
                                    <img src={match.awayBadge} alt="" className="w-16 h-16 mx-auto rounded-full object-contain bg-secondary/30 p-1" />
                                ) : (
                                    <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center text-2xl">
                                        {match.awayBadge || '🏏'}
                                    </div>
                                )}
                                <p className="font-bold text-sm leading-tight">{match.awayTeam}</p>
                                <div className="bg-secondary/40 rounded-xl p-3">
                                    <div className="text-2xl font-extrabold font-mono">{awayS.runs}/{awayS.wickets}</div>
                                    {awayS.overs !== "-" && (
                                        <div className="text-xs text-muted-foreground mt-0.5">({awayS.overs} ov)</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Over summary — last 6 balls */}
                        {isLive && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Over</p>
                                <div className="flex items-center gap-2 bg-secondary/20 rounded-xl p-3">
                                    {balls.map((b, i) => <BallChip key={i} ball={b} />)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Two column: Scorecard + Commentary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Scorecard panel */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <h2 className="font-bold text-sm">Scorecard</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                { team: match.homeTeam, score: match.homeScore, badge: match.homeBadge },
                                { team: match.awayTeam, score: match.awayScore, badge: match.awayBadge },
                            ].map((t, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {t.badge ? (
                                            <img src={t.badge} alt="" className="w-6 h-6 rounded-full object-contain" />
                                        ) : <span className="text-sm">🏏</span>}
                                        <span className="font-semibold text-sm">{t.team}</span>
                                    </div>
                                    <div className="bg-secondary/20 rounded-lg p-3 font-mono font-bold text-lg text-center text-primary">
                                        {t.score || "Yet to bat"}
                                    </div>
                                    {/* Batting table placeholder */}
                                    <div className="rounded-lg overflow-hidden border border-border/50">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-secondary/30">
                                                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Batter</th>
                                                    <th className="text-right px-3 py-2 font-semibold text-muted-foreground">R</th>
                                                    <th className="text-right px-3 py-2 font-semibold text-muted-foreground">B</th>
                                                    <th className="text-right px-3 py-2 font-semibold text-muted-foreground">SR</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-t border-border/30">
                                                    <td className="px-3 py-2 text-muted-foreground italic" colSpan={4}>
                                                        Detailed scorecard available via live API
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    {i === 0 && <div className="border-t border-border/40 pt-2" />}
                                </div>
                            ))}

                            {/* Match info */}
                            <div className="rounded-xl bg-secondary/20 p-4 space-y-2 text-sm">
                                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Match Info</h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div><span className="text-muted-foreground">Format:</span> <span className="font-semibold">{(match.matchType || "ODI").toUpperCase()}</span></div>
                                    <div><span className="text-muted-foreground">Status:</span> <span className="font-semibold capitalize">{match.status}</span></div>
                                    {match.venue && <div className="col-span-2"><span className="text-muted-foreground">Venue:</span> <span className="font-semibold">{match.venue}</span></div>}
                                    {match.date && <div><span className="text-muted-foreground">Date:</span> <span className="font-semibold">{match.date}</span></div>}
                                    {match.tournament && <div className="col-span-2"><span className="text-muted-foreground">Series:</span> <span className="font-semibold">{match.tournament}</span></div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Commentary panel */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-base">💬</span>
                                <h2 className="font-bold text-sm">Live Commentary</h2>
                            </div>
                            {isLive && (
                                <span className="text-[10px] text-red-400 font-black animate-pulse flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> LIVE
                                </span>
                            )}
                        </div>

                        <div
                            ref={commentaryRef}
                            className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[400px]"
                        >
                            {/* Status summary */}
                            {match.summary && (
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-primary">{match.summary}</p>
                                </div>
                            )}

                            {commentary.map((line, i) => (
                                <div key={i} className="flex gap-3 text-sm animate-slide-up">
                                    <div className="w-1.5 bg-primary/30 rounded-full shrink-0 mt-1" />
                                    <p className="text-muted-foreground leading-relaxed">{line}</p>
                                </div>
                            ))}

                            {isLive && (
                                <div className="flex gap-2 items-center text-xs text-muted-foreground animate-pulse mt-2">
                                    <div className="w-2 h-2 bg-primary/60 rounded-full" />
                                    Updating every 60 seconds...
                                </div>
                            )}

                            {!isLive && match.status === "completed" && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-green-400">✅ Match Completed</p>
                                    <p className="text-xs text-muted-foreground mt-1">{match.summary}</p>
                                </div>
                            )}
                        </div>

                        {/* Auto-refresh indicator */}
                        <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                Auto-updates every 8s
                            </span>
                            <button onClick={() => refetch()} className="hover:text-foreground transition-colors flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CricketMatchCenter;
