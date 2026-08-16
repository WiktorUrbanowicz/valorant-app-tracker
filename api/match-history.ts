// api/match-history.ts
// Vercel serverless function — proxies requests to the HenrikDev Valorant API.
// Keeps HENRIK_API_KEY server-side; the frontend never sees it.

import type { VercelRequest, VercelResponse } from "@vercel/node";

const HENRIK_BASE_URL = "https://api.henrikdev.xyz";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, tag, region, mode, size } = req.query;

  // Basic validation — fail fast with a clear message instead of forwarding garbage
  if (!name || !tag || !region) {
    return res.status(400).json({
      error: "Missing required query params: name, tag, region",
    });
  }

  if (typeof name !== "string" || typeof tag !== "string" || typeof region !== "string") {
    return res.status(400).json({ error: "Query params must be single strings" });
  }

  const validRegions = ["ap", "na", "latam", "br", "eu", "kr"];
  if (!validRegions.includes(region)) {
    return res.status(400).json({
      error: `Invalid region "${region}". Must be one of: ${validRegions.join(", ")}`,
    });
  }

  // Build the upstream URL
  const encodedName = encodeURIComponent(name);
  const encodedTag = encodeURIComponent(tag);
  const url = new URL(`${HENRIK_BASE_URL}/valorant/v3/matches/${region}/${encodedName}/${encodedTag}`);

  if (mode && typeof mode === "string") url.searchParams.set("mode", mode);
  if (size && typeof size === "string") url.searchParams.set("size", size);

  const apiKey = process.env.HENRIK_API_KEY;
  if (!apiKey) {
    console.error("HENRIK_API_KEY is not set in environment variables");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const upstreamRes = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
    });

    const data = await upstreamRes.json();

    if (!upstreamRes.ok) {
      // Forward HenrikDev's status + message rather than masking it —
      // your frontend can distinguish "player not found" (404) from
      // "rate limited" (429) from "upstream down" (503).
      return res.status(upstreamRes.status).json({
        error: data?.errors?.[0]?.message || "Upstream API error",
        status: upstreamRes.status,
      });
    }

    // Cache successful responses at the edge for 60s to reduce upstream calls
    // if multiple users search the same player in quick succession.
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching from HenrikDev API:", err);
    return res.status(502).json({ error: "Failed to reach upstream API" });
  }
}
