const $personalBestTxt = document.querySelector(".personal-best-txt");
const $startingScreen = document.querySelector(".starting-screen");
const $startBtn = document.querySelector(".start-btn");
const $passageTxt = document.querySelector(".test-passage-txt");
const $passageInput = document.querySelector(".test-passage-input");

let testPassage = "The archaeological expedition unearthed artifacts that complicated";

function displayDesktop() {
  $personalBestTxt.textContent = "Personal best:";
}

function renderPassage() {
  for (let i in testPassage) {
    const letter = document.createElement("span");
    letter.id = String(i);
    letter.classList.add("letter");
    letter.textContent = testPassage[i];
    $passageTxt.appendChild(letter);
  }
}

function showPassage() {
  $startingScreen.classList.add("invisible");
  $passageInput.focus();
}

function blurPassage() {
  $startingScreen.classList.remove("invisible");
}

function handleInvalidAction(e) {
  if (e.key === "ArrowLeft") {
    e.preventDefault();
  }
}
function handlePassageInput(e) {
  const inputPassage = e.target.value;
  const length = inputPassage.length;

  // End of passage OR deletion/insertion of multiple letters at once
  if (
    length > testPassage.length ||
    Math.abs(length - e.target.dataset.prevValue.length) !== 1
  ) {
    e.target.value = e.target.dataset.prevValue;
    return
  }

  if (e.inputType === "deleteContentBackward") {
    handleDelete(length);
  } else if (e.inputType === "insertText") {
    handleInsert(inputPassage, length);
  }
  e.target.dataset.prevValue = inputPassage;
}

function handleInsert(inputPassage, length) {
  const letter = document.getElementById(length - 1);
  letter.classList.remove("highlighted-letter");
  if (inputPassage.at(-1) === letter.textContent) {
    letter.classList.add("green-letter");
  } else {
    letter.classList.add("red-letter");
  }

  const nxtLetter = document.getElementById(length);
  if (nxtLetter) {
    nxtLetter.classList.add("highlighted-letter");
  }
}
function handleDelete(length) {
  const letter = document.getElementById(length);
  letter.classList.add("highlighted-letter");
  letter.classList.remove("green-letter");
  letter.classList.remove("red-letter");

  const nxtLetter = document.getElementById(length + 1);
  if (nxtLetter) {
    nxtLetter.classList.remove("highlighted-letter");
  }
}

const desktopView = window.matchMedia("(min-width: 40em)").matches;
if (desktopView) {
  displayDesktop();
}

renderPassage();
$startBtn.focus();
$startBtn.addEventListener("click", showPassage);
$startingScreen.addEventListener("click", showPassage);
$passageInput.addEventListener("blur", blurPassage);
$passageInput.addEventListener("keydown", handleInvalidAction);
$passageInput.addEventListener("input", handlePassageInput);
