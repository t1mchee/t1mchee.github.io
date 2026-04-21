/**
 * Ceramics: each piece is a tall scroll "stage"; image scales with focus at viewport
 * center; caption fades in/out. Disabled when prefers-reduced-motion.
 */
(function () {
  const stages = document.querySelectorAll('.ceramics-stage');
  if (!stages.length) return;

  if (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    document.body.classList.add('ceramics-static');
    return;
  }

  document.body.classList.add('ceramics-scroll-stage');

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /** 0 at start of stage scroll, 1 at end (element traverses viewport). */
  function stageProgress(el) {
    const rect = el.getBoundingClientRect();
    const y = window.scrollY;
    const topDoc = rect.top + y;
    const h = el.offsetHeight;
    const vh = window.innerHeight;
    const span = h + vh;
    if (span <= 0) return 0;
    return Math.max(0, Math.min(1, (y - topDoc + vh) / span));
  }

  function captionAlpha(p) {
    const inA = smoothstep(0.22, 0.4, p);
    const outA = 1 - smoothstep(0.6, 0.78, p);
    return Math.max(0, Math.min(1, inA * outA));
  }

  let raf = 0;
  function tick() {
    for (const el of stages) {
      const p = stageProgress(el);
      const tri = 1 - Math.abs(2 * p - 1);
      const focus = Math.pow(tri, 1.38);
      el.style.setProperty('--stage-p', p.toFixed(4));
      el.style.setProperty('--stage-focus', focus.toFixed(4));
      el.style.setProperty('--caption-a', captionAlpha(p).toFixed(4));
    }
  }

  function onScroll() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function setStageHeights() {
    const vh = window.innerHeight;
    const mult = window.innerWidth <= 600 ? 2 : 2.35;
    const h = Math.round(vh * mult);
    for (const el of stages) {
      el.style.minHeight = `${h}px`;
    }
  }

  function onResize() {
    setStageHeights();
    tick();
  }

  setStageHeights();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  tick();
})();
