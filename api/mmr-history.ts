// api/mmr-history.ts
// Vercel serverless function — proxies requests to HenrikDev's MMR history endpoint.
// Note: this endpoint is only available as v1 (no v2/v3 exists for mmr-history
// specifically, unlike the general mmr endpoint which is deprecated at v1).

import type { VercelRequest, VercelResponse } from "@vercel/node";

const HENRIK_BASE_URL = "https://api.henrikdev.xyz";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, tag, region } = req.query;

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

  const encodedName = encodeURIComponent(name);
  const encodedTag = encodeURIComponent(tag);
  const url = `${HENRIK_BASE_URL}/valorant/v1/mmr-history/${region}/${encodedName}/${encodedTag}`;

  const apiKey = process.env.HENRIK_API_KEY;
  if (!apiKey) {
    console.error("HENRIK_API_KEY is not set in environment variables");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const upstreamRes = await fetch(url, {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
    });

    const data = await upstreamRes.json();

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        error: data?.errors?.[0]?.message || "Upstream API error",
        status: upstreamRes.status,
      });
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching from HenrikDev API:", err);
    return res.status(502).json({ error: "Failed to reach upstream API" });
  }
}
