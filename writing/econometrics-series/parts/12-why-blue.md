### The Economics Version

Economists learn BLUE as a punchline. Under assumptions 1–5, OLS has the smallest variance among all linear unbiased estimators. The Gauss-Markov theorem arrives as a stamp of approval: if your assumptions hold, you're using the right estimator. The intuition is usually left at OLS being efficient because it's doing the right thing under the right conditions.

### The Geometry Version

The projection $\hat{\mathbf{y}} = \mathbf{P_X} \mathbf{y}$ is the closest point in $\text{col}(\mathbf{X})$ to $\mathbf{y}$ under Euclidean distance.

**Assumptions 1–4** make the projection well-defined and unbiased. Linearity gives us a subspace. Random sampling makes the sample geometry mirror the population geometry. Exogeneity makes the true $\beta$ what we are projecting toward. Full rank keeps the subspace non-degenerate and the projection unique.

**Assumption 5** makes Euclidean distance the right metric, so no other linear unbiased estimator can do better.

### The Gauss-Markov Proof

Any linear estimator of $\beta$ has the form $\tilde\beta = \mathbf{B} \mathbf{y}$ for some $k \times n$ matrix $\mathbf{B}$. OLS is the case $\mathbf{B}_{\text{OLS}} = (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'$. Write an alternative as $\tilde\beta = \hat\beta + \mathbf{C}\mathbf{y}$ where $\mathbf{C} = \mathbf{B} - \mathbf{B}_{\text{OLS}}$.

Plug in $\mathbf{y} = \mathbf{X}\beta + \boldsymbol{\varepsilon}$ and take expectations, using $\mathbf{B}_{\text{OLS}} \mathbf{X} = \mathbf{I}$:

$$\mathbb{E}[\tilde\beta] = (\mathbf{B}_{\text{OLS}} + \mathbf{C}) \mathbf{X}\beta + (\mathbf{B}_{\text{OLS}} + \mathbf{C}) \mathbb{E}[\boldsymbol{\varepsilon}] = \beta + \mathbf{C}\mathbf{X}\beta$$

For $\tilde\beta$ to be unbiased for every possible $\beta$, we need $\mathbf{C}\mathbf{X} = \mathbf{0}$. Geometrically, every column of $\mathbf{C}'$ has to lie in $\text{col}(\mathbf{X})^\perp$: the correction $\mathbf{C}\mathbf{y}$ must live entirely in the orthogonal complement of the regressor space. Unbiasedness forces the alternative estimator to differ from OLS only in directions perpendicular to $\text{col}(\mathbf{X})$.

Now compute the variance. Both $\hat\beta$ and $\mathbf{C}\mathbf{y}$ are linear in $\boldsymbol{\varepsilon}$ with coefficient matrices $\mathbf{B}_{\text{OLS}}$ and $\mathbf{C}$, so under spherical errors:

$$\text{Var}(\tilde\beta) = \sigma^2 (\mathbf{B}_{\text{OLS}} + \mathbf{C})(\mathbf{B}_{\text{OLS}} + \mathbf{C})'$$

Expand:

$$\text{Var}(\tilde\beta) = \sigma^2 \mathbf{B}_{\text{OLS}} \mathbf{B}_{\text{OLS}}' + \sigma^2 \mathbf{B}_{\text{OLS}} \mathbf{C}' + \sigma^2 \mathbf{C} \mathbf{B}_{\text{OLS}}' + \sigma^2 \mathbf{C}\mathbf{C}'$$

The cross terms vanish: $\mathbf{B}_{\text{OLS}} \mathbf{C}' = (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}' \mathbf{C}' = (\mathbf{X}'\mathbf{X})^{-1}(\mathbf{C}\mathbf{X})' = \mathbf{0}$ using $\mathbf{C}\mathbf{X} = \mathbf{0}$. So:

$$\text{Var}(\tilde\beta) = \text{Var}(\hat\beta) + \sigma^2 \mathbf{C}\mathbf{C}'$$

$\mathbf{C}\mathbf{C}'$ is positive semidefinite. The variance of any other linear unbiased estimator equals the OLS variance plus a non-negative correction, which is the variance contributed by moving from the perpendicular foot in directions orthogonal to $\text{col}(\mathbf{X})$. That is exactly the set of directions unbiasedness allows.

The perpendicular foot of the projection is optimal in two senses at once. In $\mathbb{R}^n$, it is the closest point in $\text{col}(\mathbf{X})$ to $Y$ under Euclidean distance. In $\beta$-space ($\mathbb{R}^k$), it is the linear unbiased estimator with minimum variance. Under spherical errors these two notions of "best" coincide. Under non-spherical errors they come apart, and the Euclidean ruler has to be replaced (GLS) to recover both.

