/**
 * Projection math: pure functions for 3D vectors, orthogonal projection, and
 * parameterised scene primitives used by all Tier 1 projection widgets.
 *
 * No DOM, no Plotly. Exposed as window.ProjectionMath.
 */
(function () {
  "use strict";

  var M = {};

  M.add = function (a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; };
  M.sub = function (a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; };
  M.scale = function (a, s) { return [a[0] * s, a[1] * s, a[2] * s]; };
  M.dot = function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; };
  M.norm = function (a) { return Math.sqrt(M.dot(a, a)); };

  /**
   * Project y onto the plane spanned by orthonormal basis vectors u, v.
   * Precondition: ||u|| = ||v|| = 1 and u · v = 0.
   * Returns { yhat, residual, alpha, beta }.
   */
  M.projectOrthonormal = function (y, u, v) {
    var alpha = M.dot(u, y);
    var beta = M.dot(v, y);
    var yhat = M.add(M.scale(u, alpha), M.scale(v, beta));
    var residual = M.sub(y, yhat);
    return { yhat: yhat, residual: residual, alpha: alpha, beta: beta };
  };

  /**
   * Orthonormal basis for a plane that tilts from horizontal (xy-plane at tilt=0)
   * to vertical (xz-plane at tilt=π/2) by rotating around the x-axis.
   */
  M.tiltedPlaneBasis = function (tilt) {
    return {
      u: [1, 0, 0],
      v: [0, Math.cos(tilt), Math.sin(tilt)]
    };
  };

  /**
   * y-vector of fixed length, tilting from vertical (z-axis at yAngle=0) in the xz-plane.
   * Positive yAngle tilts toward +x, negative toward -x.
   */
  M.tiltedY = function (yAngle, length) {
    var L = (length == null) ? 1.5 : length;
    return [L * Math.sin(yAngle), 0, L * Math.cos(yAngle)];
  };

  window.ProjectionMath = M;
})();
