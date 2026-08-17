// src/App.tsx

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { SearchBar } from "./components/SearchBar";
import { MatchList } from "./components/MatchList";
import { SummaryCard } from "./components/SummaryCard";
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
  const [isExporting, setIsExporting] = useState(false);
  const summaryCardRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error } = useMatchHistory(searchParams ? { ...searchParams, size: 10 } : null);
  const { data: mmrData } = useMmrHistory(searchParams);

  async function handleExportCard() {
    if (!summaryCardRef.current || !searchParams) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(summaryCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${searchParams.name}-${searchParams.tag}-summary.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export summary card:", err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <h1>Valorant Match History</h1>

      <SearchBar onSearch={setSearchParams} isLoading={isLoading} />

      <div className="mt-8">
        {!searchParams && <p style={{ color: "var(--text)" }}>Search a Riot ID to see recent matches.</p>}

        {isLoading && <p style={{ color: "var(--text)" }}>Loading matches...</p>}

        {isError && <p style={{ color: "#e11d48" }}>{error instanceof MatchHistoryError ? error.message : "Something went wrong."}</p>}

        {data && searchParams && (
          <div className="mt-8 flex flex-col gap-10 w-full max-w-[850px] mx-auto text-left overflow-hidden ">
            <div className="w-full text-center">
              <h2>Win Rate by Agent</h2>
              <WinRateChart data={getWinRateByAgent(data.data, searchParams.name, searchParams.tag)} />
            </div>

            <div className="w-full text-center">
              <h2>Rank Progression</h2>
              <RankProgressionChart data={mmrData?.data ?? []} />
            </div>

            <div className="w-full text-center">
              <h2>Role Breakdown</h2>
              <RoleBreakdownChart data={getRoleBreakdown(data.data, searchParams.name, searchParams.tag)} />
            </div>

            <div className="w-full text-center">
              <h2>Performance by Map</h2>
              <MapPerformanceChart data={getPerformanceByMap(data.data, searchParams.name, searchParams.tag)} />
            </div>

            <div className="w-full text-center gap-1">
              <h2>Recent Matches</h2>
              <MatchList matches={data.data} currentPlayerName={searchParams.name} currentPlayerTag={searchParams.tag} />
            </div>

            <div className="w-full flex flex-col items-center gap-4 mt-8 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
              <h2>Summary</h2>
              <SummaryCard ref={summaryCardRef} playerName={searchParams.name} playerTag={searchParams.tag} agentStats={getWinRateByAgent(data.data, searchParams.name, searchParams.tag)} mapStats={getPerformanceByMap(data.data, searchParams.name, searchParams.tag)} totalGames={data.data.length} totalWins={getWinRateByAgent(data.data, searchParams.name, searchParams.tag).reduce((sum, a) => sum + a.wins, 0)} />
              <button onClick={handleExportCard} disabled={isExporting} className="px-6 py-2 rounded-lg font-medium disabled:opacity-50 w-full max-w-[320px]" style={{ background: "var(--accent)", color: "#fff" }}>
                {isExporting ? "Exporting..." : "Download as PNG"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
