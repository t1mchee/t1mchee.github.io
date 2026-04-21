/**
 * Ceramics: tall scroll stages with sticky viewport; --stage-focus ramps in/out over enough
 * scroll to read the scale/opacity phase, holds at 1 in the middle, then ramps out. Captions
 * track the hold. Disabled when prefers-reduced-motion.
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

  /**
   * Plateau focus: wide smooth ramps so small→full scale/opacity is visible in scroll space,
   * then a solid hold, then wide ramp down. (Narrow ramps read as “no phasing”.)
   */
  function plateauFocus(p) {
    const rise0 = 0;
    const rise1 = 0.26;
    const fall0 = 0.74;
    const fall1 = 1;
    if (p <= rise1) return smoothstep(rise0, rise1, p);
    if (p >= fall0) return 1 - smoothstep(fall0, fall1, p);
    return 1;
  }

  /** Captions: fade through rise, full during most of hold, fade through fall. */
  function captionAlpha(p) {
    const inA = smoothstep(0.08, 0.26, p);
    const outA = 1 - smoothstep(0.74, 0.92, p);
    return Math.max(0, Math.min(1, inA * outA));
  }

  let raf = 0;
  function tick() {
    for (const el of stages) {
      const p = stageProgress(el);
      const focus = plateauFocus(p);
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
