// src/api/types.ts
// Types for the HenrikDev v3 matches response.

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

export type Region = "ap" | "na" | "latam" | "br" | "eu" | "kr";
