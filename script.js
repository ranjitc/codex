gsap.registerPlugin(ScrollTrigger);

const video = document.querySelector('.video-background');
const progressBar = document.getElementById('prog');
const overlay = document.getElementById('overlay');
const sourceUrl = video.currentSrc || video.src;
const sourceNotice = document.createElement('div');

sourceNotice.className = 'source-notice';
sourceNotice.hidden = true;
sourceNotice.textContent = 'Video source failed to load. Confirm dubai-marina-scrub.mp4 is committed to the published branch (not Git LFS-only) or keep the fallback CDN source.';
document.body.appendChild(sourceNotice);

video.addEventListener('error', () => {
  sourceNotice.hidden = false;
});

video.addEventListener('loadeddata', () => {
  sourceNotice.hidden = true;
});

function once(el, event, fn) {
  const wrap = (e) => {
    el.removeEventListener(event, wrap);
    fn.call(el, e);
  };
  el.addEventListener(event, wrap, { passive: true });
}

once(document.documentElement, 'touchstart', () => {
  video.play().then(() => video.pause()).catch(() => {});
});

const timeline = gsap.timeline({
  defaults: { duration: 1 },
  scrollTrigger: {
    trigger: '#container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      progressBar.style.width = `${self.progress * 100}%`;
      overlay.style.background = `rgba(6,8,16,${0.32 + self.progress * 0.3})`;
    },
  },
});

once(video, 'loadedmetadata', () => {
  timeline.fromTo(
    video,
    { currentTime: 0 },
    { currentTime: video.duration || 1 },
  );
});

setTimeout(() => {
  if (!window.fetch) return;
  if (!sourceUrl) return;

  const parsed = new URL(sourceUrl, window.location.href);
  const isSameOrigin = parsed.origin === window.location.origin;
  if (!isSameOrigin) return;

  fetch(parsed.href)
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const current = video.currentTime;
      once(document.documentElement, 'touchstart', () => {
        video.play().then(() => video.pause()).catch(() => {});
      });
      video.src = blobUrl;
      video.currentTime = current + 0.001;
    })
    .catch(() => {
      console.info('Blob fetch failed, using direct src. Host video on same origin or CORS-enabled CDN for best reverse scrub.');
    });
}, 1000);

document.querySelectorAll('.reveal').forEach((el) => {
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
    setTimeout(() => el.classList.add('in'), siblings.indexOf(el) * 140);
  }, { threshold: 0.1 }).observe(el);
});
