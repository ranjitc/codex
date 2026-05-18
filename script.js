const video = document.getElementById('bgVideo');
const chatLog = document.getElementById('demoChatLog');

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

let videoDuration = 0;
let lastChatIndex = -1;

const chatBeats = [
  { progress: 0.06, text: '👋 Welcome! Scroll to scrub through the neighborhood flythrough.' },
  { progress: 0.23, text: '🏠 This elevation uses layered cards to create a 3D depth feel.' },
  { progress: 0.43, text: '🌇 Midway point: your scroll position is now steering the background video.' },
  { progress: 0.66, text: '🛋️ Interior highlight: copy and media are offset with separate parallax rates.' },
  { progress: 0.87, text: '✅ End scene reached. Scroll up to replay and compare section pacing.' },
];

function syncChat(progress) {
  if (!chatLog) return;

  let nextIndex = -1;
  for (let i = 0; i < chatBeats.length; i += 1) {
    if (progress >= chatBeats[i].progress) nextIndex = i;
  }

  if (nextIndex === lastChatIndex) return;
  lastChatIndex = nextIndex;
  renderChat(nextIndex);
}

function renderChat(activeIndex) {
  if (!chatLog) return;

  chatLog.innerHTML = '';
  const visible = chatBeats.slice(0, activeIndex + 1);
  visible.forEach((beat) => {
    const bubble = document.createElement('p');
    bubble.className = 'chat-bubble';
    bubble.textContent = beat.text;
    chatLog.appendChild(bubble);
  });
}

function initGsapScroll() {
  if (!window.gsap || !window.ScrollTrigger || !videoDuration) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.to(video, {
    currentTime: videoDuration,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: ({ progress }) => syncChat(progress),
    },
  });

  Object.entries(layerDepthById).forEach(([id, depth]) => {
    const element = document.getElementById(id);
    if (!element) return;

    gsap.to(element, {
      yPercent: -depth * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });
  });

  ScrollTrigger.refresh();
}

video.addEventListener('loadedmetadata', () => {
  videoDuration = Math.max(0, (video.duration || 0) - 0.05);
  video.pause();
  video.currentTime = 0;
  initGsapScroll();
});

renderChat(-1);
