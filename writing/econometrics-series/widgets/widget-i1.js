/**
 * Widget I1. Foundational projection.
 *
 * Two sliders: plane tilt and y-vector tilt. The residual is always recomputed
 * as the orthogonal projection of y onto the plane. A KaTeX-rendered readout
 * beneath the scene shows r·x1, r·x2, and ‖r‖, giving live proof that the
 * residual is perpendicular to col(X) regardless of slider positions.
 */
(function () {
  "use strict";

  var DEFAULTS = {
    tilt: 0.45,     // plane tilt, ~26°
    yAngle: 0.55    // y from vertical, ~31°
  };

  var TILT_MIN = 0.02;
  var TILT_MAX = 1.20;
  var Y_ANGLE_MIN = -1.25;
  var Y_ANGLE_MAX = 1.25;

  function init(root, Plotly) {
    var M = window.ProjectionMath;
    var S = window.ProjectionScene;
    var C = window.EconWidgets.chrome;

    var palette = {
      y:        S.colors.y,
      yhat:     S.colors.yhat,
      residual: S.colors.residual
    };

    var state = { tilt: DEFAULTS.tilt, yAngle: DEFAULTS.yAngle };

    var scene = document.createElement("div");
    scene.className = "econ-widget__scene";
    root.appendChild(scene);

    // Legend sits between scene and controls
    var legendEl = C.legend([
      { color: palette.y,        math: "\\mathbf{y}" },
      { color: palette.yhat,     math: "\\hat{\\mathbf{y}}" },
      { color: palette.residual, math: "\\mathbf{r}", dashed: true }
    ]);
    root.appendChild(legendEl);

    var controls = document.createElement("div");
    controls.className = "econ-widget__controls";
    root.appendChild(controls);

    var readout = document.createElement("div");
    readout.className = "econ-widget__readout";
    root.appendChild(readout);

    // Readout rows (math labels rendered once, value cells updated per tick)
    var rowDotU = C.readoutRow("\\mathbf{r} \\cdot \\mathbf{x}_1");
    var rowDotV = C.readoutRow("\\mathbf{r} \\cdot \\mathbf{x}_2");
    var rowNorm = C.readoutRow("\\|\\mathbf{r}\\|");
    readout.appendChild(rowDotU.row);
    readout.appendChild(rowDotV.row);
    readout.appendChild(rowNorm.row);

    var captionText = root.getAttribute("data-caption");
    if (captionText) {
      var cap = document.createElement("p");
      cap.className = "econ-widget__caption";
      cap.textContent = captionText;
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
        labels: false  // no in-scene labels; legend handles naming
      };
    }

    function render() {
      var cfg = buildCfg();
      Plotly.react(scene, S.build(cfg), S.layout(), S.plotConfig());
      var rDotU = M.dot(cfg.residual, cfg.basisU);
      var rDotV = M.dot(cfg.residual, cfg.basisV);
      var rNorm = M.norm(cfg.residual);
      rowDotU.valueEl.textContent = fmt(rDotU);
      rowDotV.valueEl.textContent = fmt(rDotV);
      rowNorm.valueEl.textContent = fmt(rNorm);
    }

    // Initial Plotly render
    var initialCfg = buildCfg();
    Plotly.newPlot(scene, S.build(initialCfg), S.layout(), S.plotConfig());

    // Sliders. Labels include KaTeX math.
    var tiltSlider = C.mathSlider("Plane tilt", TILT_MIN, TILT_MAX, 0.005, state.tilt, function (v) {
      state.tilt = v;
      render();
    });
    controls.appendChild(tiltSlider.wrap);

    var yAngleSlider = C.mathSlider("$\\mathbf{y}$ direction", Y_ANGLE_MIN, Y_ANGLE_MAX, 0.005, state.yAngle, function (v) {
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

    // Populate initial readout values and render all KaTeX in one pass.
    render();
    C.renderMath(root);
  }

  function fmt(n) {
    if (Math.abs(n) < 5e-4) return "0.000";
    return n.toFixed(3);
  }

  if (window.EconWidgets && typeof window.EconWidgets.register === "function") {
    window.EconWidgets.register("projection-i1", init);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      if (window.EconWidgets) window.EconWidgets.register("projection-i1", init);
    });
  }
})();
