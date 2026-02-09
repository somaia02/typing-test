class ResultView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode : 'open'});
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="results.css">
      <slot name="icon"><img src="assets/images/icon-completed.svg" alt="" class="complete-icon"></slot>
      <div class="text">
        <h1 class="title"><slot name="title">Test Complete!</slot></h1>
        <p class="content"><slot name="content">Solid run. Keep pushing to beat your high score.</slot></p>
      </div>
      <div class="scores">
        <div class="score-item">
          <p class="score-label">WPM:</p>
          <span class="score-value"><slot name="wpm">0</slot></span>
        </div>
        <div class="score-item">
          <p class="score-label">Accuracy</p>
          <span class="score-value red-txt"><slot name="accuracy">0</slot></span>
        </div>
        <div class="score-item">
          <p class="score-label">Characters</p>
          <span class="score-value">
            <span class="green-txt"><slot name="characters">0</slot></span><span class="grey-txt">/</span><span class="red-txt">5</span>
          </span>
        </div>
      </div>
      <button type="button" class="restart-btn">
        <slot name="restart-btn-txt"><span>Go Again</span></slot>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill="currentColor" d="M1.563 1.281h.949c.246 0 .422.211.422.457l-.07 3.446a8.6 8.6 0 0 1 7.277-3.868c4.816 0 8.718 3.938 8.718 8.72-.035 4.816-3.937 8.683-8.718 8.683a8.86 8.86 0 0 1-5.871-2.215.446.446 0 0 1 0-.633l.703-.703c.14-.14.386-.14.562 0 1.23 1.09 2.813 1.723 4.606 1.723A6.88 6.88 0 0 0 17.03 10c0-3.797-3.093-6.89-6.89-6.89-2.813 0-5.203 1.687-6.293 4.078l4.43-.106c.245 0 .456.176.456.422v.95c0 .245-.21.421-.421.421h-6.75a.406.406 0 0 1-.422-.422v-6.75c0-.21.175-.422.422-.422"/></svg>
      </button>
    `;
  }

  connectedCallback() {
    const restartBtn = this.shadowRoot.querySelector("button");
    restartBtn.focus();
    restartBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }
}

customElements.define("result-view", ResultView);