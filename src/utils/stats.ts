// src/utils/stats.ts

import type { Match } from "../api/types";

export interface AgentStats {
  agent: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number; // 0-100
}

/**
 * Aggregates win/loss counts per agent for a given player across a match list.
 * Matches where the player can't be found (shouldn't normally happen, but the
 * API can occasionally return incomplete data) are silently skipped.
 */
export function getWinRateByAgent(matches: Match[], playerName: string, playerTag: string): AgentStats[] {
  const statsByAgent = new Map<string, { wins: number; losses: number }>();

  for (const match of matches) {
    const player = match.players.all_players.find((p) => p.name.toLowerCase() === playerName.toLowerCase() && p.tag.toLowerCase() === playerTag.toLowerCase());
    if (!player) continue;

    const teamKey = player.team.toLowerCase() as "red" | "blue";
    const won = match.teams[teamKey]?.has_won ?? false;

    const current = statsByAgent.get(player.character) ?? { wins: 0, losses: 0 };
    if (won) {
      current.wins += 1;
    } else {
      current.losses += 1;
    }
    statsByAgent.set(player.character, current);
  }

  const result: AgentStats[] = Array.from(statsByAgent.entries()).map(([agent, { wins, losses }]) => {
    const gamesPlayed = wins + losses;
    return {
      agent,
      wins,
      losses,
      gamesPlayed,
      winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
    };
  });

  // Sort by games played descending, so the chart leads with the agents
  // the player actually has a meaningful sample size on — a 100% win rate
  // on 1 game is misleading next to a 55% win rate on 30 games.
  return result.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}

export interface MapStats {
  map: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number; // 0-100
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
}

/**
 * Aggregates win/loss and average KDA per map for a given player.
 */
export function getPerformanceByMap(matches: Match[], playerName: string, playerTag: string): MapStats[] {
  const statsByMap = new Map<string, { wins: number; losses: number; kills: number; deaths: number; assists: number }>();

  for (const match of matches) {
    const player = match.players.all_players.find((p) => p.name.toLowerCase() === playerName.toLowerCase() && p.tag.toLowerCase() === playerTag.toLowerCase());
    if (!player) continue;

    const teamKey = player.team.toLowerCase() as "red" | "blue";
    const won = match.teams[teamKey]?.has_won ?? false;
    const map = match.metadata.map;

    const current = statsByMap.get(map) ?? { wins: 0, losses: 0, kills: 0, deaths: 0, assists: 0 };
    if (won) {
      current.wins += 1;
    } else {
      current.losses += 1;
    }
    current.kills += player.stats.kills;
    current.deaths += player.stats.deaths;
    current.assists += player.stats.assists;
    statsByMap.set(map, current);
  }

  const result: MapStats[] = Array.from(statsByMap.entries()).map(([map, { wins, losses, kills, deaths, assists }]) => {
    const gamesPlayed = wins + losses;
    return {
      map,
      wins,
      losses,
      gamesPlayed,
      winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
      avgKills: gamesPlayed > 0 ? Math.round((kills / gamesPlayed) * 10) / 10 : 0,
      avgDeaths: gamesPlayed > 0 ? Math.round((deaths / gamesPlayed) * 10) / 10 : 0,
      avgAssists: gamesPlayed > 0 ? Math.round((assists / gamesPlayed) * 10) / 10 : 0,
    };
  });

  return result.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}
