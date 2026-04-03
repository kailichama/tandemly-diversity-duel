/**
 * Diversity scoring engine.
 * Evaluates prompts across 5 dimensions relative to occupation stereotypes.
 */

const GENDER_KEYWORDS = {
  inclusive: ["men and women", "all genders", "mixed gender", "diverse gender", "nonbinary", "non-binary", "gender diverse", "mixed"],
  female: ["women", "woman", "female", "females", "girls", "mothers", "her", "she"],
  male: ["men", "man", "male", "males", "boys", "fathers", "him", "he"],
  neutral: ["people", "humans", "individuals", "professionals", "workers", "team", "crew", "group", "community", "everyone", "everybody"]
};

const ETHNICITY_KEYWORDS = {
  explicit: ["diverse", "multicultural", "multiethnic", "multiracial", "different races", "different ethnicities", "different backgrounds", "mixed race", "interracial", "global", "international", "worldwide", "various cultures", "all races"],
  geographic: ["african", "asian", "european", "latin", "hispanic", "indigenous", "native", "middle eastern", "caribbean", "pacific islander", "south asian"]
};

const AGE_KEYWORDS = {
  range: ["different ages", "all ages", "young and old", "multigenerational", "multi-generational", "various ages", "mixed ages"],
  young: ["young", "youth", "junior", "new", "fresh", "early career"],
  old: ["elderly", "older", "senior", "experienced", "veteran", "retired", "gray-haired", "mature"]
};

const CONTEXT_KEYWORDS = {
  setting: ["community", "neighborhood", "city", "urban", "rural", "school", "hospital", "office", "outdoor", "indoor", "worldwide", "global", "countries", "international"],
  richness: ["different", "various", "many", "multiple", "range", "variety", "assorted", "mix"],
  inclusion: ["inclusive", "accessible", "disabilities", "wheelchair", "disability", "hearing aid", "prosthetic", "adaptive", "accommodation"]
};

const STRUCTURE_WORDS = {
  nouns: ["people", "humans", "workers", "team", "crew", "group", "individuals", "professionals", "men", "women", "person", "community", "staff", "members", "colleagues"],
  verbs: ["working", "building", "teaching", "helping", "creating", "standing", "sitting", "laughing", "talking", "collaborating", "gathered", "wearing"],
  adjectives: ["diverse", "multicultural", "inclusive", "different", "various", "mixed", "global", "young", "old", "professional"]
};

function scorePrompt(prompt, occupation) {
  const lower = prompt.toLowerCase().trim();
  const words = lower.split(/\s+/).filter(w => w.length > 0);
  const profile = occupation;

  const scores = {
    gender: scoreGender(lower, words, profile),
    ethnicity: scoreEthnicity(lower, words, profile),
    age: scoreAge(lower, words, profile),
    context: scoreContext(lower, words, profile),
    antiStereotype: scoreAntiStereotype(lower, words, profile)
  };

  // Penalty for pure adjective lists
  const penalty = calculateStructurePenalty(words);
  const rawTotal = scores.gender + scores.ethnicity + scores.age + scores.context + scores.antiStereotype;
  const total = Math.max(0, Math.round(rawTotal * (1 - penalty)));

  // Detect object-only prompts (no people/diversity words at all)
  const allPeopleWords = [
    ...GENDER_KEYWORDS.inclusive, ...GENDER_KEYWORDS.female, ...GENDER_KEYWORDS.male, ...GENDER_KEYWORDS.neutral,
    ...ETHNICITY_KEYWORDS.explicit, ...ETHNICITY_KEYWORDS.geographic,
    ...AGE_KEYWORDS.range, ...AGE_KEYWORDS.young, ...AGE_KEYWORDS.old,
    ...CONTEXT_KEYWORDS.inclusion,
    "diverse", "diversity", "inclusive", "representation"
  ];
  const objectOnly = total === 0 && !allPeopleWords.some(k => lower.includes(k));

  return {
    scores: {
      gender: Math.round(scores.gender),
      ethnicity: Math.round(scores.ethnicity),
      age: Math.round(scores.age),
      context: Math.round(scores.context),
      antiStereotype: Math.round(scores.antiStereotype)
    },
    total,
    penalty: penalty > 0,
    objectOnly
  };
}

