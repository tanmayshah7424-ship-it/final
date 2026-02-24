import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { favoritesAPI } from "@/api/endpoints";
import { useToast } from "@/hooks/use-toast";

interface TeamCardProps {
    team: any;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

export function TeamCard({ team, isFavorite: initialIsFavorite = false, onToggleFavorite }: TeamCardProps) {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const { toast } = useToast();

    // specific useEffect to sync state if prop changes (e.g. from parent re-fetch)
    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await favoritesAPI.toggleTeam(team._id);
            setIsFavorite(res.data.favorited);

            toast({
                title: res.data.favorited ? "Added to Favorites" : "Removed from Favorites",
                description: `${team.name} has been ${res.data.favorited ? "added to" : "removed from"} your favorites.`,
            });

            if (onToggleFavorite) {
                onToggleFavorite();
            }
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            toast({
                title: "Error",
                description: "Failed to update favorites",
                variant: "destructive",
            });
        }
    };

    return (
        <div
            onClick={() => navigate(`/team/${team._id}`)}
            className="card-glass rounded-xl p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:glow group animate-slide-up relative"
        >
            <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <Heart
                    className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                        }`}
                />
            </button>

            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform overflow-hidden">
                    {team.logo?.startsWith('http') ? (
                        <img src={team.logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                        team.logo || "🛡️"
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team.shortName}</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Matches</span>
                    <span className="font-semibold font-mono">{team.matchesPlayed || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Wins</span>
                    <span className="font-semibold font-mono text-green-500">{team.wins || 0}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Win Rate</span>
                    <span className="font-bold">
                        {team.matchesPlayed ? Math.round(((team.wins || 0) / team.matchesPlayed) * 100) : 0}%
                    </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-green-400 transition-all duration-500"
                        style={{ width: `${team.matchesPlayed ? ((team.wins || 0) / team.matchesPlayed) * 100 : 0}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