### Bridging the Two

OLS minimises the sum of squared residuals. This is one optimisation problem. It lives in $\mathbb{R}^n$, uses the Euclidean metric, and its solution is the perpendicular foot: the point in $\text{col}(\mathbf{X})$ closest to $\mathbf{y}$.

BLUE is a different optimisation problem. Among linear unbiased estimators of $\beta$ — functions of the form $\mathbf{B}\mathbf{y}$ mapping $\mathbb{R}^n$ into $\mathbb{R}^k$ — find the one with minimum variance. This lives in $\mathbb{R}^k$ and is about the dispersion of $\hat\beta$ across repeated samples, not the fit on any single one. A priori, it has no reason to connect to squared residuals.

Gauss-Markov says the two problems have the same solution under spherical errors. The perpendicular foot in $\mathbb{R}^n$ corresponds to the minimum-variance estimator in $\mathbb{R}^k$. Minimising squared residuals turns out to minimise coefficient variance, even though nothing in the squared-residual problem mentions variance.

This is worth stopping on. One problem lives in $\mathbb{R}^n$ and asks which point in $\text{col}(\mathbf{X})$ is nearest to $\mathbf{y}$. The other lives in $\mathbb{R}^k$ and asks which linear function of $\mathbf{y}$ has the tightest sampling distribution. One is about a single dataset. The other is about what happens across all possible datasets. There is no a priori reason the same estimator should win both contests. That it does, under spherical errors and only under spherical errors, is the actual content of Gauss-Markov.

The economist's "OLS is the best you can do" asserts minimum variance without naturally connecting to squared residuals. The geometer's "perpendicular projection is the closest point" gives a squared-distance answer without naturally connecting to variance. The theorem says these two optima align, and the alignment depends on the specific geometry of spherical noise.

Under non-spherical errors the alignment breaks. The perpendicular foot still minimises Euclidean squared residuals; it does so by construction. But it stops being the minimum-variance estimator. The two problems now have different answers: one optimum lives in the Euclidean geometry of $\mathbb{R}^n$, the other lives in a stretched geometry that accounts for the noise covariance. GLS restores the alignment by changing the inner product on $\mathbb{R}^n$ to match the noise ellipsoid. In the new metric, perpendicular means perpendicular in the right way, and the two optima coincide again.

"Weight reliable observations more" is the economist's instruction for that realignment. "Change the inner product so the noise ball becomes spherical" is the geometer's. Both are instructions for making the two optimisation problems line up. GLS isn't a different estimator so much as OLS in the correct geometry.

---

## Concept Dictionary

The full running dictionary, complete. Earlier rows carry over from the Expectations, GMM, and Asymptotics chapters; Gauss-Markov rows appear at the bottom.

The "First treated" column points to the chapter and section where each concept is unpacked. The "Insight flow" column flags the direction of intuition: **G→S** means the geometric picture illuminates the statistical concept; **S→G** means the statistical or economic intuition illuminates the geometry; **↔** means the two are equally informative and definitional.

Most rows are G→S by design. The series is built on the wager that econometric statements become clearer once you can see them as projections, lengths, or angles. The ↔ entries flag the foundational cases where the two languages are definitional restatements of each other and the equivalence carries the work. The S→G entries (rare, and absent from this dictionary) would mark places where economic intuition does independent work the geometry alone cannot supply; their absence is itself a statement about what this framing is for.

