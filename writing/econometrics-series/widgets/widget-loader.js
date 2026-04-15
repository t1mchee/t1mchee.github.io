/**
 * Widget loader: discovers .econ-widget placeholders in the rendered article,
 * renders a poster (static fallback image + activate button), and lazy-loads
 * Plotly on first activation.
 *
 * Exposed as window.EconWidgets:
 *   - register(name, initFn)  -- per-widget modules register themselves
 *   - mountAll(root)          -- scan `root` for placeholders and install posters
 *
 * Widgets themselves (projection-i1, etc.) register with `register` and receive
 * a fresh DOM node + the Plotly instance when activated.
 */
(function () {
  "use strict";

  var PLOTLY_CDN = "https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.35.2/plotly.min.js";
  var plotlyPromise = null;

  function loadPlotly() {
    if (plotlyPromise) return plotlyPromise;
    plotlyPromise = new Promise(function (resolve, reject) {
      if (window.Plotly) { resolve(window.Plotly); return; }
      var s = document.createElement("script");
      s.src = PLOTLY_CDN;
      s.async = true;
      s.onload = function () { resolve(window.Plotly); };
      s.onerror = function () {
        plotlyPromise = null;
        reject(new Error("Could not load Plotly from CDN"));
      };
      document.head.appendChild(s);
    });
    return plotlyPromise;
  }

  var REGISTRY = {};

  function register(name, initFn) {
    REGISTRY[name] = initFn;
  }

  function renderPoster(el) {
    var fallback = el.getAttribute("data-fallback");
    var caption = el.getAttribute("data-caption") || "";

    el.innerHTML = "";

    var poster = document.createElement("div");
    poster.className = "econ-widget__poster";

    if (fallback) {
      var img = document.createElement("img");
      img.src = fallback;
      img.alt = caption || "Interactive diagram";
      img.loading = "lazy";
      poster.appendChild(img);
    }

    var btnWrap = document.createElement("div");
    btnWrap.className = "econ-widget__poster-actions";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "econ-widget__activate";
    btn.textContent = "Activate interactive";
    btn.addEventListener("click", function () { activate(el); });
    btnWrap.appendChild(btn);

    poster.appendChild(btnWrap);
    el.appendChild(poster);

    if (caption) {
      var cap = document.createElement("p");
      cap.className = "econ-widget__caption";
      cap.textContent = caption;
      el.appendChild(cap);
    }
  }

  function renderError(el, message) {
    var err = document.createElement("p");
    err.className = "econ-widget__error";
    err.textContent = message;
    el.appendChild(err);
  }

  function activate(el) {
    var name = el.getAttribute("data-widget");
    var init = REGISTRY[name];
    if (!init) {
      console.warn("Unknown econ-widget:", name);
      return;
    }

    var btn = el.querySelector(".econ-widget__activate");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Loading…";
    }

    loadPlotly().then(function (Plotly) {
      el.innerHTML = "";
      el.classList.add("econ-widget--active");
      try {
        init(el, Plotly);
      } catch (e) {
        console.error(e);
        renderError(el, "Widget failed to initialise.");
      }
    }).catch(function (err) {
      console.error(err);
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Activate interactive";
      }
      renderError(el, "Could not load interactive. Static image shown above.");
    });
  }

  function mountAll(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll(".econ-widget");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.getAttribute("data-mounted") === "true") continue;
      node.setAttribute("data-mounted", "true");
      renderPoster(node);
    }
  }

  /* ---------- shared chrome helpers used by every widget ---------- */

  /**
   * Render KaTeX inside the given root, using the same delimiters and
   * options as the series shell. Safe to call even if KaTeX's auto-render
   * extension has not loaded yet (no-op in that case).
   */
  function renderMath(root) {
    if (typeof renderMathInElement !== "function") return;
    try {
      renderMathInElement(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$",  right: "$",  display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false,
        strict: false
      });
    } catch (e) {
      console.warn("Widget KaTeX render failed:", e);
    }
  }

  /**
   * Build a horizontal legend element with a coloured swatch and a KaTeX
   * label per entry:
   *
   *   legend([
   *     { color: "#3b5a7a", math: "\\mathbf{y}" },
   *     { color: "#5a7a3b", math: "\\hat{\\mathbf{y}}", dashed: true },
   *     ...
   *   ])
   *
   * Returns a DOM node ready to append. The caller should run renderMath()
   * on the widget root after mounting so the KaTeX delimiters are replaced.
   */
  function legend(entries) {
    var wrap = document.createElement("div");
    wrap.className = "econ-widget__legend";
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var item = document.createElement("span");
      item.className = "econ-widget__legend-item";
      if (e.dashed) item.classList.add("econ-widget__legend-item--dashed");
      if (e.dotted) item.classList.add("econ-widget__legend-item--dotted");

      var swatch = document.createElement("span");
      swatch.className = "econ-widget__legend-swatch";
      swatch.style.setProperty("--swatch-color", e.color);
      item.appendChild(swatch);

      var label = document.createElement("span");
      label.className = "econ-widget__legend-label";
      label.textContent = "$" + e.math + "$";
      item.appendChild(label);

      wrap.appendChild(item);
    }
    return wrap;
  }

  /**
   * Build a readout table row with a math label and a value cell that gets
   * updated on each slider tick. Returns { row, valueEl } so the widget can
   * hold the value element and call `valueEl.textContent = ...` cheaply
   * without re-rendering KaTeX on every update.
   */
  function readoutRow(mathLabel) {
    var row = document.createElement("span");
    row.className = "econ-widget__readout-row";

    var labelEl = document.createElement("span");
    labelEl.className = "econ-widget__readout-label";
    labelEl.textContent = "$" + mathLabel + "$";
    row.appendChild(labelEl);

    var valueEl = document.createElement("span");
    valueEl.className = "econ-widget__readout-value";
    valueEl.textContent = "";
    row.appendChild(valueEl);

    return { row: row, valueEl: valueEl };
  }

  /**
   * Build a slider with a math-aware label. Returns { wrap, input }.
   * `labelMath` is rendered as KaTeX; pass plain strings when no math is
   * needed (surrounded with no dollar signs). To mix prose + math, embed
   * $...$ in the label string.
   */
  function mathSlider(labelHtml, min, max, step, value, onInput) {
    var wrap = document.createElement("label");
    wrap.className = "econ-widget__slider";

    var label = document.createElement("span");
    label.className = "econ-widget__slider-label";
    label.innerHTML = labelHtml;  // allows $...$ KaTeX plus plain text
    wrap.appendChild(label);

    var input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener("input", function () {
      onInput(parseFloat(input.value));
    });
    wrap.appendChild(input);

    return { wrap: wrap, input: input };
  }

  window.EconWidgets = {
    register: register,
    mountAll: mountAll,
    chrome: {
      renderMath: renderMath,
      legend: legend,
      readoutRow: readoutRow,
      mathSlider: mathSlider
    }
  };
})();
