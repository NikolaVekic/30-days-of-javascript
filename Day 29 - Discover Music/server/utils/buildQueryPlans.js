function uniqueClean(values = []) {
  return [
    ...new Set(values.map((value) => String(value).trim()).filter(Boolean)),
  ];
}

function quoteIfNeeded(value) {
  const safe = String(value).trim();
  return /\s/.test(safe) ? `"${safe}"` : safe;
}

function buildYearFilter(yearRange) {
  if (!yearRange?.min || !yearRange?.max) {
    return "";
  }

  return `year:${yearRange.min}-${yearRange.max}`;
}

function limitWords(values = [], max = 3) {
  return uniqueClean(values).slice(0, max);
}

export function buildQueryPlans(searchPlan) {
  const {
    seedGenres = [],
    seedArtists = [],
    moodKeywords = [],
    vibeKeywords = [],
    keywords = [],
    targetEnergy = null,
    yearRange = null,
    type = "best_match",
    discoveryLevel = "balanced",
  } = searchPlan;

  const topGenre = seedGenres[0] ? `genre:${quoteIfNeeded(seedGenres[0])}` : "";
  const topArtist = seedArtists[0]
    ? `artist:${quoteIfNeeded(seedArtists[0])}`
    : "";
  const yearFilter = buildYearFilter(yearRange);

  const moodTerms = limitWords(moodKeywords, 3);
  const vibeTerms = limitWords(vibeKeywords, 3);
  const generalTerms = limitWords(keywords, 4);

  const energyTerms =
    targetEnergy === "low"
      ? ["calm", "soft"]
      : targetEnergy === "medium"
        ? ["groovy", "upbeat"]
        : targetEnergy === "high"
          ? ["intense", "fast"]
          : [];

  const plans = [
    {
      name: "primary_blend",
      weight: 1.0,
      q: [topArtist, topGenre, ...moodTerms, ...vibeTerms, yearFilter]
        .filter(Boolean)
        .join(" "),
    },
    {
      name: "vibe_first",
      weight: 0.92,
      q: [topGenre, ...generalTerms, ...energyTerms, yearFilter]
        .filter(Boolean)
        .join(" "),
    },
    {
      name: "genre_first",
      weight: 0.88,
      q: [topGenre, ...moodTerms, ...energyTerms, yearFilter]
        .filter(Boolean)
        .join(" "),
    },
    {
      name: "artist_first",
      weight: 0.9,
      q: [topArtist, ...generalTerms, yearFilter].filter(Boolean).join(" "),
    },
    {
      name: "broad_backup",
      weight: 0.72,
      q: [...generalTerms, ...energyTerms, yearFilter]
        .filter(Boolean)
        .join(" "),
    },
  ]
    .filter((plan) => plan.q.trim().length > 0)
    .map((plan) => ({
      ...plan,
      q: plan.q.replace(/\s+/g, " ").trim(),
    }));

  const uniquePlans = [];
  const seen = new Set();

  for (const plan of plans) {
    if (!seen.has(plan.q)) {
      seen.add(plan.q);
      uniquePlans.push(plan);
    }
  }

  if (type === "trending") {
    return uniquePlans.map((plan, index) => ({
      ...plan,
      weight: plan.weight + (index === 0 ? 0.08 : 0),
    }));
  }

  if (type === "fresh_finds") {
    return uniquePlans.map((plan, index) => ({
      ...plan,
      weight: plan.weight + (yearRange && index < 2 ? 0.1 : 0),
    }));
  }

  if (type === "deep_cuts" || discoveryLevel === "exploratory") {
    return uniquePlans.map((plan) => ({
      ...plan,
      weight: plan.weight + 0.04,
    }));
  }

  return uniquePlans;
}
