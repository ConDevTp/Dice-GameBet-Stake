let balance = 1000;
let betAmount = 0;
let multiplier = 2;
let rollOver = 50;
let winChance = 50;
let lastRandom = null;
let historyItems = [];
let RecentCount = 10;

const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("betAmount");
const errorEl = document.getElementById("error");
const multiplierEl = document.getElementById("multiplier");
const rollOverEl = document.getElementById("rollOver");
const winChanceEl = document.getElementById("winChance");
const slider = document.getElementById("slider");
const historyEl = document.getElementById("history");
const hexResult = document.getElementById("hexResult");
const resultMsg = document.getElementById("resultMsg");
const winSound = document.getElementById("winSound");
const mClick = document.getElementById("m-click");
const Role = document.getElementById("role");
const tickSound = document.getElementById("tickSound");
const betBtn = document.getElementById("betBtn");
const halfBtn = document.getElementById("halfBtn");
const doubleBtn = document.getElementById("doubleBtn");
const historyListEl = document.getElementById("historyList");
function handleResize() {
  if (window.innerWidth >= 992) {
    RecentCount = 12;
  } else {
    RecentCount = 5;
  }
}

handleResize();

window.addEventListener("resize", handleResize);
function calculateMultiplier(value) {
  return value !== 100
    ? (100 / (100 - value)).toFixed(4)
    : (100 / value).toFixed(4);
}
function calculateWinChance(value) {
  return (100 - value).toFixed(2);
}

halfBtn.addEventListener("click", () => {
  let val = parseFloat(betInput.value) || 0;
  if (val > 0) betInput.value = (val / 2).toFixed(2);
  betInput.dispatchEvent(new Event("input"));
});
doubleBtn.addEventListener("click", () => {
  let val = parseFloat(betInput.value) || 0;
  if (val > 0) betInput.value = (val * 2).toFixed(2);
  betInput.dispatchEvent(new Event("input"));
});

function addToHistory(num, isWin) {
  const item = document.createElement("div");
  item.className = "item " + (isWin ? "win" : "lose");
  item.textContent = num;
  historyEl.prepend(item);
  if (historyEl.children.length > RecentCount)
    historyEl.removeChild(historyEl.lastChild);
}

function updateHexColor() {
  if (lastRandom === null) return;
  const isWin = lastRandom > rollOver;
  hexResult.className = "hex " + (isWin ? "win" : "lose");
  hexResult.textContent = lastRandom;

  hexResult.style.transform = "translateY(-15px)";
  setTimeout(() => {
    hexResult.style.transform = "translateY(0)";
  }, 150);
}

function showResultMessage(isWin, amount) {
  resultMsg.textContent = isWin
    ? `You won $${amount.toFixed(2)}!`
    : "You lost!";
  resultMsg.className = "result-msg " + (isWin ? "win" : "lose");
  resultMsg.style.opacity = 0.7;
  setTimeout(() => {
    resultMsg.style.opacity = 0;
  }, 400);
}

function updateBetButton() {
  betBtn.disabled = betAmount <= 0 || betAmount > balance;
}

slider.addEventListener("input", (e) => {
  rollOver = parseInt(e.target.value);

  multiplier = calculateMultiplier(rollOver);
  winChance = calculateWinChance(rollOver);
  rollOverEl.textContent = rollOver;
  multiplierEl.textContent = multiplier + "X";
  winChanceEl.textContent = winChance + "%";

  const percent = (rollOver / 100) * 100;
  slider.style.background = `linear-gradient(to right, red ${percent}%, limegreen ${percent}%)`;

  updateHexColor();

  tickSound.currentTime = 0;
  tickSound.play();
});

betBtn.addEventListener("click", () => {
  mClick.play();
  Role.play();
  if (betAmount <= 0 || betAmount > balance) return;

  balance -= betAmount;
  balanceEl.textContent = balance.toFixed(2);

  const winProbability = 0.3;
  let randomNumber;
  const fakeRandom = Math.random();

  if (fakeRandom < winProbability) {
    randomNumber = Math.floor(Math.random() * (100 - rollOver)) + rollOver;
  } else {
    randomNumber = Math.floor(Math.random() * rollOver) + 1;
  }

  const isWin = randomNumber > rollOver;
  lastRandom = randomNumber;

  const winnings = isWin ? betAmount * multiplier : 0;

  historyItems.push({
    isWin,
    bet: betAmount,
    multiplier,
    winAmount: winnings,
    time: Date.now(),
  });

  addToHistory(randomNumber, isWin);
  renderHistory();

  const value = +randomNumber;
  const min = +slider.min;
  const max = +slider.max;
  const sliderWidth = slider.offsetWidth;
  const hexWidth = 48;
  const thumbWidth = 23;
  const percent = (value - min) / (max - min);
  const pos = percent * (sliderWidth - thumbWidth) + thumbWidth / 2;

  hexResult.style.left = `${pos - hexWidth / 4}px`;
  hexResult.style.visibility = "visible";
  updateHexColor();

  if (isWin) {
    balance += winnings;
    balanceEl.textContent = balance.toFixed(2);
    showResultMessage(true, winnings);
    winSound.currentTime = 0;
    winSound.play();
  } else {
    showResultMessage(false);
  }

  updateBetButton();
});

betInput.addEventListener("input", () => {
  betAmount = parseFloat(betInput.value);
  if (betAmount > balance) errorEl.textContent = "Bet cannot exceed balance";
  else errorEl.textContent = "";
  updateBetButton();
});

slider.dispatchEvent(new Event("input"));
updateBetButton();
renderHistory();

// history

function renderHistory() {
  historyListEl.innerHTML = "";

  if (historyItems.length === 0) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "empty-history";
    emptyDiv.textContent = "Empty History";
    historyListEl.appendChild(emptyDiv);
    return;
  }

  historyItems
    .slice(-50)
    .reverse()
    .forEach((item) => {
      const div = document.createElement("div");
      div.className = "history-item " + (item.isWin ? "win" : "lose");
      div.innerHTML = `
        <div><strong>Odds:</strong> ${item.multiplier}x</div>
        <div><strong>Bet Amount:</strong> $${item.bet.toFixed(2)}</div>
        <div><strong class='lose-text'>${
          item.isWin ? "Win Amount" : "Win Amount"
        }:</strong> ${item.isWin ? "$" + item.winAmount.toFixed(2) : "-"}</div>
        <div class="time">${new Date(item.time).toLocaleTimeString()}</div>
      `;
      historyListEl.appendChild(div);
    });
}

function ShowHistory() {
  const element = document.getElementById("m-con-history");
  element.classList.add("m-show");
}

function HideHistory() {
  const element = document.getElementById("m-con-history");
  element.classList.remove("m-show");
}

// window.addEventListener("resize", () => {
//   canvas.width = document.getElementById("conAnimation").offsetWidth;
//   canvas.height = document.getElementById("conAnimation").offsetHeight;
//   maxHeight = canvas.height * 0.55;
// });

// document.addEventListener("contextmenu", (e) => e.preventDefault());
// document.addEventListener("keydown", (e) => {
//   if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
//     e.preventDefault();
//   }
// });
