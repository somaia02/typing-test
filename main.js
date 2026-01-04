const $personalBestTxt = document.querySelector(".personal-best-txt");
const $startingScreen = document.querySelector(".starting-screen");
const $startBtn = document.querySelector(".start-btn");
const $passageTxt = document.querySelector(".test-passage-txt");
const $passageInput = document.querySelector(".test-passage-input");
const $restartBtn = document.querySelector(".restart-btn");
const $wpmScore = document.querySelector(".score-value-wpm");
const $accuracyScore = document.querySelector(".score-value-accuracy");
const $timeScore = document.querySelector(".score-value-time");

let timerID;
let errorCount = 0;
let totalTypedLetters = 0;
let startingTime = $timeScore.dataset.time;
let testPassage = "The archaeological expedition unearthed artifacts that complicated prevailing theories about Bronze Age trade networks. Obsidian from Anatolia, lapis lazuli from Afghanistan, and amber from the Baltic—all discovered in a single Mycenaean tomb—suggested commercial connections far more extensive than previously hypothesized. \"We've underestimated ancient peoples' navigational capabilities and their appetite for luxury goods,\" the lead researcher observed. \"Globalization isn't as modern as we assume.\"";

function displayDesktop() {
  $personalBestTxt.textContent = "Personal best:";
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
  timerID = setInterval(updateTime, 1000);
}

function updateTime() {
  let currentTime = $timeScore.dataset.time;
  // TODO: check test settings
  currentTime--;
  $timeScore.dataset.time = currentTime;
  minutes = Math.floor(currentTime / 60);
  seconds = currentTime % 60;
  $timeScore.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  if (currentTime === 0) {
    clearInterval(timerID);
    // TODO: Show results
  }
}

function blurPassage() {
  $startingScreen.classList.remove("invisible");
  $passageInput.blur();
  $restartBtn.classList.remove("restart-btn-shown");
}

function handleInvalidAction(e) {
  if (e.key === "ArrowLeft") {
    e.preventDefault();
  }
}
function handlePassageInput(e) {
  const inputPassage = e.target.value;
  const length = inputPassage.length;
  
  if (length > testPassage.length) {
    // TODO: remove this and show results
    e.target.value = e.target.dataset.prevValue;
    return
  }

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

  updateScores();
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
function updateScores() {
  $accuracyScore.textContent = (((totalTypedLetters - errorCount) * 100) / totalTypedLetters).toFixed(2) + "%";
  const typingDuration = Math.abs($timeScore.dataset.time - startingTime) / 60;
  const wordCount = (totalTypedLetters - errorCount) / 5;
  $wpmScore.textContent = Math.round(wordCount / typingDuration);
}
function resetScores() {
  $wpmScore.textContent = "0";
  $accuracyScore.textContent = "100%";
  $timeScore.dataset.time = startingTime;
  $timeScore.textContent = "00:00";
}
function restartTest() {
  resetScores();
  renderPassage();
  $passageInput.value = "";
  $passageInput.dataset.prevValue = "";
  $passageInput.focus();
}

const desktopView = window.matchMedia("(min-width: 40em)").matches;
if (desktopView) {
  displayDesktop();
}

renderPassage();
$startBtn.focus();
$startingScreen.addEventListener("click", startTest);
// $passageInput.addEventListener("blur", blurPassage);
$passageInput.addEventListener("keydown", handleInvalidAction);
$passageInput.addEventListener("input", handlePassageInput);
$restartBtn.addEventListener("click", restartTest);
