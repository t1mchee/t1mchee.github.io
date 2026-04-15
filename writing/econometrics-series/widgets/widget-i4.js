/**
 * Widget I4. Multicollinearity collapse.
 *
 * The scene is the decomposition of a fixed fitted-value vector ŷ into
 * coefficients along two regressors x₁ and x₂:
 *
 *     ŷ = β̂₁·x₁ + β̂₂·x₂
 *
 * One slider controls the angle α between x₁ and x₂. The two β̂·x arrows
 * are drawn tip-to-tail from the origin to ŷ. As α shrinks toward zero
 * the arrows shoot off in opposite directions along nearly-parallel axes,
 * yet they always close back on the same modest ŷ. ŷ itself barely moves.
 *
 * That is the chapter's punchline made visual: fitted values stable,
 * decomposition unstable. The readout quantifies this with β̂₁, β̂₂, the
 * angle in degrees, and the variance inflation factor 1/sin²α.
 */
(function () {
  "use strict";

  var ALPHA_MIN = 0.05;              // ~3°, nearly collinear
  var ALPHA_MAX = Math.PI / 2;       // 90°, orthogonal
  var ALPHA_DEFAULT = 1.15;          // ~66°, enough asymmetry to show at open

  var PLANE_TILT = 0.38;             // matches I1/I3 aesthetic
  var Y_VEC = [0.90, 0.38, 0.70];    // fixed data vector above plane
  var SCENE_RANGE = 1.5;             // tighter camera so vectors read large

  function init(root, Plotly) {
    var M = window.ProjectionMath;
    var S = window.ProjectionScene;
    var P = S.primitives;

    var palette = {
      decomp1:  "#3b5a7a",   // β̂₁·x₁ arrow: slate (regressor 1)
      decomp2:  "#7a3b5a",   // β̂₂·x₂ arrow: muted plum (regressor 2)
      y:        "#1a1a1a",   // data: near-black
      yhat:     "#5a7a3b",   // fitted: olive
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
      var basis = M.tiltedPlaneBasis(PLANE_TILT);
      var u = basis.u, v = basis.v;

      // Two regressor directions in the plane
      var x1 = u.slice();
      var x2 = [
        u[0] * Math.cos(state.alpha) + v[0] * Math.sin(state.alpha),
        u[1] * Math.cos(state.alpha) + v[1] * Math.sin(state.alpha),
        u[2] * Math.cos(state.alpha) + v[2] * Math.sin(state.alpha)
      ];

      // y, ŷ (stays essentially fixed as α changes)
      var y = Y_VEC.slice();
      var proj = M.projectOrthonormal(y, u, v);
      var yhat = proj.yhat;

      // Decomposition: solve ŷ in (x₁, x₂) coords.
      // ŷ has (u,v) coords (proj.alpha, proj.beta); x₁ = (1,0); x₂ = (cos α, sin α).
      var sinA = Math.sin(state.alpha);
      var cosA = Math.cos(state.alpha);
      var beta2 = proj.beta / sinA;
      var beta1 = proj.alpha - beta2 * cosA;

      // Tip-to-tail: origin -> β̂₁·x₁ -> β̂₁·x₁ + β̂₂·x₂ = ŷ
      var decomp1End = M.scale(x1, beta1);

      return {
        u: u, v: v,
        x1: x1, x2: x2,
        y: y, yhat: yhat, residual: proj.residual,
        beta1: beta1, beta2: beta2,
        decomp1End: decomp1End,
        vif: 1 / (sinA * sinA),
        angleDeg: state.alpha * 180 / Math.PI
      };
    }

    function buildData(s) {
      var data = [];

      // Plane, smaller than other widgets so arrows fill the frame
      data = data.concat(P.plane(s.u, s.v, 1.25));

      // β̂₁·x₁ arrow (origin to decomp1End). Solid, saturated.
      if (Math.abs(s.beta1) > 1e-4) {
        data = data.concat(P.arrow([0, 0, 0], s.decomp1End, palette.decomp1, { width: 6 }));
      }

      // β̂₂·x₂ arrow (decomp1End to ŷ). Solid, saturated.
      if (Math.abs(s.beta2) > 1e-4) {
        data = data.concat(P.arrow(s.decomp1End, s.yhat, palette.decomp2, { width: 6 }));
      }

      // ŷ as a small marker (not an arrow, to avoid competing with the
      // decomposition arrows which already terminate there).
      data = data.concat(P.dot(s.yhat, palette.yhat, 7));

      // y, quieter than the decomposition
      data = data.concat(P.arrow([0, 0, 0], s.y, palette.y, { width: 4 }));

      // Residual, subtle
      if (M.norm(s.residual) > 5e-4) {
        data = data.concat(P.segment(s.yhat, s.y, palette.residual, { width: 2, dash: "dot" }));
      }

      // Labels. Position each beside its arrow's midpoint, nudged outward.
      var labels = [];

      // β̂₁·x₁ label at the midpoint of the first decomposition arrow
      if (Math.abs(s.beta1) > 0.05) {
        labels.push({
          pos: labelBeside([0, 0, 0], s.decomp1End, s.v, 0.13, 0.07),
          text: "β̂₁·x₁",
          color: palette.decomp1
        });
      }

      // β̂₂·x₂ label at the midpoint of the second decomposition arrow
      if (Math.abs(s.beta2) > 0.05) {
        labels.push({
          pos: labelBeside(s.decomp1End, s.yhat, s.v, -0.13, 0.07),
          text: "β̂₂·x₂",
          color: palette.decomp2
        });
      }

      // ŷ label offset outward and down a little
      labels.push({
        pos: [s.yhat[0] + 0.14, s.yhat[1] - 0.05, s.yhat[2] - 0.10],
        text: "ŷ",
        color: palette.yhat
      });

      // y label at tip
      labels.push({
        pos: [s.y[0] * 1.08, s.y[1] * 1.08, s.y[2] * 1.08 + 0.05],
        text: "y",
        color: palette.y
      });

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

    function layoutForI4() {
      var L = S.layout();
      // Tighten the axis range so vectors read larger.
      L.scene.xaxis.range = [-SCENE_RANGE, SCENE_RANGE];
      L.scene.yaxis.range = [-SCENE_RANGE, SCENE_RANGE];
      L.scene.zaxis.range = [-SCENE_RANGE, SCENE_RANGE];
      // Pull the camera in slightly.
      L.scene.camera = {
        eye: { x: 1.45, y: 1.15, z: 0.85 },
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: 0 }
      };
      return L;
    }

    function render() {
      var s = compute();
      Plotly.react(scene, buildData(s), layoutForI4(), S.plotConfig());
      updateReadout(s);
    }

    var initial = compute();
    Plotly.newPlot(scene, buildData(initial), layoutForI4(), S.plotConfig());
    updateReadout(initial);

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

  /**
   * Put a label beside the midpoint of a segment from `a` to `b`, offset
   * perpendicular to the segment within an auxiliary direction `aux`.
   */
  function labelBeside(a, b, aux, offset, zLift) {
    var mx = (a[0] + b[0]) / 2;
    var my = (a[1] + b[1]) / 2;
    var mz = (a[2] + b[2]) / 2;
    return [
      mx + aux[0] * offset,
      my + aux[1] * offset,
      mz + aux[2] * offset + (zLift || 0)
    ];
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
