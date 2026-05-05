export type Sport = "cricket";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  sport: Sport;
  players?: number;
  matchesPlayed?: number;
  wins?: number;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  role: string;
  sport: Sport;
  stats: Record<string, number | string>;
}

export interface Match {
  id: string;
  sport: Sport;
  tournament: string;
  status: "live" | "upcoming" | "completed";
  venue: string;
  date: string;
  teamA: Team;
  teamB: Team;
  scoreA: string;
  scoreB: string;
  summary: string;
  overs?: string;
  minute?: string;
}

export interface ScoreEvent {
  id: string;
  matchId: string;
  timestamp: string;
  description: string;
  type: "run" | "wicket" | "boundary" | "six";
  value: number;
}
