import { ScoreEvent } from "@/types/sports";
import { cn } from "@/lib/utils";

const eventColors: Record<string, string> = {
  six: "border-l-primary text-primary",
  boundary: "border-l-primary text-primary",
  wicket: "border-l-live text-live",
  run: "border-l-border text-foreground",
};

export function ScoreTimeline({ events }: { events: ScoreEvent[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Ball-by-Ball Commentary
      </h3>
      {events.map((event) => (
        <div
          key={event.id}
          className={cn(
            "card-glass rounded-md p-3 border-l-4 animate-slide-up stagger-item",
            eventColors[event.type] || "border-l-border"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-xs text-muted-foreground">{event.timestamp}</span>
            {event.value > 0 && (
              <span className={cn("font-mono font-bold text-sm", eventColors[event.type]?.split(" ")[1])}>
                +{event.value}
              </span>
            )}
          </div>
          <p className="text-sm">{event.description}</p>
        </div>
      ))}
    </div>
  );
}
