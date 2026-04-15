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

  window.EconWidgets = {
    register: register,
    mountAll: mountAll
  };
})();
