import "./style.css"
import "./results.js"
import { fetchPassageData } from "./data.js";
import { computeAccuracy, computeWPM } from "./scores.js";

const $main = document.querySelector("main");
const $personalBestTxt = document.querySelector(".personal-best-txt");
const $bestSpeedValue = document.querySelector(".best-speed-value");
const $settingItems = document.querySelectorAll(".setting-item");
const $settingBtns = document.querySelectorAll(".setting-btn");
const $settingBtnTexts = document.querySelectorAll(".setting-btn-txt");
const $settingOptions = document.querySelectorAll(".setting-options");
const $startingScreen = document.querySelector(".starting-screen");
const $startBtn = document.querySelector(".start-btn");
const $passageTxt = document.querySelector(".test-passage-txt");
const $passageInput = document.querySelector(".test-passage-input");
const $restartBtn = document.querySelector(".restart-btn");
const $wpmScore = document.querySelector(".score-value-wpm");
const $accuracyScore = document.querySelector(".score-value-accuracy");
const $timeScore = document.querySelector(".score-value-time");

// State
const settings = {
  "difficulty": "easy",
  "mode": "timed"
};
let errorCount = 0;
let totalTypedLetters = 0;
let startingTime = 60;
let currentTime = startingTime;
let bestWPM = localStorage.bestWPM || 0;
let passageData;
let testPassage;

let scoreUpdateInterval;

