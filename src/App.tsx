// src/App.tsx

import { useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { MatchList } from "./components/MatchList";
import { WinRateChart } from "./components/charts/WinRateChart";
import { MapPerformanceChart } from "./components/charts/MapPerformanceChart";
import { RankProgressionChart } from "./components/charts/RankProgressionChart";
import { RoleBreakdownChart } from "./components/charts/RoleBreakdownChart";
import { useMatchHistory, MatchHistoryError } from "./api/useMatchHistory";
import { useMmrHistory } from "./api/useMmrHistory";
import { getWinRateByAgent, getPerformanceByMap, getRoleBreakdown } from "./utils/stats";
import type { Region } from "./api/types";
import "./App.css";

interface SearchParams {
  name: string;
  tag: string;
  region: Region;
}

function App() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const { data, isLoading, isError, error } = useMatchHistory(searchParams ? { ...searchParams, size: 10 } : null);
  const { data: mmrData } = useMmrHistory(searchParams);

  return (
    <>
      <h1>Valorant Match History</h1>

      <SearchBar onSearch={setSearchParams} isLoading={isLoading} />

      <div className="mt-8">
        {!searchParams && <p style={{ color: "var(--text)" }}>Search a Riot ID to see recent matches.</p>}

        {isLoading && <p style={{ color: "var(--text)" }}>Loading matches...</p>}

        {isError && <p style={{ color: "#e11d48" }}>{error instanceof MatchHistoryError ? error.message : "Something went wrong."}</p>}

        {data && searchParams && (
          <>
            <h2 className="mt-4">Win Rate by Agent</h2>
            <WinRateChart data={getWinRateByAgent(data.data, searchParams.name, searchParams.tag)} />

            <h2 className="mt-8">Rank Progression</h2>
            <RankProgressionChart data={mmrData?.data ?? []} />

            <h2 className="mt-8">Role Breakdown</h2>
            <RoleBreakdownChart data={getRoleBreakdown(data.data, searchParams.name, searchParams.tag)} />

            <h2 className="mt-8">Performance by Map</h2>
            <MapPerformanceChart data={getPerformanceByMap(data.data, searchParams.name, searchParams.tag)} />

            <h2 className="mt-8">Recent Matches</h2>
            <MatchList matches={data.data} currentPlayerName={searchParams.name} currentPlayerTag={searchParams.tag} />
          </>
        )}
      </div>
    </>
  );
}

export default App;
