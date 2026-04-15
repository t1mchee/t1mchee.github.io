/**
 * Widget I3. ZCM tilt and bias.
 *
 * The full ZCM picture. Plane = col(X). Xβ sits in the plane (the truth). ε
 * is drawn from Xβ's tip and tilts between perpendicular (ZCM holds) and
 * tilted (ZCM fails). y = Xβ + ε. ŷ = orthogonal projection of y onto the
 * plane. which lands exactly at Xβ under ZCM, and drifts past it by the
 * shadow of ε when ZCM fails. The orange segment between Xβ and ŷ is that
 * shadow. the bias.
 *
 * Two sliders:
 *   θ. how much ε tilts away from perpendicular (magnitude of ZCM failure)
 *   φ. which regressor direction the tilt points along
 *
 * Readout: ε·x₁, ε·x₂, ‖bias‖. Under ZCM (θ=0) all three are zero. The user
 * discovers bias by watching these move off zero.
 */
(function () {
  "use strict";

  var DEFAULTS = {
    theta: 0.0,     // start at ZCM holding
    phi: 0.0        // tilt direction along x₁
  };

  var THETA_MIN = 0.0;
  var THETA_MAX = 1.20;            // ≈ 69° tilt away from perpendicular
  var PHI_MIN = -Math.PI;
  var PHI_MAX = Math.PI;

  var PLANE_TILT = 0.45;            // fixed visual tilt of col(X)
  var XBETA_LEN = 0.85;             // Xβ length (in-plane, along u)
  var EPS_LEN = 1.00;               // length of ε vector

  function init(root, Plotly) {
    var M = window.ProjectionMath;
    var S = window.ProjectionScene;
    var P = S.primitives;
    var C = S.colors;

    var palette = {
      Xbeta:    "#5a7a3b",   // truth: olive
      yhat:     "#7a5f2e",   // estimate: warm brown (distinct from Xβ)
      epsilon:  "#a85050",   // error: muted red
      y:        "#3b5a7a",   // data: slate
      bias:     "#D97706",   // bias: site accent
      residual: "rgba(139, 126, 116, 0.7)"  // residual: subdued warm grey
    };

    var state = { theta: DEFAULTS.theta, phi: DEFAULTS.phi };

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
      // Plane normal n̂ = u × v (unit, since u, v orthonormal)
      var n = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
      ];

      var Xbeta = M.scale(u, XBETA_LEN);

      // ε = ε_len · (cos θ · n̂ + sin θ · (cos φ · u + sin φ · v))
      var eps = M.add(
        M.scale(n, EPS_LEN * Math.cos(state.theta)),
        M.add(
          M.scale(u, EPS_LEN * Math.sin(state.theta) * Math.cos(state.phi)),
          M.scale(v, EPS_LEN * Math.sin(state.theta) * Math.sin(state.phi))
        )
      );

      var y = M.add(Xbeta, eps);

      // ŷ = projection of y onto plane
      var proj = M.projectOrthonormal(y, u, v);
      var yhat = proj.yhat;
      var residual = proj.residual;       // = M_X · ε, perpendicular to plane
      var bias = M.sub(yhat, Xbeta);       // = P_X · ε, in-plane

      return {
        u: u, v: v,
        Xbeta: Xbeta,
        eps: eps,
        y: y,
        yhat: yhat,
        residual: residual,
        bias: bias,
        epsDotU: M.dot(eps, u),
        epsDotV: M.dot(eps, v),
        biasNorm: M.norm(bias)
      };
    }

    function buildData(s) {
      var data = [];
      // 1. Plane
      data = data.concat(P.plane(s.u, s.v, 1.7));

      // 2. Xβ. solid olive, in plane
      data = data.concat(P.arrow([0,0,0], s.Xbeta, palette.Xbeta, { width: 5 }));

      // 3. ŷ. dashed warm brown, in plane (visually distinct from Xβ)
      data = data.concat(P.arrow([0,0,0], s.yhat, palette.yhat, { width: 5, dash: "dash" }));

      // 4. Bias segment. orange, in plane, from Xβ tip to ŷ tip
      if (s.biasNorm > 5e-4) {
        data = data.concat(P.segment(s.Xbeta, s.yhat, palette.bias, { width: 6 }));
      }

      // 5. ε. red arrow from Xβ tip to y tip
      data = data.concat(P.arrow(s.Xbeta, s.y, palette.epsilon, { width: 5 }));

      // 6. y. slate, origin to y (drawn on top of Xβ for visual clarity)
      data = data.concat(P.arrow([0,0,0], s.y, palette.y, { width: 5 }));

      // 7. Residual. dotted, from ŷ up to y (always perpendicular to plane)
      if (M.norm(s.residual) > 5e-4) {
        data = data.concat(P.segment(s.yhat, s.y, palette.residual, { width: 3, dash: "dot" }));
      }

      // 8. Dots at Xβ tip and ŷ tip (anchor the eye)
      data = data.concat(P.dot(s.Xbeta, palette.Xbeta, 4.5));
      if (s.biasNorm > 5e-4) {
        data = data.concat(P.dot(s.yhat, palette.yhat, 4.5));
      }

      // 9. Labels
      var labels = [
        { pos: labelPos(s.Xbeta, 0.20, s.u, 1),   text: "Xβ",  color: palette.Xbeta },
        { pos: S.scaleVec(s.y, 1.10),             text: "y",   color: palette.y },
        { pos: midpoint(s.Xbeta, s.y, 0.16, s.v), text: "ε",   color: palette.epsilon }
      ];
      if (s.biasNorm > 0.08) {
        labels.push({ pos: S.scaleVec(s.yhat, 1.22), text: "ŷ", color: palette.yhat });
        labels.push({ pos: midpoint(s.Xbeta, s.yhat, 0.18, s.v), text: "bias", color: palette.bias });
      }
      data = data.concat(P.labels(labels));

      return data;
    }

    function updateReadout(s) {
      readout.innerHTML =
        row("ε · x<sub>1</sub>", fmt(s.epsDotU)) +
        row("ε · x<sub>2</sub>", fmt(s.epsDotV)) +
        row("‖bias‖",            fmt(s.biasNorm));
    }

    function render() {
      var s = compute();
      Plotly.react(scene, buildData(s), S.layout(), S.plotConfig());
      updateReadout(s);
    }

    // Initial render
    var initialState = compute();
    Plotly.newPlot(scene, buildData(initialState), S.layout(), S.plotConfig());
    updateReadout(initialState);

    // Sliders
    var thetaSlider = makeSlider("Tilt (ZCM → endogeneity)", THETA_MIN, THETA_MAX, 0.005, state.theta, function (v) {
      state.theta = v;
      render();
    });
    controls.appendChild(thetaSlider.wrap);

    var phiSlider = makeSlider("Tilt direction", PHI_MIN, PHI_MAX, 0.01, state.phi, function (v) {
      state.phi = v;
      render();
    });
    controls.appendChild(phiSlider.wrap);

    var resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "econ-widget__reset";
    resetBtn.textContent = "Reset";
    resetBtn.addEventListener("click", function () {
      state.theta = DEFAULTS.theta;
      state.phi = DEFAULTS.phi;
      thetaSlider.input.value = String(state.theta);
      phiSlider.input.value = String(state.phi);
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

  /**
   * Place a label beside the TIP of a vector, offset perpendicular to the
   * vector within an auxiliary direction (usually the plane's "other" basis
   * vector) so it doesn't overlap the arrow.
   */
  function labelPos(tip, offsetAmount, aux, sign) {
    var o = [aux[0] * offsetAmount * sign, aux[1] * offsetAmount * sign, aux[2] * offsetAmount * sign];
    return [tip[0] + o[0], tip[1] + o[1], tip[2] + o[2] + 0.07];
  }

  function midpoint(a, b, offset, aux) {
    var mx = (a[0] + b[0]) / 2;
    var my = (a[1] + b[1]) / 2;
    var mz = (a[2] + b[2]) / 2;
    return [
      mx + aux[0] * offset,
      my + aux[1] * offset,
      mz + aux[2] * offset + 0.05
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
    window.EconWidgets.register("projection-i3", init);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      if (window.EconWidgets) window.EconWidgets.register("projection-i3", init);
    });
  }
})();
