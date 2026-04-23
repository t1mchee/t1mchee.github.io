/**
 * In-post ev-cv-3d embed:
 * - keep site palette close to local style (same-origin iframe)
 * - keep iframe fixed-height viewport so controls can scroll independently
 * - make controls pane scroll while chart pane stays sticky
 */
(function () {
  var iframe = document.getElementById('ev-cv-3d-embed');
  if (!iframe) return;

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

  function findGridShell(doc) {
    var aside = doc.querySelector('aside');
    if (!aside || !aside.parentElement) return null;
    var shell = aside.parentElement;
    var st = shell.getAttribute('style') || '';
    if (!/display:\s*grid/i.test(st)) return null;
    return { shell: shell, aside: aside };
  }

  function findChartPane(shell, aside) {
    for (var i = 0; i < shell.children.length; i++) {
      var child = shell.children[i];
      if (child === aside) continue;
      if (child.querySelector('.plotly, .js-plotly-plot')) return child;
    }
    return null;
  }

  function configureSplitScroll(doc) {
    var bits = findGridShell(doc);
    if (!bits) return;

    var shell = bits.shell;
    var aside = bits.aside;
    var chartPane = findChartPane(shell, aside);
    if (!chartPane) return;

    shell.style.setProperty('align-items', 'flex-start', 'important');

    aside.style.setProperty('max-height', 'calc(92vh - 16px)', 'important');
    aside.style.setProperty('overflow-y', 'auto', 'important');
    aside.style.setProperty('padding-right', '8px', 'important');
    aside.style.setProperty('overscroll-behavior', 'contain', 'important');
    aside.style.setProperty('align-self', 'flex-start', 'important');

    chartPane.style.setProperty('position', 'sticky', 'important');
    chartPane.style.setProperty('top', '8px', 'important');
    chartPane.style.setProperty('align-self', 'flex-start', 'important');
  }

  function apply(doc) {
    injectBase(doc);
    patchInline(doc);
    configureSplitScroll(doc);
  }

  function onLoad() {
    try {
      var doc = iframe.contentDocument;
      if (!doc) return;

      apply(doc);
      [80, 250, 600, 1200, 2200].forEach(function (ms) {
        setTimeout(function () {
          apply(doc);
        }, ms);
      });
    } catch (e) {
      /* same-origin expected on GitHub Pages */
    }
  }

  iframe.addEventListener('load', onLoad);
})();
