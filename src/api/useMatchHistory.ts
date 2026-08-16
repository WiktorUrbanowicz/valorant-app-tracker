import { useQuery } from "@tanstack/react-query";
import type { MatchHistoryResponse, ApiErrorResponse, Region } from "./types";

interface FetchMatchHistoryParams {
  name: string;
  tag: string;
  region: Region;
  mode?: string;
  size?: number;
}

class MatchHistoryError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "MatchHistoryError";
    this.status = status;
  }
}

async function fetchMatchHistory({ name, tag, region, mode, size }: FetchMatchHistoryParams): Promise<MatchHistoryResponse> {
  const params = new URLSearchParams({ name, tag, region });
  if (mode) params.set("mode", mode);
  if (size) params.set("size", String(size));

  const res = await fetch(`/api/match-history?${params.toString()}`);
  const data = await res.json();

  if (!res.ok) {
    const errData = data as ApiErrorResponse;
    // Distinguish common cases so components can show tailored messages
    if (res.status === 404) {
      throw new MatchHistoryError("Player not found. Check the name and tag.", 404);
    }
    if (res.status === 429) {
      throw new MatchHistoryError("Rate limited — try again in a moment.", 429);
    }
    throw new MatchHistoryError(errData.error || "Failed to fetch match history", res.status);
  }

  return data as MatchHistoryResponse;
}

export function useMatchHistory(params: FetchMatchHistoryParams | null) {
  return useQuery({
    // Include all params in the key so a new search actually refetches
    queryKey: ["matchHistory", params?.name, params?.tag, params?.region, params?.mode, params?.size],
    queryFn: () => fetchMatchHistory(params as FetchMatchHistoryParams),
    // Don't fetch until we actually have a name+tag+region (e.g. before first search)
    enabled: !!params?.name && !!params?.tag && !!params?.region,
    // Match data for a given player doesn't change second-to-second;
    // avoid refetching on every window focus
    staleTime: 60_000,
    retry: (failureCount, error) => {
      // Don't retry on 404 (player not found won't fix itself) or 429 (rate limit)
      if (error instanceof MatchHistoryError && (error.status === 404 || error.status === 429)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export { MatchHistoryError };
