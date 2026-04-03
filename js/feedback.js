/**
 * Feedback generator.
 * Produces "AI interpretation" text and educational notes based on scores.
 */

function generateInterpretation(prompt, occupation, scores) {
  const name = occupation.name;
  const total = scores.total;
  const s = scores.scores;

  // Build description of what AI would likely generate
  let interpretation = "";

  if (scores.objectOnly) {
    interpretation = `Interesting strategy — you described objects and tools rather than people. But a real AI image generator would still produce people in this image. `;
    interpretation += `It would just use its defaults: ${describeDefault(occupation)}. `;
    interpretation += `Describing only objects doesn't avoid bias — it just gives the AI full control over who appears.`;
    return interpretation;
  }

  if (total >= 80) {
    interpretation = `Your prompt would likely push an AI to generate a genuinely diverse group of ${name}. `;
    interpretation += describeStrengths(s, name);
  } else if (total >= 50) {
    interpretation = `Your prompt would nudge the AI toward some diversity in its depiction of ${name}, but gaps remain. `;
    interpretation += describePartial(s, name, occupation);
  } else if (total >= 25) {
    interpretation = `Your prompt would likely produce a fairly stereotypical image of ${name}. `;
    interpretation += describeWeaknesses(s, name, occupation);
  } else {
    interpretation = `Without stronger diversity signals, the AI would default to its training data stereotypes for ${name}. `;
    interpretation += `That typically means ${describeDefault(occupation)}.`;
  }

  return interpretation;
}

function describeStrengths(s, name) {
  const parts = [];
  if (s.gender >= 14) parts.push("a mix of genders");
  if (s.ethnicity >= 14) parts.push("people from different ethnic backgrounds");
  if (s.age >= 7) parts.push("a range of ages");
  if (s.context >= 14) parts.push("a rich, varied setting");

  if (parts.length > 0) {
    return `The image would likely include ${parts.join(", ")}. Strong prompt engineering.`;
  }
  return "The AI would produce a more inclusive result than its defaults.";
}

function describePartial(s, name, occ) {
  const weak = [];
  if (s.gender < 10) weak.push("gender diversity");
  if (s.ethnicity < 10) weak.push("ethnic representation");
  if (s.age < 5) weak.push("age variety");
  if (s.context < 10) weak.push("contextual richness");

  if (weak.length > 0) {
    return `The AI would still default on ${weak.join(" and ")}. Remember: what you don't specify, the AI fills in with stereotypes.`;
  }
  return "Decent coverage, but the AI will still lean on its defaults for anything not explicitly specified.";
}

function describeWeaknesses(s, name, occ) {
  return `The AI would lean heavily on stereotypes — ${describeDefault(occ)}. Your prompt didn't include enough signals to push past the AI's defaults.`;
}

function describeDefault(occ) {
  const genderDefault = occ.stereotypedGender === "male" ? "mostly men" : "mostly women";
  const ageMap = {
    "young": "young adults",
    "young-middle": "young to middle-aged people",
    "middle": "middle-aged people",
    "middle-old": "middle-aged to older people",
    "old": "older individuals"
  };
  const ageDefault = ageMap[occ.stereotypedAge] || "adults";
  const ethDefault = occ.stereotypedEthnicity.join(" or ");

  return `${genderDefault}, ${ageDefault}, predominantly ${ethDefault}`;
}

function generateFeedback(prompt, occupation, scores) {
  const s = scores.scores;
  const missing = [];
  const strong = [];

  // Object-only prompt special feedback
  if (scores.objectOnly) {
    missing.push({ dim: "Strategy", tip: "You described objects instead of people — a creative approach, but AI image generators still place people in occupational scenes. Silence about who those people are isn't neutral; the AI fills the gap with its training data defaults." });
  }

  // Identify weak dimensions
  if (s.gender < 10) missing.push({ dim: "Gender", tip: getGenderTip(occupation) });
  if (s.ethnicity < 10) missing.push({ dim: "Ethnicity", tip: getEthnicityTip() });
  if (s.age < 5) missing.push({ dim: "Age", tip: getAgeTip(occupation) });
  if (s.context < 10) missing.push({ dim: "Context", tip: getContextTip() });
  if (s.antiStereotype < 15) missing.push({ dim: "Anti-stereotype", tip: getAntiStereotypeTip(occupation) });

  // Identify strong dimensions
  if (s.gender >= 14) strong.push("gender inclusivity");
  if (s.ethnicity >= 14) strong.push("ethnic diversity");
  if (s.age >= 7) strong.push("age representation");
  if (s.context >= 14) strong.push("contextual detail");
  if (s.antiStereotype >= 20) strong.push("stereotype-challenging");

  return { missing, strong, biasNote: occupation.biasNote };
}

function getGenderTip(occ) {
  if (occ.stereotypedGender === "male") {
    return "Try mentioning women, mixed genders, or gender-neutral terms. AI defaults to men for this occupation.";
  }
  return "Try mentioning men, mixed genders, or gender-neutral terms. AI defaults to women for this occupation.";
}

function getEthnicityTip() {
  return "Words like 'diverse', 'multicultural', or 'from different backgrounds' signal ethnic variety. Without them, AI defaults to its training data majority.";
}

function getAgeTip(occ) {
  if (occ.stereotypedAge.includes("young")) {
    return "Try mentioning 'older', 'experienced', or 'different ages' to counter the AI's youth bias for this role.";
  }
  if (occ.stereotypedAge.includes("old")) {
    return "Try mentioning 'young', 'early career', or 'different ages' to counter the AI's age bias for this role.";
  }
  return "Mention 'different ages', 'young and old', or specific age signals to push past AI age defaults.";
}

function getContextTip() {
  return "Adding setting details ('community', 'global', 'urban') or inclusion signals ('accessible', 'disabilities') enriches the image and implies more variety.";
}

function getAntiStereotypeTip(occ) {
  return `For "${occ.name}", the strongest counter-stereotype move is to directly challenge what AI assumes. ${occ.biasNote.split('.')[0]}.`;
}

function getPerformanceTitle(totalScore) {
  if (totalScore >= 250) return "Diversity Champion";
  if (totalScore >= 200) return "Bias Challenger";
  if (totalScore >= 150) return "Awareness Builder";
  if (totalScore >= 100) return "Stereotype Spotter";
  if (totalScore >= 50) return "Curious Beginner";
  return "Default Acceptor";
}

function getFinalInsight(totalScore, rounds) {
  if (totalScore >= 250) {
    return "You consistently pushed past AI defaults with precise, counter-stereotypical language. The key insight: every word in a prompt is a design decision. What you don't specify, the AI fills with its training data biases.";
  }
  if (totalScore >= 150) {
    return "You showed solid awareness of AI bias but sometimes fell back on generic diversity terms. The challenge with fewer words isn't just fitting ideas in — it's choosing which stereotypes to counter first when you can't counter them all.";
  }
  return "This game reveals something fundamental about AI: silence is not neutral. When you write a simple prompt like 'show me teachers', the AI doesn't produce a random image — it produces its best guess based on patterns in its training data. And those patterns carry society's biases.";
}
