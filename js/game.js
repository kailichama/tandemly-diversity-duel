/**
 * Game state machine — screen transitions, round tracking, UI logic.
 */

const WORD_LIMITS = [6, 5, 4];
const TOTAL_ROUNDS = 3;

const state = {
  currentScreen: "title",
  round: 0,
  wordLimit: 6,
  occupations: [],
  roundResults: [],
  totalScore: 0,
  highScore: parseInt(localStorage.getItem("dd-highscore") || "0", 10)
};

function initGame() {
  // Pick 3 random non-repeating occupations
  const shuffled = [...OCCUPATIONS].sort(() => Math.random() - 0.5);
  state.occupations = shuffled.slice(0, TOTAL_ROUNDS);
  state.round = 0;
  state.roundResults = [];
  state.totalScore = 0;
  showScreen("title");
  updateHighScoreDisplay();
}

function startGame() {
  state.round = 0;
  state.roundResults = [];
  state.totalScore = 0;
  startRound();
}

function startRound() {
  state.wordLimit = WORD_LIMITS[state.round];
  const occ = state.occupations[state.round];

  // Update round start screen
  document.getElementById("round-number").textContent = `Round ${state.round + 1} of ${TOTAL_ROUNDS}`;
  document.getElementById("word-limit-display").textContent = state.wordLimit;
  document.getElementById("occupation-name").textContent = occ.name;

  showScreen("round-start");
}

function goToInput() {
  const occ = state.occupations[state.round];
  document.getElementById("input-occupation").textContent = occ.name;
  document.getElementById("input-word-limit").textContent = `${state.wordLimit} words max`;
  document.getElementById("prompt-input").value = "";
  document.getElementById("word-count").textContent = `0 / ${state.wordLimit}`;
  document.getElementById("word-count").className = "word-count";
  document.getElementById("submit-btn").disabled = true;
  document.getElementById("prompt-input").focus();
  showScreen("prompt-input-screen");
}

function handleInput() {
  const input = document.getElementById("prompt-input");
  const words = input.value.trim().split(/\s+/).filter(w => w.length > 0);
  const count = input.value.trim() === "" ? 0 : words.length;
  const counter = document.getElementById("word-count");
  const btn = document.getElementById("submit-btn");

  counter.textContent = `${count} / ${state.wordLimit}`;

  if (count === 0) {
    counter.className = "word-count";
    btn.disabled = true;
  } else if (count > state.wordLimit) {
    counter.className = "word-count over";
    btn.disabled = true;
  } else if (count === state.wordLimit) {
    counter.className = "word-count perfect";
    btn.disabled = false;
  } else {
    counter.className = "word-count ok";
    btn.disabled = false;
  }
}

function submitPrompt() {
  const prompt = document.getElementById("prompt-input").value.trim();
  const words = prompt.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0 || words.length > state.wordLimit) return;

  const occ = state.occupations[state.round];
  const result = scorePrompt(prompt, occ);
  const interpretation = generateInterpretation(prompt, occ, result);
  const feedback = generateFeedback(prompt, occ, result);

  state.roundResults.push({ prompt, occupation: occ, result, interpretation, feedback });
  state.totalScore += result.total;

  showResults(prompt, occ, result, interpretation, feedback);
}

