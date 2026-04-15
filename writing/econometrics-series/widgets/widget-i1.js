/**
 * Widget I1 — Foundational projection.
 *
 * Two sliders: plane tilt and y-vector tilt. The residual is always recomputed
 * as the orthogonal projection of y onto the plane, and a readout below shows
 * r · x₁, r · x₂, and ‖r‖ — live proof that perpendicularity holds regardless
 * of slider positions. That invariant is the whole point of the widget.
 */
(function () {
  "use strict";

  var DEFAULTS = {
    tilt: 0.45,     // plane tilt, ~26°
    yAngle: 0.55    // y from vertical, ~31°
  };

  var TILT_MIN = 0.02;
  var TILT_MAX = 1.20;          // ≈ 69°, keeps plane from going edge-on
  var Y_ANGLE_MIN = -1.25;
  var Y_ANGLE_MAX = 1.25;

  function init(root, Plotly) {
    var M = window.ProjectionMath;
    var S = window.ProjectionScene;

    var state = {
      tilt: DEFAULTS.tilt,
      yAngle: DEFAULTS.yAngle
    };

    var scene = el("div", "econ-widget__scene");
    var controls = el("div", "econ-widget__controls");
    var readout = el("div", "econ-widget__readout");

    root.appendChild(scene);
    root.appendChild(controls);
    root.appendChild(readout);

    var caption = root.getAttribute("data-caption");
    if (caption) {
      var cap = el("p", "econ-widget__caption");
      cap.textContent = caption;
      root.appendChild(cap);
    }

    function buildCfg() {
      var basis = M.tiltedPlaneBasis(state.tilt);
      var y = M.tiltedY(state.yAngle, 1.5);
      var p = M.projectOrthonormal(y, basis.u, basis.v);
      return {
        basisU: basis.u,
        basisV: basis.v,
        y: y,
        yhat: p.yhat,
        residual: p.residual,
        labels: { y: "y", yhat: "ŷ", residual: "r" }
      };
    }

    function render() {
      var cfg = buildCfg();
      Plotly.react(scene, S.build(cfg), S.layout(), S.plotConfig());
      updateReadout(cfg);
    }

    function updateReadout(cfg) {
      var rDotU = M.dot(cfg.residual, cfg.basisU);
      var rDotV = M.dot(cfg.residual, cfg.basisV);
      var rNorm = M.norm(cfg.residual);
      readout.innerHTML =
        row("r · x<sub>1</sub>", fmt(rDotU)) +
        row("r · x<sub>2</sub>", fmt(rDotV)) +
        row("‖r‖", fmt(rNorm));
    }

    // Initial plot
    var initialCfg = buildCfg();
    Plotly.newPlot(scene, S.build(initialCfg), S.layout(), S.plotConfig());
    updateReadout(initialCfg);

    // Controls
    var tiltSlider = makeSlider("Plane tilt", TILT_MIN, TILT_MAX, 0.005, state.tilt, function (v) {
      state.tilt = v;
      render();
    });
    controls.appendChild(tiltSlider.wrap);

    var yAngleSlider = makeSlider("y direction", Y_ANGLE_MIN, Y_ANGLE_MAX, 0.005, state.yAngle, function (v) {
      state.yAngle = v;
      render();
    });
    controls.appendChild(yAngleSlider.wrap);

    var resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "econ-widget__reset";
    resetBtn.textContent = "Reset";
    resetBtn.addEventListener("click", function () {
      state.tilt = DEFAULTS.tilt;
      state.yAngle = DEFAULTS.yAngle;
      tiltSlider.input.value = String(state.tilt);
      yAngleSlider.input.value = String(state.yAngle);
      render();
    });
    controls.appendChild(resetBtn);
  }

  /* ---------- helpers ---------- */

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function row(label, value) {
    return (
      '<span class="econ-widget__readout-row">' +
        '<span class="econ-widget__readout-label">' + label + '</span>' +
        '<span class="econ-widget__readout-value">' + value + '</span>' +
      '</span>'
    );
  }

  function fmt(n) {
    if (Math.abs(n) < 5e-4) return "0.000";
    return n.toFixed(3);
  }

  function makeSlider(labelText, min, max, step, value, onInput) {
    var wrap = el("label", "econ-widget__slider");
    var label = el("span", "econ-widget__slider-label");
    label.textContent = labelText;
    var input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener("input", function () {
      onInput(parseFloat(input.value));
    });
    wrap.appendChild(label);
    wrap.appendChild(input);
    return { wrap: wrap, input: input };
  }

  // Register with the loader once the scripts have all been defined.
  if (window.EconWidgets && typeof window.EconWidgets.register === "function") {
    window.EconWidgets.register("projection-i1", init);
  } else {
    // Defer registration until the loader is ready.
    document.addEventListener("DOMContentLoaded", function () {
      if (window.EconWidgets) window.EconWidgets.register("projection-i1", init);
    });
  }
})();
