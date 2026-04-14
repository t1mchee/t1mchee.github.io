The Gauss-Markov assumptions are the conditions under which OLS is BLUE: the Best Linear Unbiased Estimator. Most economists can recite the checklist. In the geometric picture the checklist splits in two.

The promise has two parts. Unbiasedness: $\hat\beta$ equals $\beta$ on average. Efficiency: among linear unbiased estimators, $\hat\beta$ has the smallest variance.

**Unbiasedness is about landing in the right subspace.** The OLS projection $\mathbf{P_X} \mathbf{y}$ has to hit $\mathbf{X}\beta$ on target. Linearity gives us the right-shaped subspace to project onto. Exogeneity keeps $\boldsymbol{\varepsilon}$ perpendicular to it, so the projection doesn't pick up an error shadow. Full rank keeps the subspace from collapsing to something lower-dimensional. Random sampling makes the sample projection a faithful version of the population projection. Section 2.1 works through these.

**Efficiency is about measuring distance with the right ruler.** OLS uses Euclidean distance by construction. Euclidean is the right ruler only if the noise around $\mathbf{X}\beta$ is spherical: equal variance in every direction, no systematic orientation. Heteroskedasticity stretches the noise ball into an ellipsoid. Autocorrelation rotates it. OLS still lands in the right subspace on average in both cases, but the estimate wobbles more across samples than it needs to. Section 2.2 works through these.

Section 2.3 puts the halves back together. Right subspace plus right ruler gives BLUE.

|Assumption|Economics Intuition|Geometric Meaning|What Breaks Without It|
|---|---|---|---|
|Linearity|Right functional form (logs, polynomials, etc.)|$\mathbb{E}[Y \mid X] \in \text{col}(\mathbf{X})$|No well-defined subspace to project onto|
|Random sampling|Each observation is an independent draw from the same population|Coordinate axes of $\mathbb{R}^n$ are exchangeable; sample inner product consistently estimates population inner product|Effective dimension $< n$; standard asymptotics fail|
|Strict exogeneity|Unobservables uncorrelated with regressors (ability bias, selection)|$\varepsilon \perp \text{col}(\mathbf{X})$ conditional on $X$|Projection absorbs error; bias|
|Full rank|No regressor is redundant (experience ≠ linear fn of tenure)|$\text{col}(\mathbf{X})$ is $k$-dimensional; $X'X$ invertible|Projection undefined (degenerate subspace)|
|Homoskedasticity|Error spread doesn't vary with $X$ (wage variance doesn't fan with education)|Noise ball is a sphere, not ellipsoid|Euclidean distance is wrong metric; OLS inefficient|
|No autocorrelation|Shocks are independent across observations (no GDP persistence)|Noise ball not rotated; no preferred orientation|Euclidean distance again wrong; OLS inefficient|
