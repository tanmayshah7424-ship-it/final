import { useEffect, useState } from "react";

import { matchesAPI } from "@/api/endpoints";
import { useSocket } from "@/contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import { Activity, Calendar, Trophy, Clock, Filter } from "lucide-react";

interface TeamRef {
  _id: string; name: string; shortName: string; logo: string; sport: string;
}
interface Match {
  _id: string; sport: string; tournament: string; status: string; venue: string;
  date: string; teamA: TeamRef; teamB: TeamRef; scoreA: string; scoreB: string;
  summary: string; overs?: string; minute?: string;
}

const statusTabs = [
  { key: "", label: "All", icon: Activity },
  { key: "live", label: "Live", icon: Activity },
  { key: "upcoming", label: "Upcoming", icon: Calendar },
  { key: "completed", label: "Completed", icon: Trophy },
];

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("live");
  const { socket } = useSocket();
  const navigate = useNavigate();

  const fetchMatches = async () => {
    try {
      const params: any = { sport: "cricket" };
      if (statusFilter) params.status = statusFilter;
      const res = await matchesAPI.getAll(params);
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMatches();
  }, [statusFilter]);

  useEffect(() => {
    if (!socket) return;
    socket.on("score:update", fetchMatches);
    socket.on("match:status", fetchMatches);
    return () => {
      socket.off("score:update", fetchMatches);
      socket.off("match:status", fetchMatches);
    };
  }, [socket, statusFilter]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Matches</h1>
            <p className="text-sm text-muted-foreground">All cricket matches</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No matches found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <div
                key={match._id}
                onClick={() => navigate(`/match/${match._id}`)}
                className="card-glass rounded-xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:glow animate-slide-up"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">{match.tournament}</span>
                  {match.status === "live" && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-live">
                      <span className="w-2 h-2 rounded-full bg-live animate-live-pulse" />
                      LIVE
                    </span>
                  )}
                  {match.status === "upcoming" && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(match.date).toLocaleDateString()}
                    </span>
                  )}
                  {match.status === "completed" && (
                    <span className="text-xs text-muted-foreground">FINISHED</span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform">
                    <div className="flex items-center gap-3">
                      {match.teamA?.logo?.startsWith('http') ? (
                        <img src={match.teamA.logo} alt="" className="w-8 h-8 rounded-sm object-contain shrink-0" />
                      ) : (
                        <span className="text-2xl shrink-0">{match.teamA?.logo || '🏟️'}</span>
                      )}
                      <span className="font-semibold">{match.teamA?.shortName || 'TBD'}</span>
                    </div>
                    <span className="font-mono font-bold text-lg">{match.scoreA}</span>
                  </div>
                  <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform">
                    <div className="flex items-center gap-3">
                      {match.teamB?.logo?.startsWith('http') ? (
                        <img src={match.teamB.logo} alt="" className="w-8 h-8 rounded-sm object-contain shrink-0" />
                      ) : (
                        <span className="text-2xl shrink-0">{match.teamB?.logo || '🏟️'}</span>
                      )}
                      <span className="font-semibold">{match.teamB?.shortName || 'TBD'}</span>
                    </div>
                    <span className="font-mono font-bold text-lg">{match.scoreB}</span>
                  </div>
                </div>

                {match.summary && (
                  <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">{match.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Matches;
