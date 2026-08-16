// src/api/types.ts
// Types for the HenrikDev v3 matches response.
// Trimmed to the fields we actually use for the visualizer —
// the real response has more fields (economy, damage events, etc.)
// Extend this as you add features that need more data.

export interface MatchPlayer {
  puuid: string;
  name: string;
  tag: string;
  team: "Red" | "Blue";
  character: string; // agent name, e.g. "Jett"
  stats: {
    score: number;
    kills: number;
    deaths: number;
    assists: number;
  };
  currenttier_patched: string; // e.g. "Gold 2"
}

export interface MatchTeam {
  has_won: boolean;
  rounds_won: number;
  rounds_lost: number;
}

export interface MatchMetadata {
  matchid: string;
  map: string;
  game_start: number; // unix timestamp
  game_length: number; // seconds
  mode: string;
  rounds_played: number;
}

export interface Match {
  metadata: MatchMetadata;
  players: {
    all_players: MatchPlayer[];
  };
  teams: {
    red: MatchTeam;
    blue: MatchTeam;
  };
}

export interface MatchHistoryResponse {
  status: number;
  data: Match[];
}

export interface ApiErrorResponse {
  error: string;
  status?: number;
}

export interface MmrHistoryEntry {
  currenttier: number;
  currenttier_patched: string; // e.g. "Gold 1"
  match_id: string;
  map: {
    name: string;
    id: string;
  };
  ranking_in_tier: number; // RR within the tier, 0-100
  mmr_change_to_last_game: number;
  elo: number;
  date: string; // human-readable
  date_raw: number; // unix timestamp
}

export interface MmrHistoryResponse {
  status: number;
  name: string;
  tag: string;
  data: MmrHistoryEntry[];
}

export type Region = "ap" | "na" | "latam" | "br" | "eu" | "kr";
