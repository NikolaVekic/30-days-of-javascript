import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { buildSearchPlan } from "./utils/buildSearchPlan.js";
import { buildQueryPlans } from "./utils/buildQueryPlans.js";
import { rankTracks } from "./utils/rankTracks.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

let spotifyAccessToken = null;
let spotifyTokenExpiresAt = 0;

function validateEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in server .env");
  }

  if (!process.env.SPOTIFY_CLIENT_ID) {
    throw new Error("Missing SPOTIFY_CLIENT_ID in server .env");
  }

  if (!process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Missing SPOTIFY_CLIENT_SECRET in server .env");
  }
}

async function parseMusicIntent({
  prompt,
  type = "best_match",
  era = "any",
  discoveryLevel = "balanced",
}) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You extract structured music discovery intent from user requests.

Return JSON only with this exact shape:
{
  "genres": [],
  "moods": [],
  "energy": "low" | "medium" | "high" | null,
  "vibe": [],
  "referenceArtists": [],
  "avoid": [],
  "intent": "focus" | "drive" | "party" | "workout" | "late_night" | "romantic" | "sad" | "uplifting" | null,
  "era": "any" | "late_90s" | "2000s" | "early_2010s" | "late_2010s" | "2020s" | "recent" | "very_recent",
  "discoveryLevel": "balanced" | "familiar" | "exploratory"
}

Rules:
- Infer genres when reasonably clear.
- Extract moods as emotional or situational descriptors.
- Extract vibe as stylistic or contextual descriptors.
- Extract artist names only if explicitly mentioned.
- Put unwanted qualities in "avoid".
- Do not invent artists.
- Keep arrays short and relevant.
- Use the provided era if present unless the prompt clearly overrides it.
- Use the provided discoveryLevel if present unless the prompt clearly overrides it.

Intent mapping guidance:
- studying, concentration, coding, reading, work => "focus"
- driving, night drive, road trip, cruising => "drive"
- gym, lifting, running, training, hype => "workout"
- party, club, dancing, pregame => "party"
- rainy night, after hours, midnight, nocturnal => "late_night"
- romance, date night, sensual, intimate => "romantic"
- heartbreak, crying, grief, melancholy => "sad"
- bright, optimistic, happy, sunny, feel-good => "uplifting"

Energy guidance:
- calm, soft, sleepy, sad, ambient => "low"
- groovy, driving, upbeat, warm, chill => "medium"
- hype, intense, aggressive, fast, explosive => "high"
- If not reasonably inferable, use null.

Era guidance:
- If the user explicitly asks for an era like late 90s or 2000s, set it accordingly.
- Otherwise use the provided era input.
- If neither is clear, use "any".

Discovery level guidance:
- mainstream, known, familiar, popular => "familiar"
- obscure, hidden gems, underground, less mainstream => "exploratory"
- otherwise use the provided discoveryLevel input or "balanced".

Return valid JSON only.
        `.trim(),
      },
      {
        role: "user",
        content: JSON.stringify({
          prompt,
          type,
          era,
          discoveryLevel,
        }),
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return JSON.parse(content);
}

async function getSpotifyAccessToken() {
  if (spotifyAccessToken && Date.now() < spotifyTokenExpiresAt) {
    return spotifyAccessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error_description || data.error || "Failed to get Spotify token.",
    );
  }

  spotifyAccessToken = data.access_token;
  spotifyTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return spotifyAccessToken;
}

async function searchSpotifyTracksForQuery(queryPlan) {
  const token = await getSpotifyAccessToken();
  const market = process.env.SPOTIFY_MARKET || "US";

  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", queryPlan.q);
  url.searchParams.set("type", "track");
  url.searchParams.set("limit", "10");
  url.searchParams.set("market", market);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Spotify track search request failed.",
    );
  }

  const items = data.tracks?.items || [];

  return items.map((track) => ({
    id: track.id,
    title: track.name,
    artist: track.artists?.map((artist) => artist.name).join(", ") || "Unknown",
    album: track.album?.name || "",
    artwork: track.album?.images?.[0]?.url || "",
    previewUrl: track.preview_url || null,
    spotifyUrl: track.external_urls?.spotify || "",
    releaseDate: track.album?.release_date || "",
    popularity: track.popularity ?? 0,
    sourceQuery: queryPlan.q,
    sourceName: queryPlan.name,
    sourceWeight: queryPlan.weight,
  }));
}

async function runSpotifySearchPlans(queryPlans = []) {
  const settled = await Promise.allSettled(
    queryPlans.map((plan) => searchSpotifyTracksForQuery(plan)),
  );

  const successful = settled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);

  return successful;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/parse-music-query", async (req, res) => {
  try {
    validateEnv();

    const {
      prompt,
      type,
      era,
      discoveryLevel,
      discoverMode,
      timeRange,
      familiarity,
    } = req.body;

    const resolvedType = type || discoverMode || "best_match";
    const resolvedEra = era || timeRange || "any";
    const resolvedDiscoveryLevel = discoveryLevel || familiarity || "balanced";

    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const parsedIntent = await parseMusicIntent({
      prompt: prompt.trim(),
      type: resolvedType,
      era: resolvedEra,
      discoveryLevel: resolvedDiscoveryLevel,
    });

    const searchPlan = buildSearchPlan(parsedIntent, {
      type: resolvedType,
      era: resolvedEra,
      discoveryLevel: resolvedDiscoveryLevel,
    });

    const queryPlans = buildQueryPlans(searchPlan);

    return res.json({
      parsedIntent,
      searchPlan,
      queryPlans,
    });
  } catch (error) {
    console.error("Parse music query error:", error);
    return res.status(500).json({
      error: error.message || "Failed to parse music query.",
    });
  }
});

app.post("/api/music-search", async (req, res) => {
  try {
    validateEnv();

    const {
      prompt,
      type,
      era,
      discoveryLevel,
      discoverMode,
      timeRange,
      familiarity,
    } = req.body;

    const resolvedType = type || discoverMode || "best_match";
    const resolvedEra = era || timeRange || "any";
    const resolvedDiscoveryLevel = discoveryLevel || familiarity || "balanced";

    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const parsedIntent = await parseMusicIntent({
      prompt: prompt.trim(),
      type: resolvedType,
      era: resolvedEra,
      discoveryLevel: resolvedDiscoveryLevel,
    });

    const searchPlan = buildSearchPlan(parsedIntent, {
      type: resolvedType,
      era: resolvedEra,
      discoveryLevel: resolvedDiscoveryLevel,
    });

    const queryPlans = buildQueryPlans(searchPlan);
    const rawTracks = await runSpotifySearchPlans(queryPlans);
    const rankedTracks = rankTracks(rawTracks, searchPlan);
    const recommendations = rankedTracks.slice(0, 8).map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: track.artwork,
      previewUrl: track.previewUrl,
      spotifyUrl: track.spotifyUrl,
      releaseDate: track.releaseDate,
      popularity: track.popularity,
    }));

    return res.json({
      recommendations,
    });
  } catch (error) {
    console.error("Music search error:", error);
    return res.status(500).json({
      error: error.message || "Failed to search music.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
