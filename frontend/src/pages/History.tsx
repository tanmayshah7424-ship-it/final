import { useEffect, useState } from "react";

import { matchesAPI } from "@/api/endpoints";
import { useNavigate } from "react-router-dom";
import { Clock, Trophy } from "lucide-react";

const History = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    matchesAPI.getAll({ status: "completed", sport: "cricket" })
      .then((res) => setMatches(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Match History</h1>
            <p className="text-sm text-muted-foreground">Past completed matches</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No completed matches yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <div
                key={m._id}
                onClick={() => navigate(`/match/${m._id}`)}
                className="card-glass rounded-xl p-4 cursor-pointer hover:glow transition-all flex items-center gap-4"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xl">{m.teamA?.logo}</span>
                  <span className="font-semibold">{m.teamA?.shortName}</span>
                  <span className="font-mono font-bold mx-2">{m.scoreA} - {m.scoreB}</span>
                  <span className="font-semibold">{m.teamB?.shortName}</span>
                  <span className="text-xl">{m.teamB?.logo}</span>
                </div>
                <span className="text-xs text-muted-foreground">{m.tournament}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
