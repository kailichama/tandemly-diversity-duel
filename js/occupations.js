/**
 * Occupation cards with stereotype profiles for diversity scoring.
 * Each occupation defines what biases exist so the scoring engine
 * can reward prompts that actively counter them.
 */
const OCCUPATIONS = [
  {
    name: "construction workers",
    stereotypedGender: "male",
    stereotypedAge: "young-middle",
    stereotypedEthnicity: ["white", "hispanic"],
    counterKeywords: ["women", "female", "elderly", "older", "young", "diverse", "all genders", "mixed", "multicultural", "global", "disabilities", "wheelchair"],
    biasNote: "AI image generators overwhelmingly depict construction workers as young men, usually white or Hispanic. Women make up about 11% of the U.S. construction workforce, but AI models rarely reflect even that."
  },
  {
    name: "nurses",
    stereotypedGender: "female",
    stereotypedAge: "young-middle",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["men", "male", "elderly", "older", "diverse", "all genders", "mixed", "multicultural", "different backgrounds"],
    biasNote: "About 12% of registered nurses in the U.S. are men, but AI-generated images of nurses are almost exclusively women. The stereotype also skews white, despite significant racial diversity in the profession."
  },
  {
    name: "CEOs",
    stereotypedGender: "male",
    stereotypedAge: "middle-old",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["women", "female", "young", "diverse", "multicultural", "global", "different backgrounds", "all ages", "mixed"],
    biasNote: "AI models strongly associate 'CEO' with older white men in suits. Only about 10% of Fortune 500 CEOs are women, and AI training data amplifies this skew even further."
  },
  {
    name: "teachers",
    stereotypedGender: "female",
    stereotypedAge: "middle",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["men", "male", "young", "older", "diverse", "multicultural", "different ages", "all genders", "global"],
    biasNote: "Teaching is stereotyped as a female profession, especially at the elementary level. AI images of teachers rarely include men or people of color, despite 20% of U.S. teachers being non-white."
  },
  {
    name: "firefighters",
    stereotypedGender: "male",
    stereotypedAge: "young-middle",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["women", "female", "diverse", "multicultural", "different backgrounds", "all genders", "mixed", "global"],
    biasNote: "Only about 4% of career firefighters in the U.S. are women, and AI models default heavily to white men. The profession is slowly diversifying, but AI training data lags behind."
  },
  {
    name: "software engineers",
    stereotypedGender: "male",
    stereotypedAge: "young",
    stereotypedEthnicity: ["white", "asian"],
    counterKeywords: ["women", "female", "older", "elderly", "diverse", "multicultural", "different ages", "all genders", "mixed", "global", "disabilities"],
    biasNote: "Tech has a well-documented diversity problem. AI images of programmers skew heavily toward young men, usually white or Asian, reinforcing the stereotype that coding is for a narrow demographic."
  },
  {
    name: "pilots",
    stereotypedGender: "male",
    stereotypedAge: "middle",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["women", "female", "young", "diverse", "multicultural", "all genders", "different backgrounds", "global", "mixed"],
    biasNote: "Only about 5% of commercial airline pilots worldwide are women. AI image generators almost never depict female pilots unless explicitly prompted to do so."
  },
  {
    name: "scientists",
    stereotypedGender: "male",
    stereotypedAge: "middle-old",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["women", "female", "young", "diverse", "multicultural", "all genders", "different backgrounds", "global", "mixed", "lab"],
    biasNote: "The 'scientist' stereotype — older white man in a lab coat — is one of the most persistent in AI-generated imagery. Women earn over half of science degrees but are underrepresented in AI depictions."
  },
  {
    name: "doctors",
    stereotypedGender: "male",
    stereotypedAge: "middle-old",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["women", "female", "young", "diverse", "multicultural", "all genders", "different backgrounds", "global", "mixed"],
    biasNote: "AI models associate 'doctor' with older white men, even though women now make up over 50% of medical school enrollees. The racial diversity of doctors is also poorly represented."
  },
  {
    name: "secretaries",
    stereotypedGender: "female",
    stereotypedAge: "young-middle",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["men", "male", "diverse", "older", "multicultural", "all genders", "different backgrounds", "mixed"],
    biasNote: "Administrative roles are strongly gender-stereotyped in AI outputs. About 94% of AI-generated secretary images are women, reinforcing outdated assumptions about office work."
  },
  {
    name: "athletes",
    stereotypedGender: "male",
    stereotypedAge: "young",
    stereotypedEthnicity: ["black", "white"],
    counterKeywords: ["women", "female", "older", "diverse", "multicultural", "all genders", "different sports", "mixed", "disabilities", "paralympic", "global"],
    biasNote: "AI-generated athlete images tend to default to young men, often Black for certain sports and white for others. Women athletes and para-athletes are significantly underrepresented."
  },
  {
    name: "chefs",
    stereotypedGender: "male",
    stereotypedAge: "middle",
    stereotypedEthnicity: ["white", "french"],
    counterKeywords: ["women", "female", "young", "diverse", "multicultural", "global", "different cuisines", "all genders", "mixed", "street food"],
    biasNote: "Professional cooking is stereotyped as male in AI imagery, despite women doing most home cooking worldwide. AI also defaults to European fine dining aesthetics, erasing culinary traditions from other cultures."
  },
  {
    name: "judges",
    stereotypedGender: "male",
    stereotypedAge: "old",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["women", "female", "young", "diverse", "multicultural", "all genders", "different backgrounds", "mixed", "global"],
    biasNote: "AI strongly associates judges with older white men. About 34% of U.S. federal judges are women, but AI depictions make it seem like the bench is entirely male."
  },
  {
    name: "mechanics",
    stereotypedGender: "male",
    stereotypedAge: "young-middle",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["women", "female", "diverse", "older", "young", "multicultural", "all genders", "mixed", "different backgrounds"],
    biasNote: "Auto mechanics are depicted as men in nearly 100% of AI-generated images. Women mechanics exist and are growing in numbers, but AI training data hasn't caught up."
  },
  {
    name: "social workers",
    stereotypedGender: "female",
    stereotypedAge: "middle",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["men", "male", "young", "older", "diverse", "multicultural", "all genders", "different backgrounds", "mixed", "global"],
    biasNote: "Social work is stereotyped as a female profession in AI outputs. About 17% of social workers are men, and the field is more racially diverse than AI images suggest."
  },
  {
    name: "professors",
    stereotypedGender: "male",
    stereotypedAge: "old",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["women", "female", "young", "diverse", "multicultural", "all genders", "different backgrounds", "mixed", "global"],
    biasNote: "The 'professor' image in AI is almost always an older white man with glasses. Women make up about 45% of tenure-track faculty, but AI drastically underrepresents them."
  },
  {
    name: "librarians",
    stereotypedGender: "female",
    stereotypedAge: "old",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["men", "male", "young", "diverse", "multicultural", "all genders", "mixed", "tech-savvy", "modern"],
    biasNote: "AI defaults to the 'elderly woman with glasses' librarian stereotype. Modern librarians are diverse in age, gender, and background, and the profession is increasingly tech-focused."
  },
  {
    name: "farmers",
    stereotypedGender: "male",
    stereotypedAge: "middle-old",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["women", "female", "young", "diverse", "multicultural", "global", "different crops", "all genders", "mixed", "urban"],
    biasNote: "AI-generated farmer images overwhelmingly show white men in American rural settings. Globally, women make up nearly half of all farmers, and farming practices vary enormously across cultures."
  },
  {
    name: "flight attendants",
    stereotypedGender: "female",
    stereotypedAge: "young",
    stereotypedEthnicity: ["white"],
    counterKeywords: ["men", "male", "older", "diverse", "multicultural", "all genders", "different ages", "mixed", "global"],
    biasNote: "AI strongly associates flight attendants with young women, reflecting decades of sexist hiring practices that the industry has since moved past. About 25% of flight attendants are men."
  },
  {
    name: "tech workers",
    stereotypedGender: "male",
    stereotypedAge: "young",
    stereotypedEthnicity: ["white", "asian"],
    counterKeywords: ["women", "female", "older", "diverse", "multicultural", "all genders", "different backgrounds", "mixed", "global", "disabilities"],
    biasNote: "The 'tech bro' stereotype is alive and well in AI-generated images. Tech workers are depicted as young men in hoodies, despite growing diversity in the field."
  }
];
