function displayDesktop() {
  const personalBestTxt = document.querySelector(".personal-best-txt");
  personalBestTxt.textContent = "Personal best";
}

const desktopView = window.matchMedia("(min-width: 40em)").matches;
if (desktopView) {
  displayDesktop();
}