function showResults(prompt, occ, result, interpretation, feedback) {
  const s = result.scores;

  // Update results screen
  document.getElementById("result-round").textContent = `Round ${state.round + 1}`;
  document.getElementById("result-occupation").textContent = occ.name;
  document.getElementById("result-prompt").textContent = `"${document.getElementById("prompt-input").value.trim()}"`;
  document.getElementById("result-score").textContent = result.total;

  // Animate bars
  animateBar("bar-gender", s.gender, 20);
  animateBar("bar-ethnicity", s.ethnicity, 20);
  animateBar("bar-age", s.age, 10);
  animateBar("bar-context", s.context, 20);
  animateBar("bar-antistereotype", s.antiStereotype, 30);

  // Score labels
  document.getElementById("score-gender").textContent = `${s.gender}/20`;
  document.getElementById("score-ethnicity").textContent = `${s.ethnicity}/20`;
  document.getElementById("score-age").textContent = `${s.age}/10`;
  document.getElementById("score-context").textContent = `${s.context}/20`;
  document.getElementById("score-antistereotype").textContent = `${s.antiStereotype}/30`;

  // Interpretation
  document.getElementById("ai-interpretation").textContent = interpretation;

  // Feedback
  const feedbackEl = document.getElementById("feedback-content");
  let feedbackHTML = "";

  if (feedback.strong.length > 0) {
    feedbackHTML += `<div class="feedback-strong">Strong on: ${feedback.strong.join(", ")}</div>`;
  }

  if (feedback.missing.length > 0) {
    feedbackHTML += '<div class="feedback-missing">';
    feedback.missing.forEach(m => {
      feedbackHTML += `<div class="feedback-tip"><span class="tip-dim">${m.dim}:</span> ${m.tip}</div>`;
    });
    feedbackHTML += '</div>';
  }

  feedbackHTML += `<div class="bias-note">${feedback.biasNote}</div>`;

  if (result.penalty) {
    feedbackHTML += '<div class="penalty-note">Tip: Try writing a natural-sounding prompt with at least one noun or verb, not just a list of adjectives.</div>';
  }

  feedbackEl.innerHTML = feedbackHTML;

  // Running total
  document.getElementById("running-total").textContent = `Total: ${state.totalScore} / ${(state.round + 1) * 100}`;

  // Next button text
  const nextBtn = document.getElementById("next-btn");
  if (state.round >= TOTAL_ROUNDS - 1) {
    nextBtn.textContent = "See Final Results";
  } else {
    nextBtn.textContent = "Next Round";
  }

  showScreen("results");
}

function animateBar(id, score, max) {
  const bar = document.getElementById(id);
  const pct = (score / max) * 100;
  bar.style.width = "0%";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bar.style.width = pct + "%";
    });
  });
}

function nextRound() {
  state.round++;
  if (state.round >= TOTAL_ROUNDS) {
    showFinalResults();
  } else {
    startRound();
  }
}

function showFinalResults() {
  const title = getPerformanceTitle(state.totalScore);
  const insight = getFinalInsight(state.totalScore, state.roundResults);

  document.getElementById("final-score").textContent = state.totalScore;
  document.getElementById("final-max").textContent = TOTAL_ROUNDS * 100;
  document.getElementById("performance-title").textContent = title;
  document.getElementById("final-insight").textContent = insight;

  // Round breakdown
  const breakdownEl = document.getElementById("round-breakdown");
  let breakdownHTML = "";
  state.roundResults.forEach((r, i) => {
    breakdownHTML += `
      <div class="breakdown-row">
        <span class="breakdown-round">R${i + 1}</span>
        <span class="breakdown-occ">${r.occupation.name}</span>
        <span class="breakdown-prompt">"${r.prompt}"</span>
        <span class="breakdown-score">${r.result.total}</span>
      </div>`;
  });
  breakdownEl.innerHTML = breakdownHTML;

  // High score
  if (state.totalScore > state.highScore) {
    state.highScore = state.totalScore;
    localStorage.setItem("dd-highscore", state.highScore.toString());
    document.getElementById("new-highscore").style.display = "block";
  } else {
    document.getElementById("new-highscore").style.display = "none";
  }
  updateHighScoreDisplay();

  showScreen("final");
}

function updateHighScoreDisplay() {
  const el = document.getElementById("high-score");
  if (el) el.textContent = state.highScore > 0 ? `Best: ${state.highScore}` : "";
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const screen = document.getElementById(screenId);
  if (screen) screen.classList.add("active");
  state.currentScreen = screenId;
}

function playAgain() {
  // Re-pick occupations
  const shuffled = [...OCCUPATIONS].sort(() => Math.random() - 0.5);
  state.occupations = shuffled.slice(0, TOTAL_ROUNDS);
  startGame();
}

// Init on load
document.addEventListener("DOMContentLoaded", initGame);
