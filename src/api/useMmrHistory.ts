// src/api/useMmrHistory.ts

import { useQuery } from "@tanstack/react-query";
import type { MmrHistoryResponse, ApiErrorResponse, Region } from "./types";
import { MatchHistoryError } from "./useMatchHistory";

interface FetchMmrHistoryParams {
  name: string;
  tag: string;
  region: Region;
}

async function fetchMmrHistory({ name, tag, region }: FetchMmrHistoryParams): Promise<MmrHistoryResponse> {
  const params = new URLSearchParams({ name, tag, region });
  const res = await fetch(`/api/mmr-history?${params.toString()}`);
  const data = await res.json();

  if (!res.ok) {
    const errData = data as ApiErrorResponse;
    if (res.status === 404) {
      throw new MatchHistoryError("Player not found. Check the name and tag.", 404);
    }
    if (res.status === 429) {
      throw new MatchHistoryError("Rate limited — try again in a moment.", 429);
    }
    throw new MatchHistoryError(errData.error || "Failed to fetch MMR history", res.status);
  }

  return data as MmrHistoryResponse;
}

export function useMmrHistory(params: FetchMmrHistoryParams | null) {
  return useQuery({
    queryKey: ["mmrHistory", params?.name, params?.tag, params?.region],
    queryFn: () => fetchMmrHistory(params as FetchMmrHistoryParams),
    enabled: !!params?.name && !!params?.tag && !!params?.region,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof MatchHistoryError && (error.status === 404 || error.status === 429)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
