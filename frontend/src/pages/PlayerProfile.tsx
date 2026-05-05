import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { playersAPI } from "@/api/endpoints";
import { ArrowLeft, User, MapPin, Calendar, Activity } from "lucide-react";
import { PlayerBioCard } from "@/components/PlayerBioCard";
import { supabase } from "@/integrations/supabase/client";

const PlayerProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [player, setPlayer] = useState<any>(null);
    const [wikiData, setWikiData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch MongoDB data
                const res = await playersAPI.getById(id);
                setPlayer(res.data);

                // Fetch Supabase Enrichment
                const { data: sbData } = await supabase
                    .from("players")
                    .select("description, short_description, image_url")
                    .eq("id", id)
                    .single();

                if (sbData) setWikiData(sbData as any);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch player data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <main className="container py-12 flex justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </main>
            </div>
        );
    }

    if (error || !player) {
        return (
            <div className="min-h-screen bg-background">
                <main className="container py-12 text-center text-muted-foreground">
                    <p>{error || "Player not found"}</p>
                    <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">
                        Go Back
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container py-6 space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                {/* Profile Header */}
                <div className="card-glass rounded-xl p-6 sm:p-8 animate-slide-up">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-32 h-32 rounded-full bg-secondary overflow-hidden shrink-0 border-4 border-background shadow-lg">
                            {(wikiData?.image_url || player.playerImg) ? (
                                <img src={wikiData?.image_url || player.playerImg} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <User className="w-12 h-12" />
                                </div>
                            )}
                        </div>
                        <div className="text-center sm:text-left space-y-2">
                            <h1 className="text-3xl font-bold">{player.name}</h1>
                            {wikiData?.short_description && (
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                                    {wikiData.short_description}
                                </p>
                            )}
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-muted-foreground">
                                {player.country && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" /> {player.country}
                                    </span>
                                )}
                                {player.dateOfBirth && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" /> {new Date(player.dateOfBirth).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                                    {player.role || "Player"}
                                </span>
                                {player.battingStyle && (
                                    <span className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-xs">
                                        🏏 {player.battingStyle}
                                    </span>
                                )}
                                {player.bowlingStyle && (
                                    <span className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-xs">
                                        ⚾ {player.bowlingStyle}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Biography Section (Supabase Managed with MongoDB Fallback) */}
                <PlayerBioCard 
                    playerId={id || ""} 
                    initialData={wikiData || (player.biography ? { description: player.biography, short_description: null, image_url: player.playerImg } : undefined)} 
                    hideHeaderInfo={true} 
                />

                {/* Stats Grid */}
                {player.stats && player.stats.length > 0 ? (
                    <div className="space-y-4 animate-slide-up delay-100">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Career Stats
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {player.stats.map((stat: any, idx: number) => (
                                <div key={idx} className="card-glass rounded-xl p-5 hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-lg">{stat.matchType?.toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">{stat.fn} matches</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${stat.statType === "batting" ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"}`}>
                                            {stat.statType}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        {stat.statType === "batting" ? (
                                            <>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Runs</p>
                                                    <p className="font-bold">{stat.runs}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">HS</p>
                                                    <p className="font-bold">{stat.hs}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Avg</p>
                                                    <p className="font-bold">{stat.avg}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">100s</p>
                                                    <p className="font-bold">{stat["100s"]}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">50s</p>
                                                    <p className="font-bold">{stat["50s"]}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Wickets</p>
                                                    <p className="font-bold">{stat.wickets}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Best</p>
                                                    <p className="font-bold">{stat.bbm || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Econ</p>
                                                    <p className="font-bold">{stat.econ}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Avg</p>
                                                    <p className="font-bold">{stat.avg}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">5w</p>
                                                    <p className="font-bold">{stat["5w"]}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No stats available for this player.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PlayerProfile;
