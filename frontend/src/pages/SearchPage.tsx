import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchAPI } from "@/api/endpoints";
import { Search, Trophy, Users as UsersIcon, Clock, CheckCircle2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MatchCard } from "@/components/MatchCard";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (queryParam) {
      performSearch(queryParam);
    }
  }, [queryParam]);

  const performSearch = async (q: string) => {
    try {
      setLoading(true);
      const res = await searchAPI.search(q);
      setResults(res.data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (val.length > 2) {
      setSearchParams({ q: val });
    } else if (val === "") {
      setSearchParams({});
      setResults(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 space-y-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-center mb-8">
            FIND <span className="text-primary">EVERYTHING</span>
          </h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search teams, matches, players, tournaments..."
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 bg-secondary/30 text-lg h-14 rounded-2xl border-border/50 focus:border-primary/50 transition-all shadow-xl"
              autoFocus
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Scanning the database...</p>
          </div>
        ) : results ? (
          <div className="space-y-12">
            {/* Live Matches */}
            {results.live?.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-live pl-4">
                  <Clock className="w-5 h-5 text-live" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Live Matches</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.live.map((m: any) => (
                    <MatchCard key={m._id} match={m} isFav={false} onToggleFav={() => {}} />
                  ))}
                </div>
              </section>
            )}

            {/* Teams */}
            {results.teams?.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-primary pl-4">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Teams</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.teams.map((t: any) => (
                    <div
                      key={t._id}
                      onClick={() => navigate(`/team/${t._id}`)}
                      className="card-glass rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {t.logo || "🏏"}
                      </div>
                      <div>
                        <p className="font-bold">{t.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">{t.sport}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Players */}
            {results.players?.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-purple-500 pl-4">
                  <User className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Players</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.players.map((p: any) => (
                    <div
                      key={p._id}
                      onClick={() => navigate(`/player/${p._id}`)}
                      className="card-glass rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-purple-500/50 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.role || "Player"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Finished Matches */}
            {results.finished?.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-green-500 pl-4">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Finished Matches</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                  {results.finished.map((m: any) => (
                    <MatchCard key={m._id} match={m} isFav={false} onToggleFav={() => {}} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Matches */}
            {results.upcoming?.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-4">
                  <Trophy className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Upcoming</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.upcoming.map((m: any) => (
                    <MatchCard key={m._id} match={m} isFav={false} onToggleFav={() => {}} />
                  ))}
                </div>
              </section>
            )}

            {Object.values(results).every((arr: any) => !arr || arr.length === 0) && (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold">No matches found for "{query}"</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try searching for a different team, player, or tournament.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <Search className="w-16 h-16 text-muted-foreground/20 mx-auto" />
            <p className="text-muted-foreground">Type at least 3 characters to start searching...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
