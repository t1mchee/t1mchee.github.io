// Dynamic breathing dot grid favicon
(() => {
  const SIZE = 32;
  const GRID = 4;
  const SPACING = SIZE / (GRID + 1);
  const BASE_R = 1.8;
  const BREATHE_R = 1.0;
  const SPEED = 0.0015;
  const WAVE_SCALE = 1.2;

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

  function draw(t) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const x = (c + 1) * SPACING;
        const y = (r + 1) * SPACING;

        // Wave offset based on position
        const dist = Math.sqrt((r - 1.5) * (r - 1.5) + (c - 1.5) * (c - 1.5));
        const phase = dist * WAVE_SCALE;
        const radius = BASE_R + Math.sin(t * SPEED + phase) * BREATHE_R;

        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(60, 50, 40, 0.7)';
        ctx.fill();
      }
    }

    link.href = canvas.toDataURL('image/png');
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();

