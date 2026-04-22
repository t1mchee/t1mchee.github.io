/**
 * Theme the same-origin ev-cv-3d iframe to match t1mchee.github.io (warm bg, text, accent).
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
      'html,body{background:#F5F0E8!important;color:#1a1a1a!important}' +
      '#root{background:transparent!important;' +
      'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif}';
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
        el.style.setProperty('border-color', '#DDD5C9', 'important');
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
  }

  function apply(doc) {
    injectBase(doc);
    patchInline(doc);
  }

  function onLoad() {
    try {
      var doc = iframe.contentDocument;
      if (!doc) return;
      apply(doc);
      [50, 200, 600, 1600, 3200].forEach(function (ms) {
        setTimeout(function () {
          apply(doc);
        }, ms);
      });
    } catch (e) {
      /* file:// or blocked */
    }
  }

  iframe.addEventListener('load', onLoad);
  try {
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      onLoad();
    }
  } catch (e) {}
})();
