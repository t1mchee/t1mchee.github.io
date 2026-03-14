// Dynamic dot grid favicon: ripples on page load, then settles
(() => {
  const SIZE = 32;
  const GRID = 4;
  const SPACING = SIZE / (GRID + 1);
  const BASE_R = 1.8;
  const BREATHE_R = 1.2;
  const WAVE_SCALE = 1.2;
  const DURATION = 2000; // ms before fully settled

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  const start = performance.now();

  function draw(now) {
    const elapsed = now - start;
    const decay = Math.max(0, 1 - elapsed / DURATION);

    ctx.clearRect(0, 0, SIZE, SIZE);

    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const x = (c + 1) * SPACING;
        const y = (r + 1) * SPACING;

        const dist = Math.sqrt((r - 1.5) * (r - 1.5) + (c - 1.5) * (c - 1.5));
        const phase = dist * WAVE_SCALE;
        const radius = BASE_R + Math.sin(elapsed * 0.005 + phase) * BREATHE_R * decay;

        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(60, 50, 40, 0.7)';
        ctx.fill();
      }
    }

    link.href = canvas.toDataURL('image/png');

    if (decay > 0) {
      requestAnimationFrame(draw);
    }
  }

  requestAnimationFrame(draw);
})();
