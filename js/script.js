'use strict';

const header = document.querySelector('.fixed-header');
const hero = document.querySelector('#hero');

const observer = new IntersectionObserver(
  ([entry]) => {
    // ヒーローがまだ画面に見えている(=ヘッダーがヒーロー上にいる)間 true
    header.classList.toggle('is-over-hero', entry.isIntersecting);
  },
  {
    // ヘッダーの高さ分だけ判定ラインを上にずらす
    rootMargin: '-80px 0px 0px 0px', // 80pxはヘッダーの高さに合わせて調整
    threshold: 0,
  }
);

observer.observe(hero);



(function () {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;

  const mobileNavLinks = mobileNav.querySelectorAll('a');

  function openNav() {
      document.body.classList.add('nav-open');
      mobileNav.classList.add('is-open');
      hamburger.classList.add('is-active');
      hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
      document.body.classList.remove('nav-open');
      mobileNav.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
      mobileNav.classList.contains('is-open') ? closeNav() : openNav();
  });

  mobileNavLinks.forEach((link) => {
      link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
  });

  window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 1101px)').matches) {
          closeNav();
      }
  });
})();








(function () {
  const stage = document.getElementById('scrollStage');
  const bg = document.getElementById('expandImg');
  const overlay = document.getElementById('stageOverlay');
  const title = document.getElementById('stageTitle');
  const viewMore = document.getElementById('stageViewMore'); 
  const content = document.getElementById('hScrollTrack');
  const commitmentList = document.querySelector('.commitment_list');

  const IMAGE_PHASE_VH = 120;
  const PAUSE_PHASE_VH = 50;
  const END_PAUSE_VH = 120;   // ← 追加：横スクロール完了後に余韻として静止させる量

  let imagePhasePx, pausePhasePx, endPausePx, horizontalPhasePx, totalScrollPx;

  function measure() {
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    imagePhasePx = (IMAGE_PHASE_VH / 100) * vh;
    pausePhasePx = (PAUSE_PHASE_VH / 100) * vh;
    endPausePx = (END_PAUSE_VH / 100) * vh;   // ← 追加

    horizontalPhasePx = Math.max(commitmentList.getBoundingClientRect().width - vw, 0);

    // 合計に endPausePx を加算
    totalScrollPx = imagePhasePx + pausePhasePx + horizontalPhasePx + endPausePx;
    stage.style.height = (vh + totalScrollPx) + 'px';
  }

  function update() {
    const rect = stage.getBoundingClientRect();
    const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollPx);

    // フェーズ1: 画像拡大
    const imgRaw = Math.min(scrolled / imagePhasePx, 1);
    const imgEased = 1 - Math.pow(1 - imgRaw, 3);
    bg.style.width = (88 + imgEased * 12) + '%';
    bg.style.height = (70 + imgEased * 30) + 'vh';

    // フェーズ2: 静止しながらカードが上がってくる
    const pauseRaw = Math.min(Math.max((scrolled - imagePhasePx) / pausePhasePx, 0), 1);
    const pauseEased = 1 - Math.pow(1 - pauseRaw, 3);

    overlay.style.opacity = pauseRaw;
    title.style.opacity = pauseEased;
    viewMore.style.opacity = pauseEased;

    content.style.opacity = pauseEased;
    const riseAmount = 60;
    const translateY = riseAmount * (1 - pauseEased);

    // フェーズ3: 横スクロール
    const hStart = imagePhasePx + pausePhasePx;
    const hRaw = horizontalPhasePx > 0
      ? Math.min(Math.max((scrolled - hStart) / horizontalPhasePx, 0), 1)
      : 0;
    const translateX = hRaw * horizontalPhasePx;

    content.style.transform = `translateY(${translateY}px) translateX(-${translateX}px)`;

    // フェーズ4: 余韻(何もしない=現状維持のまま totalScrollPx まで固定し続ける)
    // scrolled が hStart + horizontalPhasePx を超えても、
    // hRaw は 1 にクランプされ続けるので translateX はそのまま静止する
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }

  window.addEventListener('resize', () => { measure(); update(); });
  window.addEventListener('scroll', onScroll, { passive: true });

  measure();
  update();

  window.addEventListener('load', () => { measure(); update(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); update(); });
  }
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => { measure(); update(); });
    ro.observe(commitmentList);
  }
})();



const triggers = document.querySelectorAll('.trigger');
const steps = document.querySelectorAll('.step');
const images = document.querySelectorAll('.process_image');

if (window.matchMedia('(min-width: 768px)').matches) {
    const observerProcess = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const stepNum = entry.target.dataset.step;

                    steps.forEach((step) => step.classList.remove('is-active'));
                    images.forEach((img) => img.classList.remove('is-active'));

                    const activeStep = document.querySelector(`.step[data-step="${stepNum}"]`);
                    const activeImage = document.querySelector(`.process_image[data-step="${stepNum}"]`);

                    if (activeStep) activeStep.classList.add('is-active');
                    if (activeImage) activeImage.classList.add('is-active');
                }
            });
        },
        {
            threshold: 0,
            rootMargin: '-45% 0px -45% 0px',
        }
    );

    triggers.forEach((trigger) => observerProcess.observe(trigger));
}