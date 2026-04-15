/**
 * Widget I4 — Multicollinearity collapse.
 *
 * Two regressor columns x₁ and x₂ span col(X). A slider controls the angle
 * between them, from orthogonal (π/2) to nearly parallel (≈0.05 rad).
 *
 * Pedagogical punchline: as x₁ and x₂ become collinear, the fitted values
 * ŷ stay essentially fixed (projection onto their plane is stable), but the
 * decomposition ŷ = β̂₁x₁ + β̂₂x₂ becomes wildly unstable. The readout shows
 * β̂ values exploding and the variance inflation factor (1/sin²α) diverging,
 * while ‖ŷ‖ stays flat. The thin dashed decomposition arrows in the scene
 * visualise the instability — at low angles they shoot off in opposite
 * directions, nearly cancelling to produce the same modest ŷ.
 */
(function () {
  "use strict";

  var ALPHA_MIN = 0.05;             // ~3°  — nearly collinear
  var ALPHA_MAX = Math.PI / 2;      // 90° — orthogonal
  var ALPHA_DEFAULT = Math.PI / 2;

  var PLANE_TILT = 0.15;            // mild plane tilt matches other widgets
  var Y_VEC = [0.70, 0.30, 0.55];   // fixed data vector (above plane)

  function init(root, Plotly) {
    var M = window.ProjectionMath;
    var S = window.ProjectionScene;
    var P = S.primitives;

    var palette = {
      x1:       "#3b5a7a",   // regressor 1: slate
      x2:       "#7a3b5a",   // regressor 2: muted plum (distinct from x₁)
      y:        "#1a1a1a",   // data: black to keep visual hierarchy
      yhat:     "#5a7a3b",   // fitted values: olive
      decomp1:  "rgba(59, 90, 122, 0.55)",  // dim slate
      decomp2:  "rgba(122, 59, 90, 0.55)",  // dim plum
      residual: "rgba(139, 126, 116, 0.7)"
    };

    var state = { alpha: ALPHA_DEFAULT };

    var scene = el("div", "econ-widget__scene");
    var controls = el("div", "econ-widget__controls");
    var readout = el("div", "econ-widget__readout");

    root.appendChild(scene);
    root.appendChild(controls);
    root.appendChild(readout);

    var captionText = root.getAttribute("data-caption");
    if (captionText) {
      var cap = el("p", "econ-widget__caption");
      cap.textContent = captionText;
      root.appendChild(cap);
    }

    function compute() {
      // Plane basis (orthonormal), slight tilt
      var basis = M.tiltedPlaneBasis(PLANE_TILT);
      var u = basis.u, v = basis.v;

      // x₁ along u, x₂ at angle α from x₁ in the plane
      var x1 = u.slice();
      var x2 = [
        u[0] * Math.cos(state.alpha) + v[0] * Math.sin(state.alpha),
        u[1] * Math.cos(state.alpha) + v[1] * Math.sin(state.alpha),
        u[2] * Math.cos(state.alpha) + v[2] * Math.sin(state.alpha)
      ];

      var y = Y_VEC.slice();

      // Projection of y onto the plane using the orthonormal basis
      var proj = M.projectOrthonormal(y, u, v);
      var yhat = proj.yhat;          // stays stable — independent of α
      var yhatNorm = M.norm(yhat);
      var residualNorm = M.norm(proj.residual);

      // Solve ŷ = β̂₁ x₁ + β̂₂ x₂ in the 2D plane coordinates (u, v)
      // ŷ has coords (proj.alpha, proj.beta) in (u, v).
      // x₁ has coords (1, 0), x₂ has coords (cos α, sin α).
      //   β̂₁ + β̂₂ cos α = proj.alpha
      //   β̂₂ sin α       = proj.beta
      var sinA = Math.sin(state.alpha);
      var cosA = Math.cos(state.alpha);
      var beta2 = proj.beta / sinA;
      var beta1 = proj.alpha - beta2 * cosA;

      // Decomposition arrows: β̂₁·x₁ from origin, β̂₂·x₂ from that tip to ŷ
      var decomp1End = M.scale(x1, beta1);
      var decomp2End = yhat; // guaranteed by construction

      // VIF for two regressors: 1 / (1 − r²), r = cos α  →  1 / sin²α
      var vif = 1 / (sinA * sinA);

      // Squared-angle readout in degrees for intuition
      var angleDeg = state.alpha * 180 / Math.PI;

      return {
        u: u, v: v,
        x1: x1, x2: x2,
        y: y, yhat: yhat,
        residual: proj.residual,
        beta1: beta1, beta2: beta2,
        decomp1End: decomp1End,
        vif: vif,
        angleDeg: angleDeg,
        yhatNorm: yhatNorm,
        residualNorm: residualNorm,
        sinA: sinA
      };
    }

    function buildData(s) {
      var data = [];

      // Plane (kept subtle so the regressor arrows carry the scene)
      data = data.concat(P.plane(s.u, s.v, 1.7));

      // Decomposition arrows — drawn first so solid x arrows sit in front
      // Only draw if the arrow length is within a reasonable visual extent;
      // beyond that, let the arrow extend and clip naturally (the blow-up
      // is the point).
      data = data.concat(P.segment([0,0,0], s.decomp1End, palette.decomp1, { width: 3, dash: "dash" }));
      data = data.concat(P.segment(s.decomp1End, s.yhat, palette.decomp2, { width: 3, dash: "dash" }));

      // Regressor arrows — unit length, solid
      data = data.concat(P.arrow([0,0,0], s.x1, palette.x1, { width: 5 }));
      data = data.concat(P.arrow([0,0,0], s.x2, palette.x2, { width: 5 }));

      // Fitted values arrow ŷ (in plane, stays stable)
      data = data.concat(P.arrow([0,0,0], s.yhat, palette.yhat, { width: 5 }));

      // Data vector y
      data = data.concat(P.arrow([0,0,0], s.y, palette.y, { width: 5 }));

      // Residual — dotted from ŷ to y
      if (s.residualNorm > 5e-4) {
        data = data.concat(P.segment(s.yhat, s.y, palette.residual, { width: 3, dash: "dot" }));
      }

      // Dot at ŷ
      data = data.concat(P.dot(s.yhat, palette.yhat, 4.5));

      // Labels
      var labels = [
        { pos: labelOut(s.x1, 1.18),    text: "x₁",  color: palette.x1 },
        { pos: labelOut(s.x2, 1.18),    text: "x₂",  color: palette.x2 },
        { pos: labelOut(s.y,  1.08),    text: "y",   color: palette.y },
        { pos: labelOut(s.yhat, 1.35, 0.08), text: "ŷ", color: palette.yhat }
      ];
      data = data.concat(P.labels(labels));

      return data;
    }

    function updateReadout(s) {
      readout.innerHTML =
        row("∠(x₁, x₂)", fmtDeg(s.angleDeg)) +
        row("β̂₁",        fmtNum(s.beta1)) +
        row("β̂₂",        fmtNum(s.beta2)) +
        row("VIF",       fmtVIF(s.vif));
    }

    function render() {
      var s = compute();
      Plotly.react(scene, buildData(s), S.layout(), S.plotConfig());
      updateReadout(s);
    }

    var initial = compute();
    Plotly.newPlot(scene, buildData(initial), S.layout(), S.plotConfig());
    updateReadout(initial);

    // Slider — use cos(α) space so motion feels linear in "collinearity"?
    // Stick with α directly; it's the natural quantity the reader sees move.
    var alphaSlider = makeSlider("Angle between x₁ and x₂", ALPHA_MIN, ALPHA_MAX, 0.002, state.alpha, function (v) {
      state.alpha = v;
      render();
    });
    controls.appendChild(alphaSlider.wrap);

    var resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "econ-widget__reset";
    resetBtn.textContent = "Reset";
    resetBtn.addEventListener("click", function () {
      state.alpha = ALPHA_DEFAULT;
      alphaSlider.input.value = String(state.alpha);
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

  function fmtNum(n) {
    if (!isFinite(n)) return "∞";
    if (Math.abs(n) < 5e-4) return "0.000";
    if (Math.abs(n) >= 100) return n.toFixed(0);
    if (Math.abs(n) >= 10) return n.toFixed(1);
    return n.toFixed(3);
  }

  function fmtVIF(v) {
    if (!isFinite(v) || v > 9999) return "∞";
    if (v >= 100) return v.toFixed(0);
    if (v >= 10) return v.toFixed(1);
    return v.toFixed(2);
  }

  function fmtDeg(d) {
    return d.toFixed(1) + "°";
  }

  function labelOut(tip, scale, zLift) {
    return [tip[0] * scale, tip[1] * scale, tip[2] * scale + (zLift || 0.05)];
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

  if (window.EconWidgets && typeof window.EconWidgets.register === "function") {
    window.EconWidgets.register("projection-i4", init);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      if (window.EconWidgets) window.EconWidgets.register("projection-i4", init);
    });
  }
})();
