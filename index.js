const startBtn = document.querySelector("#startBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const countdown = document.querySelector("#countdown");
const video = document.querySelector("#meditationVideo");
const audio = document.querySelector("#meditationAudio");
const endSound = document.querySelector("#endSound");
const message = document.querySelector("#message");
const durationSelect = document.querySelector("#duration");

let timerId = null;
let remainingSeconds = 0;
let isPaused = false;

// ✅ Show correct time immediately when user changes duration (before starting)
durationSelect.addEventListener("change", () => {
  // don't allow changing duration during an active session
  if (startBtn.disabled) return;

  const minutesChosen = parseInt(durationSelect.value, 10);
  updateCountdown(minutesChosen * 60);
});

// ✅ Set initial countdown based on selected option on page load
updateCountdown(parseInt(durationSelect.value, 10) * 60);

startBtn.addEventListener("click", async () => {
  const minutesChosen = parseInt(durationSelect.value, 10);
  remainingSeconds = minutesChosen * 60;

  // Reset state
  isPaused = false;
  message.textContent = "";
  updateCountdown(remainingSeconds);

  // UI states
  startBtn.disabled = true;
  durationSelect.disabled = true;
  pauseBtn.disabled = false;
  pauseBtn.textContent = "Pause";

  // Start media (can be blocked by browser, so try/catch)
  try {
    audio.currentTime = 0;
    await audio.play();
  } catch (e) {
    console.log("Audio play blocked:", e);
  }

  try {
    await video.play();
  } catch (e) {
    console.log("Video play blocked:", e);
  }

  // Start timer (make sure no duplicate interval)
  if (timerId) clearInterval(timerId);
  timerId = setInterval(tick, 1000);
});

pauseBtn.addEventListener("click", async () => {
  // If session hasn't started, do nothing
  if (!startBtn.disabled) return;

  if (!isPaused) {
    // PAUSE
    isPaused = true;

    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }

    audio.pause();
    video.pause();

    pauseBtn.textContent = "Resume";
    message.textContent = "Paused ⏸️";
    return;
  }

  // RESUME
  isPaused = false;
  message.textContent = "";

  // Restart timer
  if (!timerId) timerId = setInterval(tick, 1000);

  // Resume media
  try {
    // tiny nudge helps some browsers resume correctly
    if (audio.currentTime === 0 && remainingSeconds > 0) {
      audio.currentTime = 0.01;
    }
    await audio.play();
  } catch (e) {
    console.log("Audio resume blocked:", e);
  }

  try {
    await video.play();
  } catch (e) {
    console.log("Video resume blocked:", e);
  }

  pauseBtn.textContent = "Pause";
});

function tick() {
  remainingSeconds--;
  updateCountdown(remainingSeconds);

  if (remainingSeconds < 0) {
    finishSession();
  }
}

function finishSession() {
  if (timerId) clearInterval(timerId);
  timerId = null;

  audio.pause();
  audio.currentTime = 0;

  endSound.currentTime = 0;
  endSound.play();

  countdown.textContent = "0:00";
  message.textContent = "Session Complete 🌟";

  // UI reset
  pauseBtn.disabled = true;
  pauseBtn.textContent = "Pause";
  startBtn.disabled = false;
  durationSelect.disabled = false;

  // Show the selected duration again after finishing
  updateCountdown(parseInt(durationSelect.value, 10) * 60);
}

function updateCountdown(secondsLeft) {
  const safeSeconds = Math.max(0, secondsLeft);
  const minutes = Math.floor(safeSeconds / 60);
  let seconds = safeSeconds % 60;
  if (seconds < 10) seconds = "0" + seconds;
  countdown.textContent = `${minutes}:${seconds}`;
}

/* GSAP animations */
gsap.from(".container", { opacity: 0, y: -50, scale: 0.9 });
gsap.from("h1", { opacity: 0, duration: 1, y: -50, delay: 0.5 });
gsap.from("#startBtn", { opacity: 0, duration: 1, y: 50, delay: 1 });
gsap.from("#pauseBtn", { opacity: 0, duration: 1, y: 50, delay: 1 });
gsap.from("#countdown", { opacity: 0, duration: 1, y: 50, delay: 1.5 });





