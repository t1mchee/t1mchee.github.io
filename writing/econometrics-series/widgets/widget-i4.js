/**
 * Widget I4. Multicollinearity collapse.
 *
 * Decomposition of a fixed fitted-value vector ŷ into coefficients along
 * two regressors x1 and x2:
 *
 *     ŷ = β1·x1 + β2·x2
 *
 * One slider controls the angle α between x1 and x2. The two β·x arrows
 * are drawn tip-to-tail from the origin to ŷ. As α shrinks toward zero
 * the arrows shoot off in opposite directions along nearly-parallel axes,
 * yet they always close back on the same modest ŷ.
 *
 * The readout shows the angle in degrees, β1, β2, and the variance
 * inflation factor VIF = 1/sin^2(α). Scene labels handled by the KaTeX
 * legend beneath the scene.
 */
(function () {
  "use strict";

  var ALPHA_MIN = 0.05;
  var ALPHA_MAX = Math.PI / 2;
  var ALPHA_DEFAULT = 1.15;

  var PLANE_TILT = 0.38;
  var Y_VEC = [0.90, 0.38, 0.70];
  var SCENE_RANGE = 1.5;

  function init(root, Plotly) {
    var M = window.ProjectionMath;
    var S = window.ProjectionScene;
    var P = S.primitives;
    var C = window.EconWidgets.chrome;

    var palette = {
      decomp1:  "#3b5a7a",
      decomp2:  "#7a3b5a",
      y:        "#1a1a1a",
      yhat:     "#5a7a3b",
      residual: "rgba(139, 126, 116, 0.7)"
    };

    var state = { alpha: ALPHA_DEFAULT };

    var scene = document.createElement("div");
    scene.className = "econ-widget__scene";
    root.appendChild(scene);

    var legendEl = C.legend([
      { color: palette.decomp1, math: "\\hat\\beta_1 \\mathbf{x}_1" },
      { color: palette.decomp2, math: "\\hat\\beta_2 \\mathbf{x}_2" },
      { color: palette.y,       math: "\\mathbf{y}" },
      { color: palette.yhat,    math: "\\hat{\\mathbf{y}}" }
    ]);
    root.appendChild(legendEl);

    var controls = document.createElement("div");
    controls.className = "econ-widget__controls";
    root.appendChild(controls);

    var readout = document.createElement("div");
    readout.className = "econ-widget__readout";
    root.appendChild(readout);

    var rowAngle = C.readoutRow("\\angle(\\mathbf{x}_1, \\mathbf{x}_2)");
    var rowBeta1 = C.readoutRow("\\hat\\beta_1");
    var rowBeta2 = C.readoutRow("\\hat\\beta_2");
    var rowVIF   = C.readoutRow("\\mathrm{VIF}");
    readout.appendChild(rowAngle.row);
    readout.appendChild(rowBeta1.row);
    readout.appendChild(rowBeta2.row);
    readout.appendChild(rowVIF.row);

    var captionText = root.getAttribute("data-caption");
    if (captionText) {
      var cap = document.createElement("p");
      cap.className = "econ-widget__caption";
      cap.textContent = captionText;
      root.appendChild(cap);
    }

    function compute() {
      var basis = M.tiltedPlaneBasis(PLANE_TILT);
      var u = basis.u, v = basis.v;
      var x1 = u.slice();
      var x2 = [
        u[0] * Math.cos(state.alpha) + v[0] * Math.sin(state.alpha),
        u[1] * Math.cos(state.alpha) + v[1] * Math.sin(state.alpha),
        u[2] * Math.cos(state.alpha) + v[2] * Math.sin(state.alpha)
      ];

      var y = Y_VEC.slice();
      var proj = M.projectOrthonormal(y, u, v);
      var yhat = proj.yhat;

      var sinA = Math.sin(state.alpha);
      var cosA = Math.cos(state.alpha);
      var beta2 = proj.beta / sinA;
      var beta1 = proj.alpha - beta2 * cosA;

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
      data = data.concat(P.plane(s.u, s.v, 1.25));

      if (Math.abs(s.beta1) > 1e-4) {
        data = data.concat(P.arrow([0, 0, 0], s.decomp1End, palette.decomp1, { width: 6 }));
      }
      if (Math.abs(s.beta2) > 1e-4) {
        data = data.concat(P.arrow(s.decomp1End, s.yhat, palette.decomp2, { width: 6 }));
      }

      data = data.concat(P.dot(s.yhat, palette.yhat, 7));
      data = data.concat(P.arrow([0, 0, 0], s.y, palette.y, { width: 4 }));

      if (M.norm(s.residual) > 5e-4) {
        data = data.concat(P.segment(s.yhat, s.y, palette.residual, { width: 2, dash: "dot" }));
      }
      return data;
    }

    function updateReadout(s) {
      rowAngle.valueEl.textContent = fmtDeg(s.angleDeg);
      rowBeta1.valueEl.textContent = fmtNum(s.beta1);
      rowBeta2.valueEl.textContent = fmtNum(s.beta2);
      rowVIF.valueEl.textContent   = fmtVIF(s.vif);
    }

    function layoutForI4() {
      var L = S.layout();
      L.scene.xaxis.range = [-SCENE_RANGE, SCENE_RANGE];
      L.scene.yaxis.range = [-SCENE_RANGE, SCENE_RANGE];
      L.scene.zaxis.range = [-SCENE_RANGE, SCENE_RANGE];
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

    var alphaSlider = C.mathSlider("Angle between $\\mathbf{x}_1$ and $\\mathbf{x}_2$", ALPHA_MIN, ALPHA_MAX, 0.002, state.alpha, function (v) {
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

    C.renderMath(root);
  }

  /* ---------- helpers ---------- */

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

  if (window.EconWidgets && typeof window.EconWidgets.register === "function") {
    window.EconWidgets.register("projection-i4", init);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      if (window.EconWidgets) window.EconWidgets.register("projection-i4", init);
    });
  }
})();
