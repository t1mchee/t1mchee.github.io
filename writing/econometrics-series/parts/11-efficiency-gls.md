# Efficiency and GLS

## What is efficiency and how do we interpret it geometrically?

Efficiency is about how much $\hat\beta$ wobbles.

Take the bias conditions as given. OLS projects $\mathbf{y}$ onto $\text{col}(\mathbf{X})$, the projection hits $\mathbf{X}\beta$ on average, $\hat\beta$ is unbiased. That leaves the width of the sampling distribution. Each sample draws a different $\boldsymbol{\varepsilon}$, projects it onto $\text{col}(\mathbf{X})$, and perturbs $\hat\beta$. Efficiency asks how tight that distribution is, and whether any other linear unbiased estimator could do better.

From the decomposition:

$$\hat\beta = \beta + (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\boldsymbol{\varepsilon}$$

The sampling variability of $\hat\beta$ is just the projected noise. The shape of the noise, meaning the covariance structure of $\varepsilon$, determines the shape of what lands in the estimator.

### The noise ball

Think of the distribution of $\varepsilon$ in $\mathbb{R}^n$ as a cloud of possible noise vectors around the origin. Under $\text{Var}(\varepsilon|X) = \sigma^2 I$ the cloud is a sphere: equal variance in every direction, no correlations between coordinates. Under $\text{Var}(\varepsilon|X) = \sigma^2 \Omega$ with $\Omega \neq I$ the cloud becomes an ellipsoid, possibly rotated off the coordinate axes.

Projecting a sphere onto $\text{col}(\mathbf{X})$ produces a symmetric distribution in the regressor space. Every direction inside $\text{col}(\mathbf{X})$ inherits the same amount of projected noise, regardless of how the subspace is oriented. Projecting an ellipsoid produces an asymmetric one. Some directions inside $\text{col}(\mathbf{X})$ inherit more projected noise than others, depending on how $\text{col}(\mathbf{X})$ happens to cut across the ellipsoid's axes.

### The ruler matters

OLS uses Euclidean distance to decide what "closest" means. Euclidean is the right ruler for a spherical noise ball and the wrong ruler for anything else.

Under spherical errors the OLS projection is the minimum-variance estimator among linear unbiased ones. Every other linear unbiased estimator adds a component orthogonal to $\text{col}(\mathbf{X})$, which only adds variance. This is the Gauss-Markov theorem, and geometrically it is the statement that the perpendicular foot of the projection is already the tightest-variance point you can land at inside $\text{col}(\mathbf{X})$.

Under non-spherical errors OLS still projects, still lands in the right subspace, still gives unbiased $\hat\beta$. It weights observations as if they were equally informative when they aren't. Heteroskedastic data has some observations with more noise than others; OLS treats them the same. Autocorrelated data has observations that share information with their neighbours; OLS treats every observation as if it were a fresh draw. The projection survives. It wobbles more across samples than necessary.

### How GLS recovers the right geometry

GLS fixes the ruler. Premultiplying the system by $\Omega^{-1/2}$ rescales $\mathbb{R}^n$ so the errors become spherical in the transformed space. OLS on the transformed system is again projection in the correct geometry, and the resulting estimator is BLUE. In the original space, this corresponds to downweighting noisy observations and upweighting precise ones, and to decorrelating neighbours so their shared information isn't double-counted.

### Two failures, one diagnosis

Spherical errors require two independent conditions on $\Omega$. Homoskedasticity: the diagonal of $\Omega$ is constant, so no observation's error is noisier than any other's. No autocorrelation: the off-diagonal of $\Omega$ is zero, so errors at different observations are uncorrelated. Together they give $\Omega = I$.

The two can fail separately. Heteroskedasticity stretches the ellipsoid along the coordinate axes without rotating it. Autocorrelation rotates the ellipsoid so its principal axes no longer align with the coordinate axes, even when the marginal variances are equal. Each case is its own subsection.

---

## Homoskedasticity: $\text{Var}(\varepsilon_i | X) = \sigma^2$ for all $i$

Wooldridge's illustration: the variance of wages fans out with education level. Among high-school graduates, wages cluster tightly. Among PhD holders, wages range from adjunct salaries to tech executive compensation. When the spread of $\varepsilon$ changes across values of $X$, we have heteroskedasticity. OLS remains unbiased and consistent; coefficients are right on average. The standard errors go wrong and OLS loses efficiency. The practical fix is robust standard errors (White, 1980), or WLS/GLS for efficiency.

Geometrically, homoskedasticity says the noise ball around $\mathbf{X}\beta$ is a sphere. Each observation contributes equally uncertain noise. No individual $i$ contributes systematically more or less error than any other. When the assumption fails, the noise ball becomes an ellipsoid. Some directions in $\mathbb{R}^n$ carry more variance than others. OLS still projects $\mathbf{y}$ onto $\text{col}(\mathbf{X})$, and the projection is still perpendicular in the Euclidean sense, but Euclidean perpendicularity is no longer the right notion of "closest." The error distribution is anisotropic; the Euclidean inner product doesn't match the true noise geometry.

The wage-education fan lives in $\mathbb{R}^n$ as a noise ball stretched along the high-education coordinates. High-variance observations pull the ellipsoid outward in their directions. OLS treats every observation equally by projecting with the standard Euclidean inner product, so it over-counts information from the noisy high-education observations. "Downweight high-variance observations" (what a practitioner does) and "stretch the coordinates to restore sphericity, then project" (what GLS does) are the same move in different vocabulary.

---

## No Autocorrelation: $\text{Cov}(\varepsilon_i, \varepsilon_j | X) = 0$ for $i \neq j$

In time series, today's shock to GDP predicts tomorrow's: a recession this quarter makes a bad next quarter more likely. In spatial data, neighbouring regions experience correlated shocks. Like heteroskedasticity, autocorrelation leaves OLS unbiased but invalidates standard errors and costs efficiency.

Geometrically, the no-autocorrelation condition says the noise components along different coordinate axes of $\mathbb{R}^n$ are uncorrelated. The error vector $\boldsymbol{\varepsilon}$ has no preferred orientation. It doesn't systematically tilt toward any particular direction in the orthogonal complement of $\text{col}(\mathbf{X})$.

When autocorrelation is present, the noise ball is still an ellipsoid, but now a rotated one. Its principal axes don't align with the coordinate axes. The error vector has systematic directional structure, and OLS projects using the wrong geometry.

The time series picture makes this concrete. If $\varepsilon_t > 0$ makes $\varepsilon_{t+1} > 0$ likely, then $\boldsymbol{\varepsilon}$ in $\mathbb{R}^n$ tends to point in directions where adjacent coordinates share the same sign. It aligns with $(1, 1, 1, \ldots)$-like directions rather than being randomly oriented. "Adjacent residuals are correlated" and "$\boldsymbol{\varepsilon}$ has preferred directions along time-smooth axes" are the same observation. GLS pre-whitens by applying $\Omega^{-1/2}$, rotating the space so the errors become randomly oriented in the transformed frame, then projects.

---

## How GLS Fixes This

GLS premultiplies the system by $\Omega^{-1/2}$, rescaling the axes so the ellipsoid becomes a sphere.

In the transformed space, OLS is projecting a sphere onto a subspace. Every direction inside $\text{col}(\mathbf{X})$ gets the minimum possible projected noise, and the Gauss-Markov theorem applies in the new geometry.

In the original space, this corresponds to downweighting noisy observations and upweighting precise ones. The projection leans toward the reliable observations and away from the noisy ones, which is exactly what efficiency requires when the noise ball is no longer a sphere.
