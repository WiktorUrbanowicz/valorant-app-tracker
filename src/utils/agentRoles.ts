// src/utils/agentRoles.ts
// Static mapping of Valorant agents to their role. HenrikDev's match data
// only returns the agent name (character), not role, so this has to be
// maintained manually. Update when new agents release.

export type AgentRole = "Duelist" | "Controller" | "Initiator" | "Sentinel";

export const AGENT_ROLES: Record<string, AgentRole> = {
  // Duelists
  Jett: "Duelist",
  Phoenix: "Duelist",
  Reyna: "Duelist",
  Raze: "Duelist",
  Yoru: "Duelist",
  Neon: "Duelist",
  Iso: "Duelist",
  Waylay: "Duelist",

  // Controllers
  Brimstone: "Controller",
  Viper: "Controller",
  Omen: "Controller",
  Astra: "Controller",
  Harbor: "Controller",
  Clove: "Controller",

  // Initiators
  Sova: "Initiator",
  Breach: "Initiator",
  Skye: "Initiator",
  "KAY/O": "Initiator",
  Fade: "Initiator",
  Gekko: "Initiator",
  Tejo: "Initiator",

  // Sentinels
  Killjoy: "Sentinel",
  Cypher: "Sentinel",
  Sage: "Sentinel",
  Chamber: "Sentinel",
  Deadlock: "Sentinel",
  Vyse: "Sentinel",
  Veto: "Sentinel",
};

export function getAgentRole(agent: string): AgentRole | "Unknown" {
  return AGENT_ROLES[agent] ?? "Unknown";
}
