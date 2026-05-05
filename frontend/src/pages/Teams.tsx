import { useEffect, useState } from "react";
import { teamsAPI, favoritesAPI } from "@/api/endpoints";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Trophy, TrendingUp } from "lucide-react";
import { TeamCard } from "@/components/TeamCard";

interface Team {
  _id: string; name: string; shortName: string; logo: string; sport: string;
  players: number; matchesPlayed: number; wins: number;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [favoriteTeamIds, setFavoriteTeamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load teams first (strictly cricket)
        const teamsRes = await teamsAPI.getAll({ sport: 'cricket' });
        setTeams(teamsRes.data);

        // Try to load favorites (only if token exists in localStorage, to avoid unnecessary 401s)
        if (localStorage.getItem('token')) {
          try {
            const favoritesRes = await favoritesAPI.getAll();
            if (favoritesRes.data && favoritesRes.data.teams) {
              setFavoriteTeamIds(favoritesRes.data.teams.map((t: any) => t._id));
            }
          } catch (favError) {
            console.warn("Could not load favorites (likely not logged in or session expired)", favError);
          }
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFavoriteToggle = () => {
    // Refresh favorites to keep state in sync
    favoritesAPI.getAll().then(res => {
      setFavoriteTeamIds(res.data.teams.map((t: any) => t._id));
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-12 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Teams</h1>
              <p className="text-sm text-muted-foreground">Browse all cricket teams and their statistics</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card-glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Teams</p>
              </div>
              <p className="text-2xl font-bold font-mono">{teams.length}</p>
            </div>
            <div className="card-glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Players</p>
              </div>
              <p className="text-2xl font-bold font-mono">
                {teams.reduce((acc, t) => acc + (t.players || 0), 0)}
              </p>
            </div>
            <div className="card-glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Matches</p>
              </div>
              <p className="text-2xl font-bold font-mono">
                {teams.reduce((acc, t) => acc + (t.matchesPlayed || 0), 0)}
              </p>
            </div>
            <div className="card-glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</p>
              </div>
              <p className="text-2xl font-bold font-mono">
                {teams.length > 0
                  ? Math.round(
                    (teams.reduce((acc, t) => acc + (t.wins || 0), 0) /
                      teams.reduce((acc, t) => acc + (t.matchesPlayed || 1), 0)) * 100
                  )
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              isFavorite={favoriteTeamIds.includes(team._id)}
              onToggleFavorite={handleFavoriteToggle}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Teams;
