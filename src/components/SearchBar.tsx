// src/components/SearchBar.tsx

import { useState, type FormEvent } from "react";
import type { Region } from "../api/types";

interface SearchBarProps {
  onSearch: (params: { name: string; tag: string; region: Region }) => void;
  isLoading: boolean;
}

const REGIONS: { value: Region; label: string }[] = [
  { value: "na", label: "North America" },
  { value: "eu", label: "Europe" },
  { value: "ap", label: "Asia Pacific" },
  { value: "kr", label: "Korea" },
  { value: "latam", label: "Latin America" },
  { value: "br", label: "Brazil" },
];

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [riotId, setRiotId] = useState("");
  const [region, setRegion] = useState<Region>("eu");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);

    const trimmed = riotId.trim();
    const parts = trimmed.split("#");

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setValidationError("Enter a Riot ID in the format Name#Tag");
      return;
    }

    onSearch({ name: parts[0], tag: parts[1], region });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex-1 w-full">
        <input type="text" value={riotId} onChange={(e) => setRiotId(e.target.value)} placeholder="RiotName#Tag" className="w-full px-4 py-2 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text-h)" }} disabled={isLoading} />
        {validationError && (
          <p className="text-sm mt-1" style={{ color: "#e11d48" }}>
            {validationError}
          </p>
        )}
      </div>

      <select value={region} onChange={(e) => setRegion(e.target.value as Region)} className="px-4 py-2 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text-h)" }} disabled={isLoading}>
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg font-medium disabled:opacity-50" style={{ background: "var(--accent)", color: "#fff" }}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
