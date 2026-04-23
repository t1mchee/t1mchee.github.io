/**
 * In-post ev-cv-3d embed:
 * - keep site palette close to local style (same-origin iframe)
 * - auto-size iframe height to content so the page scroll owns navigation
 * - make controls column scroll while chart stays in place
 */
(function () {
  var iframe = document.getElementById('ev-cv-3d-embed');
  if (!iframe) return;
  var lastAppliedHeight = 0;

  function injectBase(doc) {
    if (!doc || !doc.head) return;
    if (doc.getElementById('t1mchee-embed-theme-base')) return;

    var style = doc.createElement('style');
    style.id = 't1mchee-embed-theme-base';
    style.textContent =
      'html,body{background:#F5F0E8!important;color:#1a1a1a!important;}' +
      '#root{background:transparent!important;' +
      'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;}';
    doc.head.appendChild(style);
  }

  function patchInline(doc) {
    if (!doc) return;
    var nodes = doc.querySelectorAll('div[style], button[style], label[style]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var st = el.getAttribute('style') || '';

      if (
        /background:\s*white\b/i.test(st) ||
        /background:\s*#fff\b/i.test(st) ||
        /background:\s*rgb\(255,\s*255,\s*255\)/i.test(st)
      ) {
        el.style.setProperty('background', '#EDE7DD', 'important');
      }
      if (/border:\s*1px solid #d1d5db/i.test(st) || /border:\s*1px solid #e5e7eb/i.test(st)) {
        el.style.setProperty('border-color', 'transparent', 'important');
      }
      if (/color:\s*#111827/i.test(st)) {
        el.style.setProperty('color', '#1a1a1a', 'important');
      }
      if (/color:\s*#6b7280/i.test(st)) {
        el.style.setProperty('color', '#8B7E74', 'important');
      }
      if (
        /background:\s*#1e40af/i.test(st) ||
        /background:\s*rgb\(30,\s*64,\s*175\)/i.test(st)
      ) {
        el.style.setProperty('background', '#D97706', 'important');
      }
    }

    var controls = doc.querySelectorAll(
      'button, [role="button"], input[type="radio"], input[type="checkbox"], label'
    );
    for (var j = 0; j < controls.length; j++) {
      controls[j].style.setProperty('box-shadow', 'none', 'important');
      controls[j].style.setProperty('outline', 'none', 'important');
    }
  }

  function sanitizeLatexLikeLabel(text) {
    if (!text) return text;
    var out = text;
    out = out.replace(/\$/g, '');
    out = out.replace(/\\tilde\s*\{?\s*([A-Za-z])\s*\}?/g, '$1\u0303');
    out = out.replace(/\\star/g, '*');
    out = out.replace(/\\cdot/g, '·');
    out = out.replace(/\\,/g, ' ');
    out = out.replace(/[{}]/g, '');
    out = out.replace(/\\[A-Za-z]+/g, '');
    out = out.replace(/\s{2,}/g, ' ').trim();
    return out;
  }

  function patchPlotLabels(doc) {
    var texts = doc.querySelectorAll('.js-plotly-plot svg text, .plotly svg text');
    for (var i = 0; i < texts.length; i++) {
      var node = texts[i];
      var raw = node.textContent || '';
      if (raw.indexOf('\\') === -1 && raw.indexOf('$') === -1) continue;
      var cleaned = sanitizeLatexLikeLabel(raw);
      if (cleaned && cleaned !== raw) node.textContent = cleaned;
    }
  }

  function clonePlain(obj) {
    if (!obj) return null;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return null;
    }
  }

  function captureViewState(doc) {
    var plot = doc.querySelector('.js-plotly-plot');
    if (!plot || !plot._fullLayout) return null;
    var full = plot._fullLayout;
    var scene = full.scene || null;
    return {
      sceneCamera: scene ? clonePlain(scene.camera) : null,
      sceneXRange: scene && scene.xaxis ? clonePlain(scene.xaxis.range) : null,
      sceneYRange: scene && scene.yaxis ? clonePlain(scene.yaxis.range) : null,
      sceneZRange: scene && scene.zaxis ? clonePlain(scene.zaxis.range) : null,
      xRange: full.xaxis ? clonePlain(full.xaxis.range) : null,
      yRange: full.yaxis ? clonePlain(full.yaxis.range) : null,
    };
  }

  function getPlotlyApi(doc, plot) {
    var win = doc.defaultView || window;
    if (win.Plotly && typeof win.Plotly.relayout === 'function') return win.Plotly;
    if (plot && plot._context && plot._context.Plotly && typeof plot._context.Plotly.relayout === 'function') {
      return plot._context.Plotly;
    }
    return null;
  }

  function restoreViewState(doc, snapshot) {
    if (!snapshot) return;
    var plot = doc.querySelector('.js-plotly-plot');
    if (!plot) return;
    var PlotlyApi = getPlotlyApi(doc, plot);
    if (!PlotlyApi) return;

    var relayout = {};
    if (snapshot.sceneCamera) relayout['scene.camera'] = snapshot.sceneCamera;
    if (snapshot.sceneXRange) relayout['scene.xaxis.range'] = snapshot.sceneXRange;
    if (snapshot.sceneYRange) relayout['scene.yaxis.range'] = snapshot.sceneYRange;
    if (snapshot.sceneZRange) relayout['scene.zaxis.range'] = snapshot.sceneZRange;
    if (snapshot.xRange) relayout['xaxis.range'] = snapshot.xRange;
    if (snapshot.yRange) relayout['yaxis.range'] = snapshot.yRange;
    if (!Object.keys(relayout).length) return;

    PlotlyApi.relayout(plot, relayout).catch(function () {});
  }

  function attachShowSurfaceScaleLock(doc) {
    var labels = doc.querySelectorAll('label');
    var cb = null;
    for (var i = 0; i < labels.length; i++) {
      var t = labels[i].textContent || '';
      if (t.indexOf('Show utility surface') !== -1) {
        cb = labels[i].querySelector('input[type="checkbox"]');
        break;
      }
    }
    if (!cb || cb.dataset.t1mScaleLockAttached === '1') return;

    cb.dataset.t1mScaleLockAttached = '1';
    cb.addEventListener('change', function () {
      var snapshot = captureViewState(doc);
      setTimeout(function () {
        restoreViewState(doc, snapshot);
        patchPlotLabels(doc);
      }, 120);
    });
  }

  function measureHeight(doc) {
    var body = doc.body;
    var html = doc.documentElement;
    if (!body || !html) return 0;
    var root = doc.getElementById('root');
    var rootRect = root ? root.getBoundingClientRect() : { height: 0 };
    return Math.max(body.scrollHeight, html.scrollHeight, Math.ceil(rootRect.height));
  }

  function resizeToContent(doc) {
    var measured = measureHeight(doc);
    if (!measured) return;
    var minPx = Math.round(window.innerHeight * 0.8);
    var maxPx = Math.round(window.innerHeight * 2.2);
    var height = Math.max(minPx, Math.min(maxPx, measured));
    if (Math.abs(height - lastAppliedHeight) < 6) return;
    iframe.style.height = height + 'px';
    lastAppliedHeight = height;
  }

  function apply(doc) {
    injectBase(doc);
    patchInline(doc);
    configureSplitScroll(doc);
    resizeToContent(doc);
    patchPlotLabels(doc);
    attachShowSurfaceScaleLock(doc);
  }

  function findControlsColumn(doc) {
    var all = doc.querySelectorAll('div');
    var winner = null;
    var winnerScore = 0;
    for (var i = 0; i < all.length; i++) {
      var t = (all[i].textContent || '').toUpperCase();
      var score = 0;
      if (t.indexOf('VIEW') !== -1) score++;
      if (t.indexOf('MODE') !== -1) score++;
      if (t.indexOf('UTILITY FUNCTION') !== -1) score++;
      if (t.indexOf('PRICES / INCOME') !== -1) score++;
      if (score >= 3 && score > winnerScore) {
        winner = all[i];
        winnerScore = score;
      }
    }
    return winner;
  }

  function findLayoutRow(controlsCol) {
    var node = controlsCol;
    while (node && node.parentElement) {
      var p = node.parentElement;
      var style = p.getAttribute('style') || '';
      if (/display:\s*(flex|grid)/i.test(style) && p.children.length >= 2) return p;
      node = p;
    }
    return null;
  }

  function findControlsPane(row, controlsCol) {
    var aside = controlsCol.closest ? controlsCol.closest('aside') : null;
    if (aside && aside.parentElement === row) return aside;
    return controlsCol;
  }

  function findChartPane(row, controlsCol) {
    for (var i = 0; i < row.children.length; i++) {
      var child = row.children[i];
      if (child === controlsCol || (controlsCol.closest && child === controlsCol.closest('aside'))) {
        continue;
      }
      if (child.querySelector('.plotly, .js-plotly-plot')) return child;
    }
    return null;
  }

  function configureSplitScroll(doc) {
    var controlsCol = findControlsColumn(doc);
    if (!controlsCol) return;
    var row = findLayoutRow(controlsCol);
    if (!row) return;
    var controlsPane = findControlsPane(row, controlsCol);
    var chartPane = findChartPane(row, controlsCol);
    if (!chartPane) return;

    row.style.setProperty('align-items', 'flex-start', 'important');
    controlsPane.style.setProperty('max-height', 'calc(100vh - 24px)', 'important');
    controlsPane.style.setProperty('overflow-y', 'auto', 'important');
    controlsPane.style.setProperty('padding-right', '8px', 'important');
    controlsPane.style.setProperty('overscroll-behavior', 'contain', 'important');
    controlsPane.style.setProperty('align-self', 'flex-start', 'important');

    chartPane.style.setProperty('position', 'sticky', 'important');
    chartPane.style.setProperty('top', '12px', 'important');
    chartPane.style.setProperty('align-self', 'flex-start', 'important');
  }

  function setupResizeObserver(doc) {
    if (!('ResizeObserver' in window)) return;
    var target = doc.documentElement || doc.body;
    if (!target) return;

    var ro = new ResizeObserver(function () {
      resizeToContent(doc);
    });
    ro.observe(target);
  }

  function onLoad() {
    try {
      var doc = iframe.contentDocument;
      if (!doc) return;

      apply(doc);
      setupResizeObserver(doc);

      [80, 250, 600, 1200, 2200].forEach(function (ms) {
        setTimeout(function () {
          apply(doc);
        }, ms);
      });
    } catch (e) {
      /* same-origin expected on GitHub Pages; ignore local restrictions */
    }
  }

  iframe.addEventListener('load', onLoad);
  window.addEventListener('resize', function () {
    try {
      if (iframe.contentDocument) resizeToContent(iframe.contentDocument);
    } catch (e) {}
  });
})();
