# Asymptotic Theory as Projection Convergence

The Expectations chapter set up two levels of linear algebra: a population projection in $L^2(P)$ that defines $\beta^*$, and a sample projection in $\mathbb{R}^n$ that estimates it. Asymptotic theory is the story of how the second converges to the first.

## 1. Consistency: Sample Projection Converges to Population Projection

The OLS estimator:

$$\hat\beta_n = \left(\frac{\mathbf{X}'\mathbf{X}}{n}\right)^{-1} \frac{\mathbf{X}'\mathbf{y}}{n}$$

is built from two sample inner products. Under i.i.d. sampling with finite second moments, the LLN says each converges:

$$\frac{\mathbf{X}'\mathbf{X}}{n} \xrightarrow{p} \mathbb{E}[XX'] \qquad \frac{\mathbf{X}'\mathbf{y}}{n} \xrightarrow{p} \mathbb{E}[XY]$$

By the continuous mapping theorem:

$$\hat\beta_n \xrightarrow{p} (\mathbb{E}[XX'])^{-1} \mathbb{E}[XY] = \beta^*$$

Geometrically, the sample inner product is a noisy estimate of the population inner product. As $n$ grows, the sample inner product converges to the population inner product. The projection built from it converges to the population projection. The sample geometry in $\mathbb{R}^n$ stabilises into the population geometry in $L^2(P)$.

> **Intuition**: The finite-sample projection is wobbly because the sample inner product is noisy. Add more observations and the average stabilises. In the limit you recover the population projection exactly, the one you could compute if you knew $\mathbb{E}[XY]$ and $\mathbb{E}[XX']$ without having to estimate them.

Consistency requires two things. The moment condition $\mathbb{E}[X\varepsilon] = 0$ (so $\beta^*$ is identified and equals the true $\beta$ under linearity). And $\mathbb{E}[XX']$ invertible (so the population projection itself is uniquely defined). Both are the population versions of sample conditions from §2.1.3: exogeneity and no perfect multicollinearity.

---

## 2. Asymptotic Normality: Projected Noise is Gaussian

The estimation error decomposes:

$$\hat\beta_n - \beta^* = \left(\frac{\mathbf{X}'\mathbf{X}}{n}\right)^{-1} \frac{\mathbf{X}'\boldsymbol{\varepsilon}}{n}$$

Scale by $\sqrt{n}$:

$$\sqrt{n}(\hat\beta_n - \beta^*) = \left(\frac{\mathbf{X}'\mathbf{X}}{n}\right)^{-1} \frac{\mathbf{X}'\boldsymbol{\varepsilon}}{\sqrt{n}}$$

The first factor converges to $(\mathbb{E}[XX'])^{-1}$ by the LLN. The second is a normalised sum of i.i.d. mean-zero terms: the CLT applies.

$$\frac{\mathbf{X}'\boldsymbol{\varepsilon}}{\sqrt{n}} \xrightarrow{d} N(0, \; \mathbb{E}[\varepsilon^2 XX'])$$

Combine, using Slutsky:

$$\sqrt{n}(\hat\beta_n - \beta^*) \xrightarrow{d} N(0, V), \qquad V = (\mathbb{E}[XX'])^{-1} \; \mathbb{E}[\varepsilon^2 XX'] \; (\mathbb{E}[XX'])^{-1}$$

This is the **sandwich variance**. Two slices of bread ($(\mathbb{E}[XX'])^{-1}$ on either side) with a slab of meat ($\mathbb{E}[\varepsilon^2 XX']$) in the middle. Each piece is doing specific work, and the easiest way to see it is to start from the simple case and watch what changes.

Under conditional homoskedasticity, $\mathbb{E}[\varepsilon^2 | X] = \sigma^2$, so $\mathbb{E}[\varepsilon^2 XX'] = \sigma^2 \mathbb{E}[XX']$. The meat reduces to $\sigma^2 \mathbb{E}[XX']$ and cancels most of one slice of bread:

$$V = \sigma^2 (\mathbb{E}[XX'])^{-1}$$

Clean. This is the population analogue of the finite-sample $\sigma^2 (\mathbf{X}'\mathbf{X})^{-1}$ from Gauss-Markov. When noise is isotropic, the regressor configuration $\mathbb{E}[XX']$ is the only thing determining variance, and the inverse shows up once.

Now break homoskedasticity. The noise ball stops being a sphere. $\mathbb{E}[\varepsilon^2 | X]$ depends on $X$, so $\mathbb{E}[\varepsilon^2 XX']$ no longer factorises into $\sigma^2 \cdot \mathbb{E}[XX']$. The meat now carries directional noise information: it encodes where in regressor space the noise is bigger. The bread doesn't cancel the meat anymore, and the variance formula carries the full anisotropy.

Each piece, geometrically. The bread $(\mathbb{E}[XX'])^{-1}$ is the inverse Gram matrix of the regressors; it rotates between coordinate directions and regressor directions. The meat $\mathbb{E}[\varepsilon^2 XX']$ carries the shape of the noise ellipsoid in regressor coordinates. The sandwich takes the shape, rotates it into the right coefficient frame, and produces the variance of $\hat\beta$.

Under sphericity, the shape is trivial and the sandwich collapses. Under anisotropy, the shape matters, and the two slices of bread rotate it into the right frame. If you assume sphericity when the noise ball is an ellipsoid, you get the wrong variance. That is exactly what non-robust standard errors do.

> **Intuition**: In finite samples the estimation error is the projected noise $(\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\boldsymbol{\varepsilon}$. Asymptotically, the sum-of-i.i.d. projected noise obeys the CLT. Gaussian distributions are closed under linear maps, so any linear function of an asymptotically Gaussian vector is asymptotically Gaussian. The sample projection inherits Gaussianity in the limit.

---

## 3. The Sandwich Explains Robust Standard Errors

The bread-and-butter of empirical work is that we don't trust homoskedasticity. Eicker-Huber-White robust standard errors estimate the sandwich directly:

$$\hat V_{\text{robust}} = \left(\frac{\mathbf{X}'\mathbf{X}}{n}\right)^{-1} \left(\frac{1}{n}\sum_i \hat\varepsilon_i^2 X_i X_i'\right) \left(\frac{\mathbf{X}'\mathbf{X}}{n}\right)^{-1}$$

Each slice of bread is the same $(\mathbf{X}'\mathbf{X}/n)^{-1}$ that would appear under homoskedasticity. The meat in the middle is a sample estimate of $\mathbb{E}[\varepsilon^2 XX']$: a weighted sum of outer products, with observations contributing in proportion to their squared residuals.

Geometrically, the meat captures how noise magnitudes vary across regressor directions. Under homoskedasticity, it reduces to $\hat\sigma^2 (\mathbf{X}'\mathbf{X}/n)$ and cancels most of one slice of bread. Under heteroskedasticity, it doesn't cancel, and the variance formula carries the full anisotropy of the noise.

Clustered standard errors replace $\sum_i \hat\varepsilon_i^2 X_i X_i'$ with a sum across clusters rather than observations: $\sum_g (\sum_{i \in g} X_i \hat\varepsilon_i)(\sum_{i \in g} X_i \hat\varepsilon_i)'$. Observations within the same cluster have their error contributions added before the outer product, acknowledging that they covary.

---

## 4. Rates Under Dependent Data

The $\sqrt{n}$ rate is specific to i.i.d. samples. When observations are dependent, the rate of convergence changes.

**Clustered data.** The effective sample size is the number of clusters, not observations. $\sqrt{n}$ overstates precision; the correct rate is $\sqrt{\text{clusters}}$. Cluster-robust standard errors recover this by treating each cluster as the unit of i.i.d. draw.

**Time series.** Serial correlation means adjacent observations carry less independent information than i.i.d. observations of the same size would. Long-run variance replaces $\mathbb{E}[\varepsilon^2]$ in the sandwich: instead of a single-term middle, the meat becomes $\sum_{j = -\infty}^{\infty} \mathbb{E}[X_t \varepsilon_t \varepsilon_{t-j} X_{t-j}']$. Newey-West estimators truncate the sum at some finite lag.

Geometrically, this is the row-dependence story from §2.1.3 playing out in asymptotics. When rows of $\mathbf{X}$ are dependent, $\mathbb{R}^n$ has lower effective dimension than $n$. The sample inner product $\mathbf{X}'\mathbf{y}/n$ still converges to $\mathbb{E}[XY]$, but slower, because each row contributes less marginal information. The rate drops. The asymptotic variance inflates to reflect the loss.

---

## 5. The Delta Method as Local Linearisation

Suppose $\hat\beta_n$ is asymptotically normal and we want the distribution of $f(\hat\beta_n)$ for some smooth $f: \mathbb{R}^k \to \mathbb{R}$. Taylor-expand around $\beta^*$:

$$f(\hat\beta_n) \approx f(\beta^*) + \nabla f(\beta^*)' (\hat\beta_n - \beta^*)$$

Scaling by $\sqrt{n}$:

$$\sqrt{n}(f(\hat\beta_n) - f(\beta^*)) \xrightarrow{d} N(0, \; \nabla f(\beta^*)' V \nabla f(\beta^*))$$

Geometrically, the delta method linearises $f$ locally around $\beta^*$. A smooth function looks linear in a small neighbourhood. As $\hat\beta_n$ concentrates around $\beta^*$, only that neighbourhood matters, so $f$ can be replaced with its first-order approximation. The Gaussian limit of $\hat\beta_n$ passes through the linear map $\nabla f(\beta^*)'$ and remains Gaussian.

> **Intuition**: A ratio of two estimates, say $\hat\beta_1 / \hat\beta_2$, is nonlinear. But in the limit $\hat\beta_n$ concentrates around $\beta^*$, so $f(\hat\beta_n)$ concentrates around $f(\beta^*)$. Zoomed in on that neighbourhood, $f$ looks linear. The variance of the ratio is approximately $(\nabla f)' V (\nabla f)$ with the gradient evaluated at the true value.

---

## 6. Reconciling the Two Levels

The whole of asymptotic theory for OLS is the statement that the sample projection in $\mathbb{R}^n$ converges, in a quantifiable way, to the population projection in $L^2(P)$.

Consistency is the convergence itself: $\hat\beta_n \to \beta^*$, because sample inner products converge to population inner products.

Asymptotic normality is the scaled fluctuation: the leftover error, multiplied by $\sqrt{n}$, has a Gaussian limit because the CLT applies to the sample analogue of $\mathbb{E}[X\varepsilon]$.

The sandwich variance is the geometric content of the limit: projected noise has variance $V$, with shape determined by $\mathbb{E}[XX']$ (the regressor configuration) and $\mathbb{E}[\varepsilon^2 XX']$ (the noise configuration along regressor directions).

The delta method is how convergence propagates through smooth functions of the estimator.

Changing the dependence structure changes the rate and the variance formula, not the picture. The sample projection is always an estimator of the population projection; what varies is how fast and how accurately.

---

## Concept Dictionary

The running dictionary, with asymptotics rows at the bottom. Earlier rows carry over from the Expectations and GMM chapters.

| Probability / Statistics | Linear Algebra / Geometry |
|---|---|
| Sample average $\frac{1}{n}\mathbf{u}'\mathbf{v}$ | Sample inner product in $\mathbb{R}^n$ |
| $\mathbb{E}[XY]$ | Population inner product $\langle X, Y \rangle$ in $L^2(P)$ |
| $\mathbb{E}[X^2]$ | Squared norm $\|X\|^2$ |
| $\mathbb{E}[(Y - g(X))^2]$ | Squared distance $\|Y - g(X)\|^2$ |
| $\mathbb{E}[Y \mid X]$ | Orthogonal projection onto $L^2(\sigma(X))$ |
| $X'\beta^*$ (linear projection) | Orthogonal projection onto $\text{span}\{1, X_1, \ldots, X_k\}$ |
| $\mathbb{E}[X\varepsilon] = 0$ | $\varepsilon$ orthogonal to linear span of $X$ |
| $\mathbb{E}[\varepsilon \mid X] = 0$ | $\varepsilon$ orthogonal to $L^2(\sigma(X))$ |
| Law of iterated expectations | Tower property $P_1 P_2 = P_1$ for $V_1 \subseteq V_2$ |
| Variance decomposition | Pythagorean theorem |
| $R^2$ | $\cos^2\theta$ between $\mathbf{y}$ and $\text{col}(\mathbf{X})$ |
| $F$-test | Ratio of squared projection lengths |
| Omitted variable bias | Oblique vs. orthogonal projection |
| FWL theorem | Projection onto orthogonal complement |
| Leverage $h_{ii}$ | Distance of observation from the centroid in the regressor metric |
| $\text{SE}(\hat\beta_j)$ | Inverse length of $\mathbf{x}_j$ after partialling out other regressors |
| Overfitting | $\text{col}(\mathbf{X})$ filling too much of $\mathbb{R}^n$ |
| Moment condition $\mathbb{E}[g(Z, \theta_0)] = 0$ | Residual $\varepsilon(\theta_0)$ orthogonal to instruments in $L^2(P)$ |
| Just identification ($\ell = k$) | Exact projection; residual perpendicular to every instrument |
| Overidentification ($\ell > k$) | Approximate projection; no $\theta$ makes the residual perpendicular to all instruments simultaneously |
| Weighting matrix $W$ | Metric on moment space $\mathbb{R}^\ell$ |
| Efficient $W^* = \Sigma^{-1}$ | Mahalanobis metric; whitens moment space so noise is isotropic |
| 2SLS | Composition: project $\mathbf{X}$ onto $\text{col}(\boldsymbol{Z})$, then $\mathbf{y}$ onto $\text{col}(\hat{\mathbf{X}})$ |
| $J$-statistic | Squared Mahalanobis distance of $\bar g_n(\hat\theta)$ from origin |
| Pseudo-true value | Point on the moment manifold closest to the origin under $W$ |
| Consistency | Sample inner product converges to population inner product |
| Asymptotic normality | Projected noise is asymptotically Gaussian (CLT) |
| Sandwich variance | Noise anisotropy propagated through $(\mathbb{E}[XX'])^{-1}$ |
| Homoskedastic variance | Isotropic noise; sandwich collapses to $\sigma^2 (\mathbb{E}[XX'])^{-1}$ |
| Robust SE | Direct estimate of sandwich meat |
| Clustered SE | Cluster as unit of i.i.d. draw; row-dependence correction |
| Delta method | Local linearisation of smooth functions of $\hat\beta_n$ |
