// src/utils/stats.ts

import type { Match } from "../api/types";
import { getAgentRole } from "./agentRoles";

// Only actual competitive/unrated maps — excludes deathmatch arenas like
// "Skirmish A/B", "The Range", etc. that HenrikDev reports as a "map" for
// non-standard modes but that don't belong in a map performance breakdown.
const REAL_MAPS = new Set(["Ascent", "Bind", "Breeze", "Fracture", "Haven", "Icebox", "Lotus", "Pearl", "Split", "Sunset", "Abyss", "Corrode"]);

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
    const player = match.players?.all_players?.find((p) => p.name.toLowerCase() === playerName.toLowerCase() && p.tag.toLowerCase() === playerTag.toLowerCase());
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
    const player = match.players?.all_players?.find((p) => p.name.toLowerCase() === playerName.toLowerCase() && p.tag.toLowerCase() === playerTag.toLowerCase());
    if (!player) continue;

    const map = match.metadata.map;
    if (!REAL_MAPS.has(map)) continue;

    const teamKey = player.team.toLowerCase() as "red" | "blue";
    const won = match.teams[teamKey]?.has_won ?? false;

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

export interface RoleBreakdown {
  role: string;
  gamesPlayed: number;
  percentage: number; // 0-100, share of total games
}

/**
 * Aggregates games played by role (Duelist/Controller/Initiator/Sentinel)
 * using the agent-to-role lookup, since HenrikDev's match data doesn't
 * include role directly.
 */
export function getRoleBreakdown(matches: Match[], playerName: string, playerTag: string): RoleBreakdown[] {
  const gamesByRole = new Map<string, number>();
  let totalGames = 0;

  for (const match of matches) {
    const player = match.players?.all_players?.find((p) => p.name.toLowerCase() === playerName.toLowerCase() && p.tag.toLowerCase() === playerTag.toLowerCase());
    if (!player) continue;

    const role = getAgentRole(player.character);
    gamesByRole.set(role, (gamesByRole.get(role) ?? 0) + 1);
    totalGames += 1;
  }

  return Array.from(gamesByRole.entries())
    .map(([role, gamesPlayed]) => ({
      role,
      gamesPlayed,
      percentage: totalGames > 0 ? Math.round((gamesPlayed / totalGames) * 100) : 0,
    }))
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}
