const INTENT_KEYWORDS = {
  late_night: ["night", "after hours", "dark", "nocturnal", "atmospheric"],
  drive: ["driving", "road", "cruise", "motion"],
  workout: ["hype", "intense", "fast", "hard"],
  focus: ["focus", "deep focus", "instrumental", "minimal", "calm"],
  party: ["party", "dance", "club", "upbeat"],
  romantic: ["romantic", "warm", "intimate", "sensual"],
  sad: ["melancholy", "emotional", "heartbreak", "sad"],
  uplifting: ["feel good", "bright", "warm", "uplifting"],
};

function mapEraToYearRange(era) {
  const currentYear = new Date().getFullYear();

  switch (era) {
    case "late_90s":
      return { min: 1996, max: 1999 };

    case "2000s":
      return { min: 2000, max: 2009 };

    case "early_2010s":
      return { min: 2010, max: 2014 };

    case "late_2010s":
      return { min: 2015, max: 2019 };

    case "2020s":
      return { min: 2020, max: currentYear };

    case "recent":
      return { min: currentYear - 3, max: currentYear };

    case "very_recent":
      return { min: currentYear - 1, max: currentYear };

    default:
      return null;
  }
}

function uniqueClean(values = []) {
  return [
    ...new Set(values.map((value) => String(value).trim()).filter(Boolean)),
  ];
}

function resolveSortStrategy(type, discoveryLevel) {
  if (type === "trending") {
    return "popularity_bias";
  }

  if (type === "fresh_finds") {
    return "recency_bias";
  }

  if (type === "deep_cuts" || discoveryLevel === "exploratory") {
    return "exploratory_bias";
  }

  if (discoveryLevel === "familiar") {
    return "familiar_bias";
  }

  return "balanced";
}

export function buildSearchPlan(
  parsedIntent,
  { type = "best_match", era = "any", discoveryLevel = "balanced" } = {},
) {
  const {
    genres = [],
    moods = [],
    energy = null,
    vibe = [],
    referenceArtists = [],
    avoid = [],
    intent = null,
  } = parsedIntent;

  const intentKeywords = intent ? INTENT_KEYWORDS[intent] || [] : [];
  const yearRange = mapEraToYearRange(era);

  const seedGenres = uniqueClean(genres).slice(0, 3);
  const seedArtists = uniqueClean(referenceArtists).slice(0, 2);
  const moodKeywords = uniqueClean(moods).slice(0, 4);
  const vibeKeywords = uniqueClean(vibe).slice(0, 4);
  const expandedKeywords = uniqueClean([
    ...moodKeywords,
    ...vibeKeywords,
    ...intentKeywords,
  ]).slice(0, 8);

  const excludedTerms = uniqueClean(avoid).slice(0, 5);
  const sortStrategy = resolveSortStrategy(type, discoveryLevel);

  return {
    type,
    era,
    discoveryLevel,
    intent,
    seedGenres,
    seedArtists,
    moodKeywords,
    vibeKeywords,
    keywords: expandedKeywords,
    excludedTerms,
    targetEnergy: energy,
    sortStrategy,
    yearRange,
  };
}
