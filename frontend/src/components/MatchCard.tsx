import { Match } from "@/types/sports";
import { StatusBadge } from "./LiveBadge";
import { FavoriteButton } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MatchCardProps {
  match: Match;
  isFav: boolean;
  onToggleFav: (id: string) => void;
}

const sportColors: Record<string, string> = {
  cricket: "border-l-sport-cricket",
};

export function MatchCard({ match, isFav, onToggleFav }: MatchCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/match/${match.id}`)}
      className={cn(
        "card-glass rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-l-4 animate-slide-up",
        sportColors[match.sport] || "border-l-primary",
        match.status === "live" && "ring-1 ring-live/20 bg-live/5"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={match.status} />
          <span className="text-xs text-muted-foreground">{match.tournament}</span>
        </div>
        <FavoriteButton id={match.id} isFav={isFav} onToggle={onToggleFav} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
              {match.teamA.logo?.startsWith('http') ? (
                <img src={match.teamA.logo} alt={match.teamA.shortName} className="w-full h-full object-contain" />
              ) : (
                <span className="text-lg">{match.teamA.logo || "🛡️"}</span>
              )}
            </div>
            <span className="font-semibold text-lg">{match.teamA.shortName}</span>
          </div>
          <span className={cn("font-mono font-bold text-xl tracking-tight", match.status === "live" && "text-primary animate-pulse")}>
            {match.scoreA}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
              {match.teamB.logo?.startsWith('http') ? (
                <img src={match.teamB.logo} alt={match.teamB.shortName} className="w-full h-full object-contain" />
              ) : (
                <span className="text-lg">{match.teamB.logo || "🛡️"}</span>
              )}
            </div>
            <span className="font-semibold text-lg">{match.teamB.shortName}</span>
          </div>
          <span className={cn("font-mono font-bold text-xl tracking-tight", match.status === "live" && "text-primary animate-pulse")}>
            {match.scoreB}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground truncate">{match.summary}</p>
      {
        match.venue && (
          <p className="mt-1 text-xs text-muted-foreground/60 truncate">{match.venue}</p>
        )
      }
    </div >
  );
}
