import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Clock } from "lucide-react";

interface TeamRef {
  _id: string;
  name: string;
  shortName: string;
  logo: string;
  sport: string;
}

interface Match {
  _id: string;
  sport: string;
  tournament: string;
  status: string;
  venue: string;
  date: string;
  teamA: TeamRef;
  teamB: TeamRef;
  scoreA: string;
  scoreB: string;
  summary: string;
  overs?: string;
  minute?: string;
}

// TheSportsDB external match shape
interface ExternalMatch {
  id: string;
  sport: string;
  tournament: string;
  status: string;
  venue: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  homeBadge: string;
  awayBadge: string;
  source: string;
}

const sportColors: Record<string, string> = {
  cricket: "bg-sport-cricket/10 text-sport-cricket border-sport-cricket/30"
};

import { useMatches } from "@/hooks/useMatches";

const Index = () => {
  const { 
    liveMatches: rawLive, 
    upcomingMatches: rawUpcoming, 
    completedMatches: rawCompleted, 
    externalMatches: rawExternal, 
    loading 
  } = useMatches();

  // Strict Cricket Filter
  const liveMatches = rawLive.filter(m => (m.sport || 'cricket') === 'cricket');
  const upcomingMatches = rawUpcoming.filter(m => (m.sport || 'cricket') === 'cricket');
  const completedMatches = rawCompleted.filter(m => (m.sport || 'cricket') === 'cricket');
  const externalMatches = rawExternal.filter(m => (m.sport || 'cricket') === 'cricket');
  const [activeSport, setActiveSport] = useState("all");
  const navigate = useNavigate();

  // Socket logic is now handled inside useMatches hook!

  // Local match card (for admin-created matches)
  const MatchCard = ({ match }: { match: Match }) => (
    <div
      onClick={() => navigate(`/match/${match._id}`)}
      className="card-glass rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group animate-slide-up relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full border ${sportColors[match.sport || ''] || ""}`}>
          {(match.sport || 'unknown').toUpperCase()}
        </span>
        {match.status === 'live' ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-live animate-live-pulse" />
            <span className="text-xs font-bold text-live tracking-wide">LIVE</span>
          </div>
        ) : match.status === 'upcoming' ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Upcoming</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Finished</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {match.teamA?.logo?.startsWith('http') ? (
              <img src={match.teamA.logo} alt="" className="w-10 h-10 rounded-sm object-contain shrink-0" />
            ) : (
              <span className="text-4xl filter drop-shadow-md shrink-0">{match.teamA?.logo || '🏟️'}</span>
            )}
            <span className="font-semibold text-lg tracking-tight truncate">
              {match.teamA?.shortName?.startsWith('http') ? (match.teamA?.name || 'TBD') : (match.teamA?.shortName || 'TBD')}
            </span>
          </div>
          <span className="font-mono font-bold text-xl sm:text-2xl text-primary animate-score-pop text-right whitespace-nowrap">
            {match.scoreA}
          </span>
        </div>
        <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform delay-75 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {match.teamB?.logo?.startsWith('http') ? (
              <img src={match.teamB.logo} alt="" className="w-10 h-10 rounded-sm object-contain shrink-0" />
            ) : (
              <span className="text-4xl filter drop-shadow-md shrink-0">{match.teamB?.logo || '🏟️'}</span>
            )}
            <span className="font-semibold text-lg tracking-tight truncate">
              {match.teamB?.shortName?.startsWith('http') ? (match.teamB?.name || 'TBD') : (match.teamB?.shortName || 'TBD')}
            </span>
          </div>
          <span className="font-mono font-bold text-xl sm:text-2xl text-primary text-right whitespace-nowrap">
            {match.scoreB}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground/80">
        <p className="font-medium truncate max-w-[70%]">{match.tournament}</p>
        <p>{match.status === 'live' ? (match.overs || match.minute || "Live") : match.status === 'upcoming' ? new Date(match.date).toLocaleDateString() : "Finished"}</p>
      </div>
    </div>
  );

  // External match card (TheSportsDB + CricAPI data)
  const ExternalMatchCard = ({ match }: { match: ExternalMatch }) => {
    const sportBadge = { label: "🏏 CRICKET", classes: sportColors.cricket || "bg-orange-500/10 text-orange-400 border-orange-400/30" };

    // CricAPI images are direct URLs; TheSportsDB images support /tiny suffix
    const badgeUrl = (url: string) => {
      if (!url) return "";
      if (match.source === "thesportsdb") return url + "/tiny";
      return url;
    };

    return (
      <div
        onClick={() => navigate(`/match/${match.id}`)}
        className="card-glass rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer animate-slide-up relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full border ${sportBadge.classes}`}>
            {sportBadge.label}
          </span>
          {match.status === 'live' ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-live animate-live-pulse" />
              <span className="text-xs font-bold text-live tracking-wide">LIVE</span>
            </div>
          ) : match.status === 'upcoming' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Upcoming</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Finished</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between hover:translate-x-1 transition-transform gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-4xl shrink-0">🏏</span>
              <span className="font-semibold text-lg tracking-tight truncate">{match.homeTeam || 'TBD'}</span>
            </div>
            <span className="font-mono font-bold text-xl sm:text-2xl text-primary animate-score-pop text-right whitespace-nowrap">
              {match.homeScore}
            </span>
          </div>
          <div className="flex items-center justify-between hover:translate-x-1 transition-transform delay-75 gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-4xl shrink-0">🏏</span>
              <span className="font-semibold text-lg tracking-tight truncate">{match.awayTeam || 'TBD'}</span>
            </div>
            <span className="font-mono font-bold text-xl sm:text-2xl text-primary text-right whitespace-nowrap">
              {match.awayScore}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground/80">
          <p className="font-medium truncate max-w-[70%]">{match.tournament}</p>
          <p>{match.status === 'live' ? 'Live' : match.status === 'upcoming' ? (match.time ? match.time.slice(0, 5) : 'Upcoming') : 'Finished'}</p>
        </div>
      </div>
    );
  };

  // Filter for LIVE matches only
  const visibleLiveLocal = liveMatches;
  const visibleLiveExternal = externalMatches.filter((m) => m.status === "live");

  // De-duplication Logic
  const uniqueKeys = new Set();
  const filteredLocal: Match[] = [];
  const filteredExternal: ExternalMatch[] = [];

  // 1. Process Local matches first (they have priority)
  visibleLiveLocal.forEach((m) => {
    const key = `${m.sport}-${m.teamA?.name || 'TBD'}-${m.teamB?.name || 'TBD'}`.toLowerCase().replace(/\s+/g, '');
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      filteredLocal.push(m);
    }
  });

  // 2. Process External matches, checking against existing keys
  visibleLiveExternal.forEach((m) => {
    // Normalize external names to match local format
    const key = `${m.sport}-${m.homeTeam}-${m.awayTeam}`.toLowerCase().replace(/\s+/g, '');

    // Also try swapping teams (Home vs Away order might differ)
    const reverseKey = `${m.sport}-${m.awayTeam}-${m.homeTeam}`.toLowerCase().replace(/\s+/g, '');

    if (!uniqueKeys.has(key) && !uniqueKeys.has(reverseKey)) {
      uniqueKeys.add(key);
      filteredExternal.push(m);
    }
  });

  const hasLiveMatches = filteredLocal.length > 0 || filteredExternal.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Finding live action...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 space-y-12">
        {/* Dynamic Hero Section */}
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-border shadow-2xl min-h-[400px] flex items-center group">
          {/* Background Image with Hover Zoom */}
          <img 
            src="/assets/cricket-hero.png"
            alt="Cricket Hero"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          {/* Sophisticated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          
          <div className="relative z-10 space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-live/20 backdrop-blur-md border border-live/30 text-live text-xs font-black flex items-center gap-2 tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
                </span>
                Live Intelligence
              </span>
              <span className="text-white/70 text-sm font-semibold tracking-wide">
                {visibleLiveLocal.length + visibleLiveExternal.length} Matches In Progress
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic italic-shaping">
                Cricket <span className="text-primary italic-none not-italic">Hub</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed max-w-lg">
                The ultimate destination for live cricket intelligence. Real-time scores and AI-driven match analysis.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={() => navigate('/matches')} className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                Watch Live
              </button>
              <button onClick={() => navigate('/player-stats')} className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all">
                Player Stats
              </button>
            </div>
          </div>
        </div>

        {/* Live Matches Grid */}
        <div className="space-y-8">
          {!hasLiveMatches ? (
            <div className="text-center py-20 bg-card/30 rounded-3xl border border-white/5 mx-auto max-w-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Live Matches</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                The arena is quiet right now. Check back later or browse upcoming matches below.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Render Local Live Matches */}
              {filteredLocal
                .map((match) => (
                  <MatchCard key={match._id} match={match} />
                ))}

              {/* Render External Live Matches */}
              {filteredExternal
                .map((match) => (
                  <ExternalMatchCard key={match.id} match={match} />
                ))}
            </div>
          )}
        </div>

        {/* Upcoming Matches */}
        <div className="space-y-6 animate-slide-up delay-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Upcoming Matches
            </h2>
            <button onClick={() => navigate('/matches')} className="text-sm text-primary hover:underline">
              View Schedule
            </button>
          </div>

          {(() => {
            // Merge DB upcoming + external upcoming (cricket)
            const externalUpcoming = externalMatches.filter((m: any) => m.status === 'upcoming');
            const allUpcomingRaw = [...upcomingMatches, ...externalUpcoming];

            // De-duplicate upcoming matches and filter out those already in Live section
            const visibleUpcoming: any[] = [];
            const upcomingKeys = new Set(uniqueKeys); // Initialize with keys from live matches

            allUpcomingRaw.forEach((m: any) => {
              const isExternal = m.source === 'cricapi' || m.source === 'thesportsdb' || !!m.externalProvider;
              const home = isExternal ? (m.homeTeam || m.teamA?.name) : m.teamA?.name;
              const away = isExternal ? (m.awayTeam || m.teamB?.name) : m.teamB?.name;
              const homeLogo = isExternal ? (m.homeBadge || m.teamA?.logo) : m.teamA?.logo;
              const awayLogo = isExternal ? (m.awayBadge || m.teamB?.logo) : m.teamB?.logo;

              // If it's a local match (not from external API), ensure we have populated teams
              if (!m.externalProvider && !m.source && (typeof m.teamA === 'string' || typeof m.teamB === 'string')) {
                return null;
              }
              const key = `${m.sport}-${home || 'TBD'}-${away || 'TBD'}`.toLowerCase().replace(/\s+/g, '');
              const reverseKey = `${m.sport}-${away || 'TBD'}-${home || 'TBD'}`.toLowerCase().replace(/\s+/g, '');

              if (!upcomingKeys.has(key) && !upcomingKeys.has(reverseKey)) {
                upcomingKeys.add(key);
                visibleUpcoming.push(m);
              }
            });

            return visibleUpcoming.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-secondary/10 rounded-xl">
                <p>No upcoming matches scheduled.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleUpcoming.map((match: any) => (
                  match.source === 'cricapi' || match.source === 'thesportsdb' ? (
                    <ExternalMatchCard key={match.id} match={match} />
                  ) : (
                    <MatchCard key={match._id} match={match} />
                  )
                ))}
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
};

export default Index;