function scoreGender(text, words, profile) {
  let score = 0;
  const max = 20;

  // Explicit inclusivity signals
  if (containsAny(text, GENDER_KEYWORDS.inclusive)) score += 14;

  // Counter-stereotype gender mention
  const hasFemale = containsAny(text, GENDER_KEYWORDS.female);
  const hasMale = containsAny(text, GENDER_KEYWORDS.male);

  if (hasFemale && hasMale) {
    score += 16;
  } else if (profile.stereotypedGender === "male" && hasFemale) {
    score += 12;
  } else if (profile.stereotypedGender === "female" && hasMale) {
    score += 12;
  } else if (hasFemale || hasMale) {
    score += 4; // Mentions one gender but not counter-stereotype
  }

  // Gender-neutral language
  if (containsAny(text, GENDER_KEYWORDS.neutral)) score += 6;

  return Math.min(score, max);
}

function scoreEthnicity(text, words, profile) {
  let score = 0;
  const max = 20;

  if (containsAny(text, ETHNICITY_KEYWORDS.explicit)) score += 14;
  if (containsAny(text, ETHNICITY_KEYWORDS.geographic)) score += 8;

  // Multiple geographic/ethnic references = bonus
  const geoCount = ETHNICITY_KEYWORDS.geographic.filter(k => text.includes(k)).length;
  if (geoCount >= 2) score += 6;

  return Math.min(score, max);
}

function scoreAge(text, words, profile) {
  let score = 0;
  const max = 10;

  if (containsAny(text, AGE_KEYWORDS.range)) score += 8;

  const hasYoung = containsAny(text, AGE_KEYWORDS.young);
  const hasOld = containsAny(text, AGE_KEYWORDS.old);

  if (hasYoung && hasOld) {
    score += 8;
  } else if (hasYoung || hasOld) {
    // Counter-stereotype age mention
    if (profile.stereotypedAge === "young" && hasOld) score += 6;
    else if (profile.stereotypedAge === "old" && hasYoung) score += 6;
    else if (profile.stereotypedAge === "middle-old" && hasYoung) score += 6;
    else if (profile.stereotypedAge === "young-middle" && hasOld) score += 6;
    else score += 3;
  }

  return Math.min(score, max);
}

function scoreContext(text, words, profile) {
  let score = 0;
  const max = 20;

  if (containsAny(text, CONTEXT_KEYWORDS.setting)) score += 8;
  if (containsAny(text, CONTEXT_KEYWORDS.richness)) score += 6;
  if (containsAny(text, CONTEXT_KEYWORDS.inclusion)) score += 10;

  // Bonus for compound contextual phrases
  const settingCount = CONTEXT_KEYWORDS.setting.filter(k => text.includes(k)).length;
  if (settingCount >= 2) score += 4;

  return Math.min(score, max);
}

function scoreAntiStereotype(text, words, profile) {
  let score = 0;
  const max = 30;

  // Check against occupation-specific counter-stereotype keywords
  const counterHits = profile.counterKeywords.filter(k => text.includes(k));
  score += Math.min(counterHits.length * 6, 18);

  // Bonus for directly naming the counter-stereotype gender
  if (profile.stereotypedGender === "male" && containsAny(text, GENDER_KEYWORDS.female)) {
    score += 8;
  } else if (profile.stereotypedGender === "female" && containsAny(text, GENDER_KEYWORDS.male)) {
    score += 8;
  }

  // Bonus for challenging age stereotypes
  if ((profile.stereotypedAge === "young" || profile.stereotypedAge === "young-middle") && containsAny(text, AGE_KEYWORDS.old)) {
    score += 5;
  } else if ((profile.stereotypedAge === "old" || profile.stereotypedAge === "middle-old") && containsAny(text, AGE_KEYWORDS.young)) {
    score += 5;
  }

  // Disability/accessibility mention is always counter-stereotype
  if (containsAny(text, CONTEXT_KEYWORDS.inclusion)) score += 6;

  return Math.min(score, max);
}

function calculateStructurePenalty(words) {
  // Penalize prompts that are pure adjective lists
  const adjCount = words.filter(w => STRUCTURE_WORDS.adjectives.includes(w)).length;
  const nounCount = words.filter(w => STRUCTURE_WORDS.nouns.includes(w)).length;
  const verbCount = words.filter(w => STRUCTURE_WORDS.verbs.includes(w)).length;

  if (nounCount === 0 && verbCount === 0 && adjCount > 0) {
    return 0.25; // 25% penalty for adjective-only prompts
  }
  return 0;
}

function containsAny(text, keywords) {
  return keywords.some(k => text.includes(k));
}