| Probability / Statistics | Linear Algebra / Geometry | First treated | Insight flow |
|---|---|---|---|
| Sample average $\frac{1}{n}\mathbf{u}'\mathbf{v}$ | Sample inner product in $\mathbb{R}^n$ | Ch 2, §1 | ↔ |
| $\mathbb{E}[XY]$ | Population inner product $\langle X, Y \rangle$ in $L^2(P)$ | Ch 3, §3 | ↔ |
| $\mathbb{E}[X^2]$ | Squared norm $\|X\|^2$ | Ch 3, §3 | ↔ |
| $\mathbb{E}[(Y - g(X))^2]$ | Squared distance $\|Y - g(X)\|^2$ | Ch 3, §6 | ↔ |
| $\mathbb{E}[Y \mid X]$ | Orthogonal projection onto $L^2(\sigma(X))$ | Ch 3, §6 | G→S |
| $X'\beta^*$ (linear projection) | Orthogonal projection onto $\text{span}\{1, X_1, \ldots, X_k\}$ | Ch 3, §7 | G→S |
| $\mathbb{E}[X\varepsilon] = 0$ | $\varepsilon$ orthogonal to linear span of $X$ | Ch 3, §5 | G→S |
| $\mathbb{E}[\varepsilon \mid X] = 0$ | $\varepsilon$ orthogonal to $L^2(\sigma(X))$ | Ch 3, §5 | G→S |
| Law of iterated expectations | Tower property $P_1 P_2 = P_1$ for $V_1 \subseteq V_2$ | Ch 4, §8 | G→S |
| Variance decomposition | Pythagorean theorem | Ch 3, §6 | G→S |
| $R^2$ | $\cos^2\theta$ between $\mathbf{y}$ and $\text{col}(\mathbf{X})$ | Ch 5, §11 | G→S |
| $F$-test | Ratio of squared projection lengths | Ch 5, §12 | G→S |
| Omitted variable bias | Oblique vs. orthogonal projection | Ch 4, §9 | ↔ |
| FWL theorem | Projection onto orthogonal complement | Ch 4, §10 | G→S |
| Leverage $h_{ii}$ | Distance of observation from the centroid in the regressor metric | Ch 5, §13 | G→S |
| $\text{SE}(\hat\beta_j)$ | Inverse length of $\mathbf{x}_j$ after partialling out other regressors | Ch 5, §14 | G→S |
| Overfitting | $\text{col}(\mathbf{X})$ filling too much of $\mathbb{R}^n$ | Ch 5, §15 | G→S |
| Moment condition $\mathbb{E}[g(Z, \theta_0)] = 0$ | Residual $\varepsilon(\theta_0)$ orthogonal to instruments in $L^2(P)$ | Ch 6, §1 | ↔ |
| Just identification ($\ell = k$) | Exact projection; residual perpendicular to every instrument | Ch 6, §2 | ↔ |
| Overidentification ($\ell > k$) | Approximate projection; no $\theta$ makes the residual perpendicular to all instruments simultaneously | Ch 6, §3 | G→S |
| Weighting matrix $W$ | Metric on moment space $\mathbb{R}^\ell$ | Ch 6, §5 | G→S |
| Efficient $W^* = \Sigma^{-1}$ | Mahalanobis metric; whitens moment space so noise is isotropic | Ch 6, §5 | G→S |
| 2SLS | Composition: project $\mathbf{X}$ onto $\text{col}(\boldsymbol{Z})$, then $\mathbf{y}$ onto $\text{col}(\hat{\mathbf{X}})$ | Ch 6, §6 / Ch 10 | G→S |
| $J$-statistic | Squared Mahalanobis distance of $\bar g_n(\hat\theta)$ from origin | Ch 6, §7 | G→S |
| Pseudo-true value | Point on the moment manifold closest to the origin under $W$ | Ch 6, §9 | G→S |
| Consistency | Sample inner product converges to population inner product | Ch 7, §1 | G→S |
| Asymptotic normality | Projected noise is asymptotically Gaussian (CLT) | Ch 7, §2 | G→S |
| Sandwich variance | Noise anisotropy propagated through $(\mathbb{E}[XX'])^{-1}$ | Ch 7, §2 | G→S |
| Homoskedastic variance | Isotropic noise; sandwich collapses to $\sigma^2 (\mathbb{E}[XX'])^{-1}$ | Ch 7, §2 | G→S |
| Robust SE | Direct estimate of sandwich meat | Ch 7, §3 | ↔ |
| Clustered SE | Cluster as unit of i.i.d. draw; row-dependence correction | Ch 7, §4 | ↔ |
| Delta method | Local linearisation of smooth functions of $\hat\beta_n$ | Ch 7, §5 | G→S |
| Homoskedastic errors | Spherical noise ball in $\mathbb{R}^n$ | Ch 11 | G→S |
| Heteroskedasticity | Noise ellipsoid stretched along coordinate axes | Ch 11 | ↔ |
| Autocorrelation | Noise ellipsoid rotated off coordinate axes | Ch 11 | ↔ |
| GLS whitening ($\Omega^{-1/2}$) | Rescaling $\mathbb{R}^n$ so the noise ball becomes spherical | Ch 11 | G→S |
| BLUE (Gauss-Markov) | Perpendicular foot is both closest point in $\mathbb{R}^n$ and minimum-variance estimator in $\beta$-space | Ch 12 | G→S |
| Unbiasedness constraint ($\mathbf{C}\mathbf{X} = \mathbf{0}$) | Alternative estimator must differ from OLS only in directions orthogonal to $\text{col}(\mathbf{X})$ | Ch 12 | G→S |
