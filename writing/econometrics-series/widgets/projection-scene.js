/**
 * Projection scene builder: given a config describing y, ŷ, residual, and a
 * plane basis, returns Plotly `data` and `layout` objects.
 *
 * Aesthetic: warm-cream site palette, transparent background so the page's
 * dot-grid shows through. The residual wears the orange accent because it
 * is the protagonist. the invariant of the picture is its perpendicularity.
 *
 * Exposed as window.ProjectionScene.
 */
(function () {
  "use strict";

  var COLORS = {
    y:        "#3b5a7a",               // data: deep slate
    yhat:     "#5a7a3b",               // estimate: olive
    residual: "#D97706",               // residual: site accent (orange)
    plane:    "rgba(139, 126, 116, 0.16)",
    edge:     "rgba(139, 126, 116, 0.55)",
    dot:      "rgba(26, 26, 26, 0.55)",
    text:     "#1a1a1a"
  };

  var LABEL_FONT = {
    family: 'ui-serif, Georgia, "Times New Roman", serif',
    size: 16
  };

  function scaleVec(v, s) { return [v[0] * s, v[1] * s, v[2] * s]; }

  function lineTrace(from, to, color, width, dash) {
    return {
      type: "scatter3d",
      mode: "lines",
      x: [from[0], to[0]],
      y: [from[1], to[1]],
      z: [from[2], to[2]],
      line: { color: color, width: width || 5, dash: dash || "solid" },
      hoverinfo: "skip",
      showlegend: false
    };
  }

  /**
   * Arrowhead cone at the tip of a vector. Anchored at tip, pointing along the
   * direction vector. Absolute sizing keeps arrows the same size regardless of
   * zoom.
   */
  function coneHead(at, direction, color) {
    return {
      type: "cone",
      x: [at[0]], y: [at[1]], z: [at[2]],
      u: [direction[0]], v: [direction[1]], w: [direction[2]],
      sizemode: "absolute",
      sizeref: 0.14,
      anchor: "tip",
      showscale: false,
      colorscale: [[0, color], [1, color]],
      lighting: { ambient: 0.9, diffuse: 0.1, specular: 0 },
      hoverinfo: "skip",
      showlegend: false
    };
  }

  /** Filled parallelogram patch representing col(X). */
  function planeFill(u, v, extent) {
    var e = extent || 1.6;
    var corners = [[-e, -e], [e, -e], [e, e], [-e, e]];
    var xs = [], ys = [], zs = [];
    for (var i = 0; i < 4; i++) {
      var s = corners[i][0], t = corners[i][1];
      xs.push(s * u[0] + t * v[0]);
      ys.push(s * u[1] + t * v[1]);
      zs.push(s * u[2] + t * v[2]);
    }
    return {
      type: "mesh3d",
      x: xs, y: ys, z: zs,
      i: [0, 0], j: [1, 2], k: [2, 3],
      color: COLORS.plane,
      opacity: 1,
      flatshading: true,
      lighting: { ambient: 1, diffuse: 0, specular: 0, roughness: 1 },
      hoverinfo: "skip",
      showlegend: false
    };
  }

  /** Thin border around the plane patch. */
  function planeBorder(u, v, extent) {
    var e = extent || 1.6;
    var corners = [[-e, -e], [e, -e], [e, e], [-e, e], [-e, -e]];
    var xs = [], ys = [], zs = [];
    for (var i = 0; i < 5; i++) {
      var s = corners[i][0], t = corners[i][1];
      xs.push(s * u[0] + t * v[0]);
      ys.push(s * u[1] + t * v[1]);
      zs.push(s * u[2] + t * v[2]);
    }
    return {
      type: "scatter3d",
      mode: "lines",
      x: xs, y: ys, z: zs,
      line: { color: COLORS.edge, width: 2 },
      hoverinfo: "skip",
      showlegend: false
    };
  }

  /**
   * Right-angle corner marker at the foot of the perpendicular (ŷ), to make
   * the orthogonality between residual and plane visually unmistakable.
   */
  function rightAngleMarker(yhat, residual, planeU, sizeFrac) {
    var rN = ProjectionMath.norm(residual);
    if (rN < 1e-6) return null;
    var s = (sizeFrac || 0.12);
    // Unit vector along residual (perpendicular to plane)
    var rHat = ProjectionMath.scale(residual, 1 / rN);
    // Use planeU as the in-plane direction (any unit vector in the plane works)
    var a = ProjectionMath.scale(planeU, s);
    var b = ProjectionMath.scale(rHat, s);
    var p0 = yhat;
    var p1 = ProjectionMath.add(yhat, a);
    var p2 = ProjectionMath.add(ProjectionMath.add(yhat, a), b);
    var p3 = ProjectionMath.add(yhat, b);
    return {
      type: "scatter3d",
      mode: "lines",
      x: [p1[0], p2[0], p3[0]],
      y: [p1[1], p2[1], p3[1]],
      z: [p1[2], p2[2], p3[2]],
      line: { color: COLORS.edge, width: 1.5 },
      hoverinfo: "skip",
      showlegend: false
    };
  }

  /**
   * Build the Plotly `data` array from a scene config:
   *   { basisU, basisV, y, yhat, residual, labels? }
   */
  function build(cfg) {
    var data = [];
    var origin = [0, 0, 0];

    data.push(planeFill(cfg.basisU, cfg.basisV, 1.6));
    data.push(planeBorder(cfg.basisU, cfg.basisV, 1.6));

    // Right-angle marker at the foot (subtle but definitive)
    var corner = rightAngleMarker(cfg.yhat, cfg.residual, cfg.basisU, 0.14);
    if (corner) data.push(corner);

    // ŷ arrow (draw before y so y arrow visually sits in front)
    data.push(lineTrace(origin, cfg.yhat, COLORS.yhat, 5));
    data.push(coneHead(cfg.yhat, cfg.yhat, COLORS.yhat));

    // Residual (dashed, from ŷ up to y)
    data.push(lineTrace(cfg.yhat, cfg.y, COLORS.residual, 5, "dot"));

    // y arrow (solid, origin → y, on top)
    data.push(lineTrace(origin, cfg.y, COLORS.y, 6));
    data.push(coneHead(cfg.y, cfg.y, COLORS.y));

    // Small dot at ŷ to anchor the eye
    data.push({
      type: "scatter3d",
      mode: "markers",
      x: [cfg.yhat[0]], y: [cfg.yhat[1]], z: [cfg.yhat[2]],
      marker: { size: 4.5, color: COLORS.yhat },
      hoverinfo: "skip",
      showlegend: false
    });

    // Labels
    if (cfg.labels !== false) {
      var labels = cfg.labels || {};
      var midRes = [
        (cfg.y[0] + cfg.yhat[0]) / 2,
        (cfg.y[1] + cfg.yhat[1]) / 2,
        (cfg.y[2] + cfg.yhat[2]) / 2
      ];
      var entries = [
        { pos: scaleVec(cfg.y, 1.12), text: labels.y || "y", color: COLORS.y },
        { pos: scaleVec(cfg.yhat, 1.22), text: labels.yhat || "ŷ", color: COLORS.yhat },
        { pos: [midRes[0] + 0.12, midRes[1] + 0.12, midRes[2]], text: labels.residual || "r", color: COLORS.residual }
      ];
      data.push({
        type: "scatter3d",
        mode: "text",
        x: entries.map(function (e) { return e.pos[0]; }),
        y: entries.map(function (e) { return e.pos[1]; }),
        z: entries.map(function (e) { return e.pos[2]; }),
        text: entries.map(function (e) { return e.text; }),
        textfont: {
          family: LABEL_FONT.family,
          size: LABEL_FONT.size,
          color: entries.map(function (e) { return e.color; })
        },
        hoverinfo: "skip",
        showlegend: false
      });
    }

    return data;
  }

  function axisStyle() {
    return {
      showgrid: false,
      zeroline: false,
      showline: false,
      showticklabels: false,
      showbackground: false,
      showspikes: false,
      title: "",
      range: [-1.9, 1.9]
    };
  }

  function layout() {
    return {
      autosize: true,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      scene: {
        aspectmode: "cube",
        xaxis: axisStyle(),
        yaxis: axisStyle(),
        zaxis: axisStyle(),
        camera: {
          eye: { x: 1.7, y: 1.35, z: 0.95 },
          up: { x: 0, y: 0, z: 1 },
          center: { x: 0, y: 0, z: 0 }
        },
        dragmode: "orbit"
      },
      showlegend: false,
      hovermode: false
    };
  }

  function plotConfig() {
    return {
      displayModeBar: false,
      responsive: true,
      scrollZoom: false,
      doubleClick: "reset"
    };
  }

  /**
   * Compose a Plotly data array from a list of primitive descriptors.
   *   primitives.plane(u, v, extent?)
   *   primitives.planeBorder(u, v, extent?)
   *   primitives.arrow(from, to, color, { width?, dash?, head? })
   *   primitives.segment(from, to, color, { width?, dash? })
   *   primitives.rightAngle(yhat, residual, planeU, size?)
   *   primitives.dot(at, color, size?)
   *   primitives.labels([{ pos, text, color }])
   *
   * Widgets call these directly and assemble their own data arrays, so the
   * `build()` function above is one valid composition among many.
   */
  /**
   * Primitive descriptors, each returning an ARRAY of Plotly traces so
   * callers can concat freely without null/array gymnastics.
   */
  var primitives = {
    plane: function (u, v, extent) {
      return [ planeFill(u, v, extent), planeBorder(u, v, extent) ];
    },
    arrow: function (from, to, color, opts) {
      opts = opts || {};
      var traces = [ lineTrace(from, to, color, opts.width || 5, opts.dash || "solid") ];
      if (opts.head !== false) {
        var dir = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
        var len = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]);
        if (len > 1e-6) {
          traces.push(coneHead(to, dir, color));
        }
      }
      return traces;
    },
    segment: function (from, to, color, opts) {
      opts = opts || {};
      return [ lineTrace(from, to, color, opts.width || 4, opts.dash || "solid") ];
    },
    rightAngle: function (yhat, residual, planeU, size) {
      var t = rightAngleMarker(yhat, residual, planeU, size);
      return t ? [t] : [];
    },
    dot: function (at, color, size) {
      return [{
        type: "scatter3d",
        mode: "markers",
        x: [at[0]], y: [at[1]], z: [at[2]],
        marker: { size: size || 4.5, color: color },
        hoverinfo: "skip",
        showlegend: false
      }];
    },
    labels: function (entries) {
      if (!entries.length) return [];
      return [{
        type: "scatter3d",
        mode: "text",
        x: entries.map(function (e) { return e.pos[0]; }),
        y: entries.map(function (e) { return e.pos[1]; }),
        z: entries.map(function (e) { return e.pos[2]; }),
        text: entries.map(function (e) { return e.text; }),
        textfont: {
          family: LABEL_FONT.family,
          size: LABEL_FONT.size,
          color: entries.map(function (e) { return e.color; })
        },
        hoverinfo: "skip",
        showlegend: false
      }];
    }
  };

  window.ProjectionScene = {
    build: build,
    layout: layout,
    plotConfig: plotConfig,
    colors: COLORS,
    primitives: primitives,
    scaleVec: scaleVec
  };
})();
