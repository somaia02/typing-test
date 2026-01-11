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
const settings = {
  "difficulty": "easy",
  "mode": "timed"
};

let timeUpdateInterval, scoreUpdateInterval;
let errorCount = 0;
let totalTypedLetters = 0;
let startingTime = $timeScore.dataset.time;
let bestWPM = localStorage.bestWPM || 0;
let passageData;
let testPassage;

async function fetchPassageData() {
  const response = await fetch("https://raw.githubusercontent.com/somaia02/typing-test/master/data.json");
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  passageData = await response.json();
  return passageData;
}

function displayDesktop() {
  $personalBestTxt.textContent = "Personal best:";
}
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
function changeSetting(e, i) {
  settings[e.target.name] = e.target.value;
  $settingBtnTexts[i].textContent = e.target.labels[0].textContent;
  restartTest();
}
function selecRandomPassage(passageData) {
  let passages = passageData[settings.difficulty];
  return passages[Math.floor(Math.random() * passages.length)].text;
}
function renderPassage() {
  testPassage = selecRandomPassage(passageData);
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
  timeUpdateInterval = setInterval(updateTime, 1000);
  scoreUpdateInterval = setInterval(updateScores, 1000);
}

function updateTime() {
  let currentTime = $timeScore.dataset.time;
  if (settings.mode === "timed") {
    currentTime--;
  } else {
    currentTime++;
  }
  $timeScore.dataset.time = currentTime;
  minutes = Math.floor(currentTime / 60);
  seconds = currentTime % 60;
  $timeScore.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  if (currentTime === 0) {
    clearInterval(timeUpdateInterval);
    clearInterval(scoreUpdateInterval);
    processResults();
  }
}
function focusPassage(){
  $passageInput.focus();
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
    // TODO: remove this 
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
function computeWPM() {
  const typingDuration = Math.abs($timeScore.dataset.time - startingTime) / 60;
  const wordCount = (totalTypedLetters - errorCount) / 5;
  return Math.round(wordCount / typingDuration);
}
function updateScores() {
  if (totalTypedLetters) {
    const acc = ((totalTypedLetters - errorCount) * 100) / totalTypedLetters;
    $accuracyScore.textContent = (acc < 100 ? acc.toFixed(2) : acc) + "%";
  }
  $wpmScore.textContent = computeWPM();
}
function resetScores() {
  errorCount = 0;
  totalTypedLetters = 0;

  $wpmScore.textContent = "0";
  $accuracyScore.textContent = "100%";
  $timeScore.dataset.time = startingTime;
  $timeScore.textContent = startingTime ? "00:60" : "00:00";
}
function processResults() {
  clearInterval(timeUpdateInterval);
  clearInterval(scoreUpdateInterval);
  const finalWPM = computeWPM();
  bestWPM = Math.max(bestWPM, finalWPM);
  localStorage.bestWPM = bestWPM;
  $bestSpeedValue.textContent = bestWPM + "WPM";
}
function restartTest() {
  if (settings.mode === "timed") {
    startingTime = 60;
    $timeScore.dataset.time = 60;
  } else {
    startingTime = 0;
    $timeScore.dataset.time = 0;
  }
  resetScores();
  renderPassage();
  $passageInput.value = "";
  $passageInput.dataset.prevValue = "";
  $passageInput.focus();
}

fetchPassageData().then(renderPassage)
.catch ((error) => {
  console.error(`Could not get passages: ${error}`);
});

const desktopView = window.matchMedia("(min-width: 40em)").matches;
if (desktopView) {
  displayDesktop();
}

$bestSpeedValue.textContent = bestWPM + "WPM";
$settingBtns.forEach((btn, i) => btn.addEventListener("click", () => toggleOptions(i)));
$settingOptions.forEach((options, i) => options.addEventListener("change", (e) => changeSetting(e, i)));
window.addEventListener("click", hideDropdowns);
$startBtn.focus();
$startingScreen.addEventListener("click", startTest);
$passageTxt.addEventListener("click", focusPassage);
$passageInput.addEventListener("keydown", handleInvalidAction);
$passageInput.addEventListener("input", handlePassageInput);
$restartBtn.addEventListener("click", restartTest);
