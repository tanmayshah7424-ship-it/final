import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/contexts/SocketContext";
import api from "@/api/axios";
import {
    Activity, MapPin, Trophy, Clock, ChevronRight,
    RefreshCw, Wifi, WifiOff
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface CricMatch {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeBadge: string;
    awayBadge: string;
    homeScore: string;
    awayScore: string;
    status: "live" | "upcoming" | "completed";
    tournament: string;
    venue: string;
    matchType: string;
    summary: string;
    date: string;
    time: string;
    source: string;
}

// ── Helper: last ball chips from status string ────────────────────────────────
function parseLastBalls(summary: string): string[] {
    if (!summary) return [];
    const balls: string[] = [];
    if (summary.includes("six") || summary.includes("6")) balls.push("6");
    if (summary.includes("four") || summary.includes("boundary") || summary.includes("4")) balls.push("4");
    if (summary.includes("wicket") || summary.includes("W")) balls.push("W");
    if (balls.length === 0 && summary.length > 3) balls.push("1");
    return balls.slice(0, 4);
}

function BallChip({ ball }: { ball: string }) {
    const color =
        ball === "6" ? "bg-purple-500 text-white" :
            ball === "4" ? "bg-blue-500 text-white" :
                ball === "W" ? "bg-red-600 text-white" :
                    ball === "•" ? "bg-muted text-muted-foreground" :
                        "bg-secondary text-foreground";
    return (
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${color}`}>
            {ball}
        </span>
    );
}

// ── Format badge ──────────────────────────────────────────────────────────────
function FormatBadge({ format }: { format: string }) {
    const f = (format || "ODI").toUpperCase();
    const color =
        f === "T20" ? "bg-orange-500/15 text-orange-400 border-orange-400/30" :
            f === "TEST" ? "bg-purple-500/15 text-purple-400 border-purple-400/30" :
                "bg-blue-500/15 text-blue-400 border-blue-400/30";
    return (
        <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
            {f}
        </span>
    );
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ match, flashId }: { match: CricMatch; flashId: string | null }) {
    const navigate = useNavigate();
    const isLive = match.status === "live";
    const isFlashing = flashId === match.id;
    const balls = parseLastBalls(match.summary);

    return (
        <div
            onClick={() => navigate(`/live-cricket/${match.id}`)}
            className={`relative rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden
        ${isLive ? "border-red-500/30 bg-gradient-to-br from-red-950/20 to-card" : "border-border bg-card"}
        ${isFlashing ? "ring-2 ring-yellow-400 animate-pulse" : ""}`}
        >
            {/* Glow for live */}
            {isLive && <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />}

            <div className="p-5 space-y-4">
                {/* Top row: format + status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FormatBadge format={match.matchType} />
                        <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
                            {match.tournament}
                        </span>
                    </div>
                    {isLive ? (
                        <span className="flex items-center gap-1.5 text-xs font-black text-red-400 uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                            LIVE
                        </span>
                    ) : match.status === "upcoming" ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {match.date} {match.time?.slice(0, 5)}
                        </span>
                    ) : (
                        <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                            FINISHED
                        </span>
                    )}
                </div>

                {/* Teams & Scores */}
                <div className="space-y-3">
                    {[
                        { name: match.homeTeam, badge: match.homeBadge, score: match.homeScore },
                        { name: match.awayTeam, badge: match.awayBadge, score: match.awayScore },
                    ].map((team, i) => (
                        <div key={i} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                                    {team.badge?.startsWith('http') ? (
                                        <img src={team.badge} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-sm font-bold">{team.badge || "🏏"}</span>
                                    )}
                                </div>
                                <span className="font-semibold text-sm truncate">{team.name}</span>
                            </div>
                            <span className={`font-mono font-bold text-base shrink-0 transition-colors duration-500 ${isFlashing ? "text-yellow-400" : isLive ? "text-primary" : "text-foreground"}`}>
                                {team.score || "-"}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Last balls */}
                {isLive && balls.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-muted-foreground mr-1">Last balls:</span>
                        {balls.map((b, i) => <BallChip key={i} ball={b} />)}
                    </div>
                )}

                {/* Commentary / Summary */}
                {match.summary && (
                    <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2 leading-relaxed line-clamp-2">
                        {match.summary}
                    </p>
                )}

                {/* Footer: Venue + CTA */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    {match.venue ? (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate max-w-[55%]">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {match.venue}
                        </span>
                    ) : <span />}
                    <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
    { key: "live", label: "🔴 Live" },
    { key: "upcoming", label: "🕛 Upcoming" },
    { key: "finished", label: "✅ Finished" },
] as const;
type TabKey = typeof TABS[number]["key"];

// ── Main Page ─────────────────────────────────────────────────────────────────
const LiveCricket = () => {
    const [tab, setTab] = useState<TabKey>("live");
    const [flashId, setFlashId] = useState<string | null>(null);
    const { socket } = useSocket();

    const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
        queryKey: ["cricket-live"],
        queryFn: async () => {
            const res = await api.get("/live/cricket");
            return (res.data?.data || []) as CricMatch[];
        },
        refetchInterval: 10_000,
    });

    const all = data || [];
    const live = all.filter(m => m.status === "live");
    const upcoming = all.filter(m => m.status === "upcoming");
    const finished = all.filter(m => m.status === "completed");

    const visible = tab === "live" ? live : tab === "upcoming" ? upcoming : finished;

    // Socket.IO — animate on score update
    useEffect(() => {
        if (!socket) return;
        const handler = (update: any) => {
            setFlashId(update.id);
            refetch();
            setTimeout(() => setFlashId(null), 2500);
        };
        socket.on("score:update", handler);
        socket.on("match:status", () => refetch());
        return () => { socket.off("score:update", handler); socket.off("match:status"); };
    }, [socket, refetch]);

    const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "--";

    return (
        <div className="min-h-screen bg-background">
            <main className="container py-8 space-y-8">

                {/* Hero header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/30 via-card to-background border border-red-500/20 p-6 md:p-8">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🏏</span>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Cricket Live</h1>
                            </div>
                            <p className="text-muted-foreground text-sm max-w-md">
                                Real-time cricket scores, ball-by-ball updates, and live commentary — all in one place.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {socket?.connected ? (
                                <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
                                    <Wifi className="w-3.5 h-3.5" /> Real-time
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20">
                                    <WifiOff className="w-3.5 h-3.5" /> Polling
                                </span>
                            )}
                            <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs hover:bg-secondary transition-colors">
                                <RefreshCw className="w-3.5 h-3.5" /> {lastUpdated}
                            </button>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="relative z-10 flex gap-6 mt-5 pt-5 border-t border-border/40">
                        {[
                            { label: "Live Now", value: live.length, color: "text-red-400" },
                            { label: "Upcoming", value: upcoming.length, color: "text-blue-400" },
                            { label: "Finished", value: finished.length, color: "text-green-400" },
                        ].map(s => (
                            <div key={s.label}>
                                <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                                <div className="text-xs text-muted-foreground">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/50 w-fit">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 relative ${tab === t.key
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                                }`}
                        >
                            {t.label}
                            {t.key === "live" && live.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                    {live.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-14 h-14 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-muted-foreground animate-pulse text-sm">Fetching live cricket...</p>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-card/30 rounded-2xl border border-border/30 gap-4">
                        <Trophy className="w-12 h-12 text-muted-foreground/30" />
                        <h3 className="text-lg font-bold">
                            {tab === "live" ? "No Live Matches Right Now" : tab === "upcoming" ? "No Upcoming Matches" : "No Finished Matches"}
                        </h3>
                        <p className="text-sm text-muted-foreground text-center max-w-xs">
                            {tab === "live"
                                ? "Check back soon — matches update every 60 seconds."
                                : "Nothing scheduled here yet."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {visible.map(m => (
                            <MatchCard key={m.id} match={m} flashId={flashId} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LiveCricket;