// Display dynamic content
function renderBestWPM() {
  $bestSpeedValue.textContent = bestWPM + "WPM";
}
function renderWPM() {
  $wpmScore.textContent = computeWPM(startingTime, currentTime, totalTypedLetters, errorCount);
}
function renderAccuracy() {
  const acc = computeAccuracy(totalTypedLetters, errorCount);
  $accuracyScore.textContent = acc + "%";
}
function renderTime() {
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  $timeScore.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
function renderScores() {
  renderWPM();
  renderAccuracy();
  renderTime();
}
function renderSettings() {
  for (let i = 0; i < $settingItems.length; i++) {
    $settingBtnTexts[i].textContent = $settingOptions[i].querySelector('input:checked').labels[0].textContent;
  }
}
function renderPassage() {
  $passageTxt.innerHTML = "";
  for (let i in testPassage) {
    const letter = document.createElement("span");
    letter.id = String(i);
    letter.classList.add("letter");
    letter.textContent = testPassage[i];
    $passageTxt.appendChild(letter);
  }
  $passageInput.value = "";
  $passageInput.dataset.prevValue = "";
}
function renderResults() {
  $main.classList.remove("main-test");
  const wpm = computeWPM(startingTime, currentTime, totalTypedLetters, errorCount);
  const acc = computeAccuracy(totalTypedLetters, errorCount);
  const acc_color = acc == 100 ? "green-txt" : "red-txt";
  let resultTxt = "";

  if (!localStorage.bestWPM) {    
    resultTxt += `
      <span slot="title">Baseline Established!</span>
      <span slot="content">You've set the bar. Now the real challenge begins—time to beat it.</span>
    `;
  } else if (wpm > bestWPM) {
    resultTxt += `
      <img src="assets/images/icon-new-pb.svg" alt="" slot="icon">
      <span slot="title">High Score Smashed!</span>
      <span slot="content">You're getting faster. That was incredible typing.</span>
      <span slot="restart-btn-txt">Beat This Score</span>
    `;
  }
  $main.innerHTML = `
    <result-view>
      ${resultTxt}
      <span slot="wpm">${wpm}</span>
      <span slot="accuracy" class="${acc_color}">${acc}%</span>
      <span slot="characters">${totalTypedLetters}</span>
    </result-view>
  `;
}

// Handle settings
function hideDropdowns(event) {
  for (let i = 0; i < $settingItems.length; i++) {
    const clickArea = $settingItems[i];
    const dropdown = $settingOptions[i];
    if (!clickArea.contains(event.target)) {
      dropdown.classList.add("invisible");
    }
  }
}
function toggleOptions(i) {
  $settingOptions[i].classList.toggle("invisible");
}
function changeSetting(e) {
  settings[e.target.name] = e.target.value;
  if (e.target.name == "mode") {
    startingTime = e.target.value == "timed" ? 60 : 0;
  }
  renderSettings();
  restartTest();
}

// Handle input
function handleInvalidAction(e) {
  if (e.key === "ArrowLeft") {
    e.preventDefault();
  }
}
function handlePassageInput(e) {
  const inputPassage = e.target.value;
  const length = inputPassage.length;
  
  // Prevent deletion/insertion of multiple letters at once
  if (Math.abs(length - e.target.dataset.prevValue.length) !== 1) {
    e.target.value = e.target.dataset.prevValue;
    return
  }

  if (e.inputType === "deleteContentBackward") {
    handleDelete(length);
  } else if (e.inputType === "insertText") {
    handleInsert(inputPassage, length);
  }
  
  e.target.dataset.prevValue = inputPassage;

  if (length === testPassage.length) {
    processResults();
    return;
  }
  
  autoScroll(length);
}

function handleInsert(inputPassage, length) {
  const letter = document.getElementById(length - 1);
  letter.classList.remove("highlighted-letter");
  if (inputPassage.at(-1) === letter.textContent) {
    letter.classList.add("green-txt");
  } else {
    letter.classList.add("red-txt");
    letter.classList.add("underlined-txt");
    errorCount++;
  }
  totalTypedLetters++;

  const nxtLetter = document.getElementById(length);
  if (nxtLetter) {
    nxtLetter.classList.add("highlighted-letter");
  }
}
function handleDelete(length) {
  const letter = document.getElementById(length);
  letter.classList.add("highlighted-letter");
  letter.classList.remove("green-txt");
  letter.classList.remove("red-txt");
  letter.classList.remove("underlined-txt");

  const nxtLetter = document.getElementById(length + 1);
  if (nxtLetter) {
    nxtLetter.classList.remove("highlighted-letter");
  }
}
function autoScroll(length) {
  const letter = document.getElementById(length);
  const scrollValue = letter.offsetTop - 0.5 * $passageTxt.offsetHeight;
  $passageTxt.scroll({
    top: scrollValue,
    left: 0,
    behavior: "smooth",
  });
}

// Test start/restart
function selecRandomPassage() {
  let passages = passageData[settings.difficulty];
  return passages[Math.floor(Math.random() * passages.length)].text;
}
function restartTest() {
  errorCount = 0;
  totalTypedLetters = 0;
  currentTime = startingTime;
  testPassage = selecRandomPassage();
  renderScores();
  renderPassage();
  $passageInput.focus();
}
function startTest() {
  // Show passage
  $startingScreen.classList.add("invisible");
  $passageInput.focus();
  $restartBtn.classList.add("restart-btn-shown");

  // Add colors to scores
  $accuracyScore.classList.add("red-txt");
  $timeScore.classList.add("yellow-txt");

  // Start timer
  scoreUpdateInterval = setInterval(updateScores, 1000);
}

// Scores
function updateScores() {
  if (settings.mode === "timed") {
    currentTime--;
  } else {
    currentTime++;
  }
  renderScores();
  if (currentTime === 0) {
    processResults();
  }
}

// Result
function processResults() {
  clearInterval(scoreUpdateInterval);
  renderResults(); 
  bestWPM = Math.max(bestWPM, computeWPM(startingTime, currentTime, totalTypedLetters, errorCount));
  localStorage.bestWPM = bestWPM;
  renderBestWPM();
}

// Other
function focusPassage(){
  $passageInput.focus();
}
function displayDesktop() {
  $personalBestTxt.textContent = "Personal best:";
}

fetchPassageData().then((data) => {
  passageData = data;
  testPassage = selecRandomPassage();
  renderPassage();
})
.catch ((error) => {
  console.error(`Could not get passages: ${error}`);
});

const desktopView = window.matchMedia("(min-width: 40em)").matches;
if (desktopView) {
  displayDesktop();
}

$bestSpeedValue.textContent = bestWPM + "WPM";
$settingBtns.forEach((btn, i) => btn.addEventListener("click", () => toggleOptions(i)));
$settingOptions.forEach((options) => options.addEventListener("change", (e) => changeSetting(e)));
window.addEventListener("click", hideDropdowns);
$startBtn.focus();
$startingScreen.addEventListener("click", startTest);
$passageTxt.addEventListener("click", focusPassage);
$passageInput.addEventListener("keydown", handleInvalidAction);
$passageInput.addEventListener("input", handlePassageInput);
$restartBtn.addEventListener("click", restartTest);
