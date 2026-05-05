import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { playerAPI } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Ruler, Info, Loader2, Facebook, Twitter, Instagram, User, Trash2 } from "lucide-react";

interface PlayerData {
    id: string;
    name: string;
    fullName: string;
    dob: string;
    birthLocation: string;
    nationality: string;
    height: string;
    sport: string;
    team: string;
    position: string;
    thumb: string;
    banner: string;
    description: string;
    facebook: string;
    twitter: string;
    instagram: string;
}

const POPULAR_PLAYERS = [
    "Virat Kohli", "Rohit Sharma", "MS Dhoni",
    "Ben Stokes", "Pat Cummins"
];

const PlayerStats = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("name") || "");
    const [loading, setLoading] = useState(false);
    const [player, setPlayer] = useState<PlayerData | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const nameParam = searchParams.get("name");
        if (nameParam) {
            searchPlayer(nameParam);
        }
    }, [searchParams]);

    const searchPlayer = async (name: string) => {
        if (!name.trim()) return;
        setLoading(true);
        setError("");
        setPlayer(null);
        setQuery(name); // sync input if clicked from popular
        try {
            const res = await playerAPI.search(name.trim());
            setPlayer(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Player not found. Try a different name.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <main className="container py-8 space-y-8">
                {/* Hero */}
                <div className="space-y-2 text-center sm:text-left">
                    <h1 className="text-4xl sm:text-5xl font-bold">
                        Player <span className="text-gradient">Profiles</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Search for your favorite cricket athletes and legends
                    </p>
                </div>

                {/* Search */}
                <div className="card-glass rounded-xl p-6 space-y-4 max-w-2xl mx-auto sm:mx-0">
                    <form
                        onSubmit={(e) => { e.preventDefault(); searchPlayer(query); }}
                        className="flex gap-3"
                    >
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter player name (e.g. Virat Kohli)"
                            className="bg-secondary/50 flex-1"
                        />
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Search
                        </Button>
                    </form>

                    {/* Popular Players */}
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start items-center">
                        <span className="text-xs text-muted-foreground self-center">Popular:</span>
                        {POPULAR_PLAYERS.map((name) => (
                            <button
                                key={name}
                                onClick={() => searchPlayer(name)}
                                className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors border border-border/50"
                            >
                                {name}
                            </button>
                        ))}
                        
                        {(player || query) && (
                            <button
                                onClick={() => { setPlayer(null); setQuery(""); setError(""); setSearchParams({}); }}
                                className="text-xs px-3 py-1.5 rounded-full text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 font-bold"
                            >
                                <Trash2 className="w-3 h-3" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="card-glass rounded-xl p-6 text-center text-destructive animate-slide-up max-w-2xl">
                        <p>{error}</p>
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && !player && (
                    <div className="flex justify-center py-12">
                        <div className="space-y-4 text-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-muted-foreground">Searching TheSportsDB...</p>
                        </div>
                    </div>
                )}

                {/* Player Profile */}
                {player && !loading && (
                    <div className="animate-slide-up space-y-6">
                        {/* Banner & Header */}
                        <div className="relative rounded-xl overflow-hidden card-glass border-0">
                            {/* Banner Image */}
                            <div className="h-48 sm:h-64 bg-secondary">
                                {player.banner ? (
                                    <img src={player.banner} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/5" />
                                )}
                            </div>

                            {/* Profile Info Overlay */}
                            <div className="relative px-6 pb-6 mt-[-4rem] flex flex-col sm:flex-row items-center sm:items-end gap-6">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-background bg-secondary overflow-hidden shadow-xl shrink-0">
                                    {player.thumb ? (
                                        <img src={player.thumb} alt={player.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                            <span className="text-4xl">?</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-center sm:text-left space-y-1 pb-2">
                                    <h2 className="text-3xl font-bold">{player.name}</h2>
                                    <p className="text-primary font-medium text-lg flex items-center justify-center sm:justify-start gap-2">
                                        {player.team} • {player.sport}
                                    </p>

                                    {/* Social Links */}
                                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                                        {player.facebook && (
                                            <a href={`https://${player.facebook}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#1877F2] transition-colors" aria-label="Facebook">
                                                <Facebook className="w-5 h-5" />
                                            </a>
                                        )}
                                        {player.twitter && (
                                            <a href={`https://${player.twitter}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#1DA1F2] transition-colors" aria-label="Twitter">
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                        )}
                                        {player.instagram && (
                                            <a href={`https://${player.instagram}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#E4405F] transition-colors" aria-label="Instagram">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Info Sidebar */}
                            <div className="space-y-6">
                                <div className="card-glass rounded-xl p-6 space-y-4">
                                    <h3 className="font-bold border-b border-border/50 pb-2">Personal Details</h3>

                                    <div className="space-y-4">
                                        {player.dob && (
                                            <div className="flex items-start gap-3">
                                                <Calendar className="w-4 h-4 text-primary mt-1" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Born</p>
                                                    <p className="font-medium">{player.dob}</p>
                                                </div>
                                            </div>
                                        )}
                                        {player.birthLocation && (
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-4 h-4 text-primary mt-1" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Location</p>
                                                    <p className="font-medium">{player.birthLocation}</p>
                                                    <p className="text-xs text-muted-foreground">{player.nationality}</p>
                                                </div>
                                            </div>
                                        )}
                                        {player.height && (
                                            <div className="flex items-start gap-3">
                                                <Ruler className="w-4 h-4 text-primary mt-1" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Height</p>
                                                    <p className="font-medium">{player.height}</p>
                                                </div>
                                            </div>
                                        )}
                                        {player.position && (
                                            <div className="flex items-start gap-3">
                                                <Info className="w-4 h-4 text-primary mt-1" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Position</p>
                                                    <p className="font-medium">{player.position}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bio Content */}
                            <div className="lg:col-span-2">
                                <div className="card-glass rounded-xl p-6 space-y-4">
                                    <h3 className="font-bold border-b border-border/50 pb-2 flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Biography
                                    </h3>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                        {player.description ? (
                                            player.description.split('\n').map((para, i) => (
                                                <p key={i} className="mb-4 leading-relaxed">{para}</p>
                                            ))
                                        ) : (
                                            <p className="italic">No biography available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PlayerStats;
