(() => {
  const canvas = document.getElementById('dot-grid');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const SPACING = 32;
  const DOT_RADIUS = 1.2;
  const DOT_COLOR = 'rgba(120, 100, 80, 0.18)';
  const MOUSE_RADIUS = 140;
  const PUSH_STRENGTH = 30;
  const EASE_BACK = 0.08;

  let width;
  let height;
  let cols;
  let rows;
  let dots;
  let mouse = { x: -9999, y: -9999 };
  let animId;
  /** Bottom edge of <nav> in viewport px; dots + mouse use coords from this line down */
  let navBottomPx = 0;

  function updateNavBottom() {
    const nav = document.querySelector('nav');
    navBottomPx = nav ? Math.round(nav.getBoundingClientRect().bottom) : 0;
    document.documentElement.style.setProperty('--dot-grid-top', `${navBottomPx}px`);
  }

  function peekNavBottom() {
    const nav = document.querySelector('nav');
    return nav ? Math.round(nav.getBoundingClientRect().bottom) : 0;
  }

  function init() {
    updateNavBottom();
    width = window.innerWidth;
    height = Math.max(0, window.innerHeight - navBottomPx);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(width / SPACING) + 1;
    rows = Math.ceil(height / SPACING) + 1;

    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          homeX: c * SPACING,
          homeY: r * SPACING,
          x: c * SPACING,
          y: r * SPACING,
        });
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const dx = mouse.x - d.homeX;
      const dy = mouse.y - d.homeY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS) {
        const force = 1 - dist / MOUSE_RADIUS;
        const angle = Math.atan2(dy, dx);
        const push = force * force * PUSH_STRENGTH;
        d.x += (d.homeX - Math.cos(angle) * push - d.x) * 0.2;
        d.y += (d.homeY - Math.sin(angle) * push - d.y) * 0.2;
      } else {
        d.x += (d.homeX - d.x) * EASE_BACK;
        d.y += (d.homeY - d.y) * EASE_BACK;
      }

      ctx.beginPath();
      ctx.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = DOT_COLOR;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY - navBottomPx;
  }

  function onMouseLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  function onResize() {
    cancelAnimationFrame(animId);
    init();
    draw();
  }

  let scrollQueued = false;
  function onScrollRaf() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      const next = peekNavBottom();
      if (next === navBottomPx) return;
      cancelAnimationFrame(animId);
      init();
      draw();
    });
  }

  function restartIfNavMoved() {
    const next = peekNavBottom();
    if (next === navBottomPx) return;
    cancelAnimationFrame(animId);
    init();
    draw();
  }

  const navEl = document.querySelector('nav');
  if (navEl && typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => restartIfNavMoved());
    ro.observe(navEl);
  }

  window.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScrollRaf, { passive: true });

  window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY - navBottomPx;
  });
  window.addEventListener('touchend', onMouseLeave);

  init();
  draw();
})();
