function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, terms = []) {
  const normalizedText = normalize(text);
  return terms.some((term) => normalizedText.includes(normalize(term)));
}

function countMatches(text, terms = []) {
  const normalizedText = normalize(text);
  return terms.reduce((count, term) => {
    return normalizedText.includes(normalize(term)) ? count + 1 : count;
  }, 0);
}

function yearFromReleaseDate(releaseDate) {
  if (!releaseDate) return null;
  const year = Number(String(releaseDate).slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

function energyFitScore(targetEnergy, popularity) {
  if (!targetEnergy) return 0;

  if (targetEnergy === "low") {
    if (popularity <= 45) return 1.2;
    if (popularity <= 65) return 0.6;
    return 0;
  }

  if (targetEnergy === "medium") {
    if (popularity >= 35 && popularity <= 80) return 1.2;
    return 0.5;
  }

  if (targetEnergy === "high") {
    if (popularity >= 55) return 1.2;
    if (popularity >= 40) return 0.6;
    return 0;
  }

  return 0;
}

function familiarityScore(discoveryLevel, popularity) {
  if (discoveryLevel === "familiar") {
    return popularity / 100;
  }

  if (discoveryLevel === "exploratory") {
    return (100 - popularity) / 100;
  }

  return 1 - Math.abs(popularity - 55) / 100;
}

function typeScore(type, popularity, releaseDate) {
  const year = yearFromReleaseDate(releaseDate);
  const currentYear = new Date().getFullYear();

  if (type === "trending") {
    return popularity / 100;
  }

  if (type === "fresh_finds") {
    if (!year) return 0;
    if (year >= currentYear - 1) return 1.2;
    if (year >= currentYear - 3) return 0.75;
    return 0.1;
  }

  if (type === "deep_cuts") {
    return (100 - popularity) / 100;
  }

  return 0.4;
}

function yearFit(yearRange, releaseDate) {
  if (!yearRange?.min || !yearRange?.max) return 0;

  const year = yearFromReleaseDate(releaseDate);
  if (!year) return 0;

  if (year >= yearRange.min && year <= yearRange.max) return 1.5;

  const distance = Math.min(
    Math.abs(year - yearRange.min),
    Math.abs(year - yearRange.max),
  );

  if (distance <= 1) return 0.6;
  return 0;
}

function makeDedupeKey(track) {
  const primaryArtist = track.artist?.split(",")[0] || "";
  return `${normalize(track.title)}__${normalize(primaryArtist)}`;
}

export function rankTracks(rawTracks = [], searchPlan = {}) {
  const {
    seedGenres = [],
    seedArtists = [],
    moodKeywords = [],
    vibeKeywords = [],
    keywords = [],
    excludedTerms = [],
    targetEnergy = null,
    yearRange = null,
    discoveryLevel = "balanced",
    type = "best_match",
  } = searchPlan;

  const artistCounts = new Map();
  const bestByKey = new Map();

  for (const track of rawTracks) {
    const haystack = [track.title, track.artist, track.album, track.sourceQuery]
      .filter(Boolean)
      .join(" ");

    const artistMatch = countMatches(track.artist, seedArtists) * 5;
    const genreMatch = countMatches(track.sourceQuery || "", seedGenres) * 2.5;
    const moodMatch = countMatches(haystack, moodKeywords) * 2.2;
    const vibeMatch = countMatches(haystack, vibeKeywords) * 2.2;
    const keywordMatch = countMatches(haystack, keywords) * 1.6;
    const avoidPenalty = includesAny(haystack, excludedTerms) ? 10 : 0;
    const energyScore = energyFitScore(targetEnergy, track.popularity || 0);
    const familiarityFit = familiarityScore(
      discoveryLevel,
      track.popularity || 0,
    );
    const modeFit = typeScore(type, track.popularity || 0, track.releaseDate);
    const yearScore = yearFit(yearRange, track.releaseDate);
    const sourceWeight = track.sourceWeight || 0.5;

    const score =
      sourceWeight * 10 +
      artistMatch +
      genreMatch +
      moodMatch +
      vibeMatch +
      keywordMatch +
      energyScore +
      familiarityFit * 2.4 +
      modeFit * 2.6 +
      yearScore * 2.8 -
      avoidPenalty;

    const scoredTrack = {
      ...track,
      score,
    };

    const dedupeKey = makeDedupeKey(scoredTrack);
    const existing = bestByKey.get(dedupeKey);

    if (!existing || scoredTrack.score > existing.score) {
      bestByKey.set(dedupeKey, scoredTrack);
    }
  }

  const ranked = [...bestByKey.values()].sort((a, b) => b.score - a.score);

  const diversified = [];

  for (const track of ranked) {
    const primaryArtist = normalize(track.artist?.split(",")[0] || "unknown");
    const currentCount = artistCounts.get(primaryArtist) || 0;

    if (currentCount >= 2) {
      continue;
    }

    artistCounts.set(primaryArtist, currentCount + 1);
    diversified.push(track);
  }

  return diversified;
}
