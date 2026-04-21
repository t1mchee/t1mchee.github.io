/**
 * About page: centered name card on load; scroll drives move into layout + body reveal.
 * Skipped when prefers-reduced-motion: reduce.
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
  const spacer = document.getElementById('home-intro-spacer');
  const nav = document.querySelector('nav');

  if (!card || !spacer || !below) {
    body.classList.add('home-intro-done');
    below?.removeAttribute('aria-hidden');
    return;
  }

  const scrollOpts = { passive: true };

  function navBottom() {
    return nav ? Math.round(nav.getBoundingClientRect().bottom) : 0;
  }

  function easeOutCubic(t) {
    const u = 1 - t;
    return 1 - u * u * u;
  }

  function scrollRangePx() {
    const slab = window.innerHeight - navBottom();
    return Math.max(320, Math.min(720, Math.round(slab * 0.55)));
  }

  function maxScrollY() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  /** Resting slot in document coordinates */
  let endDoc = { top: 0, left: 0, width: 0, height: 0 };
  let range = 500;

  function measure() {
    card.classList.remove('intro-floating');
    card.style.left = '';
    card.style.top = '';
    card.style.width = '';
    spacer.style.minHeight = '0';
    void card.offsetHeight;

    const r = card.getBoundingClientRect();
    const sy = window.scrollY;
    const sx = window.scrollX;
    endDoc = {
      top: r.top + sy,
      left: r.left + sx,
      width: r.width,
      height: r.height,
    };
    range = scrollRangePx();
    /* Must leave enough document height that scrollY can reach ~range; otherwise p never hits 1 and the card stays fixed. */
    spacer.style.minHeight = `${Math.ceil(range + window.innerHeight + 48)}px`;
    void spacer.offsetHeight;
  }

  function startCenter() {
    const y0 = navBottom();
    const avail = window.innerHeight - y0;
    let startY = y0 + avail * 0.4 - endDoc.height / 2;
    const minY = y0 + 6;
    if (startY < minY) startY = minY;
    const startX = (window.innerWidth - endDoc.width) / 2;
    return { startX, startY };
  }

  let finalized = false;
  let raf = 0;

  function finalize() {
    if (finalized) return;
    finalized = true;
    window.removeEventListener('scroll', onScroll, scrollOpts);
    window.removeEventListener('resize', onResize);

    body.classList.add('home-intro-done');
    card.classList.remove('intro-floating');
    card.style.left = '';
    card.style.top = '';
    card.style.width = '';
    spacer.style.minHeight = '0';
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
    /* Map progress to what the page can actually scroll (may be < range). */
    const denom = Math.max(80, Math.min(range, maxScroll));
    const p = Math.min(1, Math.max(0, sy / denom));
    const ux = easeOutCubic(p);

    const { startX, startY } = startCenter();
    const endLeft = endDoc.left - window.scrollX;
    const endTop = endDoc.top - sy;

    const x = startX + (endLeft - startX) * ux;
    const y = startY + (endTop - startY) * ux;

    const w = Math.max(280, Math.round(endDoc.width));
    card.style.left = `${Math.round(x)}px`;
    card.style.top = `${Math.round(y)}px`;
    card.style.width = `${w}px`;

    const reveal = Math.max(0, Math.min(1, (p - 0.22) / 0.78));
    below.style.opacity = String(reveal);
    below.style.transform = `translateY(${12 * (1 - reveal)}px)`;

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
    card.classList.add('intro-floating');
    const { startX, startY } = startCenter();
    card.style.left = `${Math.round(startX)}px`;
    card.style.top = `${Math.round(startY)}px`;
    card.style.width = `${Math.max(280, Math.round(endDoc.width))}px`;
    tick();
  }

  measure();
  card.classList.add('intro-floating');
  const sc = startCenter();
  card.style.left = `${Math.round(sc.startX)}px`;
  card.style.top = `${Math.round(sc.startY)}px`;
  card.style.width = `${Math.max(280, Math.round(endDoc.width))}px`;

  window.addEventListener('scroll', onScroll, scrollOpts);
  window.addEventListener('resize', onResize);

  requestAnimationFrame(tick);
})();
