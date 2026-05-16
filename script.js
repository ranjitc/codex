const video = document.getElementById('bgVideo');

const layerDepthById = {
  'hero-layer': 0.08,
  'feature-row-one': 0.12,
  'feature-copy': 0.22,
  'feature-image-one': 0.27,
  'center-layer': 0.11,
  'feature-row-two': 0.12,
  'feature-image-two': 0.24,
  'feature-copy-two': 0.2,
  'end-layer': 0.06,
};

const SMOOTHING = 0.1;
const SEEK_EPSILON = 0.008;
const SCRUB_STEP_SECONDS = 1 / 30;
const MAX_TIME_DELTA_PER_FRAME = 0.05;

let videoDuration = 0;
let targetTime = 0;
let currentTime = 0;
let rafId = null;

video.addEventListener('loadedmetadata', () => {
  videoDuration = video.duration || 0;
  video.play().then(() => video.pause()).catch(() => {});
  tick();
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function snapToStep(value, step) {
  return Math.round(value / step) * step;
}

function updateTargetsFromScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;

  if (videoDuration > 0) {
    const rawTargetTime = progress * videoDuration;
    targetTime = clamp(snapToStep(rawTargetTime, SCRUB_STEP_SECONDS), 0, videoDuration);
  }

  Object.entries(layerDepthById).forEach(([id, depth]) => {
    const item = document.getElementById(id);
    if (!item) return;

    const offset = window.scrollY * depth * -0.2;
    item.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

function tick() {
  const smoothedTime = lerp(currentTime, targetTime, SMOOTHING);
  const boundedDelta = clamp(smoothedTime - currentTime, -MAX_TIME_DELTA_PER_FRAME, MAX_TIME_DELTA_PER_FRAME);
  currentTime += boundedDelta;

  if (videoDuration > 0 && Math.abs(video.currentTime - currentTime) > SEEK_EPSILON) {
    video.currentTime = clamp(currentTime, 0, videoDuration);
  }

  rafId = window.requestAnimationFrame(tick);
}

window.addEventListener('scroll', updateTargetsFromScroll, { passive: true });
window.addEventListener('resize', updateTargetsFromScroll);

updateTargetsFromScroll();
if (!rafId) {
  tick();
}
