/**
 * About page: no in-flow name card at first — card only exists fixed, fades in,
 * then scroll eases it into its slot (document slot + spacer drive scroll height).
 */
(function () {
  const body = document.body;
  if (!body.classList.contains('page-index')) return;

  const below = document.getElementById('home-below');
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    body.classList.add('home-intro-done');
    if (below) below.removeAttribute('aria-hidden');
    return;
  }

  const card = document.getElementById('profile-card');
  const slot = document.getElementById('home-card-slot');
  const spacer = document.getElementById('home-intro-spacer');
  const nav = document.querySelector('nav');

  if (!card || !slot || !spacer || !below) {
    body.classList.add('home-intro-done');
    below?.removeAttribute('aria-hidden');
    return;
  }

  const scrollOpts = { passive: true };

  function navBottom() {
    return nav ? Math.round(nav.getBoundingClientRect().bottom) : 0;
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function scrollRangePx() {
    const slab = window.innerHeight - navBottom();
    return Math.max(340, Math.min(760, Math.round(slab * 0.58)));
  }

  function maxScrollY() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  /** Resting slot (top-left of name card column) in document coordinates */
  let endDoc = { top: 0, left: 0, width: 0, height: 0 };
  let range = 500;

  function measure() {
    card.style.cssText = '';
    spacer.style.minHeight = '0';
    slot.style.minHeight = '0';
    void slot.offsetHeight;

    card.classList.add('intro-floating');
    card.style.position = 'fixed';
    card.style.left = '-9999px';
    card.style.top = '0';
    card.style.margin = '0';
    card.style.zIndex = '3';
    card.style.boxSizing = 'border-box';
    const cw = Math.min(window.innerWidth - 48, 660);
    card.style.width = `${cw}px`;
    card.style.maxWidth = '100%';
    void card.offsetHeight;

    const cr = card.getBoundingClientRect();
    const h = Math.max(120, Math.ceil(cr.height));
    const w = Math.max(280, Math.ceil(cr.width));

    slot.style.minHeight = `${h}px`;
    void slot.offsetHeight;

    const sr = slot.getBoundingClientRect();
    const sy = window.scrollY;
    const sx = window.scrollX;
    endDoc = {
      top: sr.top + sy,
      left: sr.left + sx,
      width: w,
      height: h,
    };
    range = scrollRangePx();
    spacer.style.minHeight = `${Math.ceil(range + window.innerHeight + 48)}px`;
    void spacer.offsetHeight;
  }

  function startCenter() {
    const y0 = navBottom();
    const avail = window.innerHeight - y0;
    let startY = y0 + avail * 0.38 - endDoc.height / 2;
    const minY = y0 + 8;
    if (startY < minY) startY = minY;
    const startX = (window.innerWidth - endDoc.width) / 2;
    return { startX, startY };
  }

  let finalized = false;
  let raf = 0;

  function clearCardMotionStyles() {
    card.style.removeProperty('left');
    card.style.removeProperty('top');
    card.style.removeProperty('width');
    card.style.removeProperty('max-width');
    card.style.removeProperty('opacity');
    card.style.removeProperty('transform');
    card.style.removeProperty('filter');
    card.style.removeProperty('position');
    card.style.removeProperty('margin');
    card.style.removeProperty('z-index');
    card.style.removeProperty('box-sizing');
  }

  function finalize() {
    if (finalized) return;
    finalized = true;
    window.removeEventListener('scroll', onScroll, scrollOpts);
    window.removeEventListener('resize', onResize);

    body.classList.add('home-intro-done');
    card.classList.remove('intro-floating');
    clearCardMotionStyles();
    spacer.style.minHeight = '0';
    slot.style.minHeight = '0';
    below.style.opacity = '';
    below.style.transform = '';
    below.removeAttribute('aria-hidden');

    window.scrollTo(0, 0);
  }

  function tick() {
    if (finalized) return;
    const sy = window.scrollY;
    const maxScroll = maxScrollY();
    if (maxScroll <= 2) {
      finalize();
      return;
    }
    const denom = Math.max(80, Math.min(range, maxScroll));
    const p = Math.min(1, Math.max(0, sy / denom));

    /* Fade / sharpen first, then glide (staged for a softer entrance). */
    const pVis = smoothstep(0, 0.2, p);
    const pPos = easeInOutCubic(Math.min(1, Math.max(0, (p - 0.06) / 0.94)));

    const { startX, startY } = startCenter();
    const endLeft = endDoc.left - window.scrollX;
    const endTop = endDoc.top - sy;

    const x = startX + (endLeft - startX) * pPos;
    const y = startY + (endTop - startY) * pPos;

    card.style.left = `${Math.round(x)}px`;
    card.style.top = `${Math.round(y)}px`;
    card.style.width = `${Math.round(endDoc.width)}px`;

    const blurPx = 5 * (1 - pVis);
    card.style.opacity = String(pVis * pVis);
    card.style.filter = blurPx > 0.15 ? `blur(${blurPx.toFixed(2)}px)` : 'none';
    card.style.transform = `translateY(${6 * (1 - pVis)}px)`;

    const reveal = smoothstep(0.28, 1, p);
    below.style.opacity = String(reveal * reveal);
    below.style.transform = `translateY(${14 * (1 - reveal)}px)`;

    if (p >= 1) finalize();
  }

  function onScroll() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function onResize() {
    if (finalized) return;
    cancelAnimationFrame(raf);
    window.scrollTo(0, 0);
    measure();
    const sc = startCenter();
    card.style.left = `${Math.round(sc.startX)}px`;
    card.style.top = `${Math.round(sc.startY)}px`;
    card.style.width = `${Math.round(endDoc.width)}px`;
    card.style.opacity = '0';
    card.style.filter = 'blur(5px)';
    card.style.transform = 'translateY(6px)';
    tick();
  }

  measure();
  const sc = startCenter();
  card.style.left = `${Math.round(sc.startX)}px`;
  card.style.top = `${Math.round(sc.startY)}px`;
  card.style.width = `${Math.round(endDoc.width)}px`;
  card.style.opacity = '0';
  card.style.filter = 'blur(5px)';
  card.style.transform = 'translateY(6px)';

  window.addEventListener('scroll', onScroll, scrollOpts);
  window.addEventListener('resize', onResize);

  requestAnimationFrame(tick);
})();
