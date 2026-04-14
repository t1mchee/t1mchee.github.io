# Inference and Diagnostics

## 11. $R^2$ as $\cos^2\theta$

Centre $\mathbf{y}$ so $\|\mathbf{y}\|^2$ measures total variation around the mean, and project onto $\text{col}(\mathbf{X})$ (also centred), giving $\hat{\mathbf{y}}$ and residual $\mathbf{e} = \mathbf{y} - \hat{\mathbf{y}}$. Orthogonality gives Pythagoras:

$$\|\mathbf{y}\|^2 = \|\hat{\mathbf{y}}\|^2 + \|\mathbf{e}\|^2$$

Divide through:

$$1 = \frac{\|\hat{\mathbf{y}}\|^2}{\|\mathbf{y}\|^2} + \frac{\|\mathbf{e}\|^2}{\|\mathbf{y}\|^2}$$

The first term is $R^2$: the fraction of $\mathbf{y}$'s variation that $\hat{\mathbf{y}}$ captures. The second is $1 - R^2$.

Geometrically, $R^2 = \cos^2\theta$ where $\theta$ is the angle between $\mathbf{y}$ and $\text{col}(\mathbf{X})$. When $\mathbf{y}$ lies inside the subspace, $\theta = 0$ and $R^2 = 1$. When $\mathbf{y}$ is perpendicular to the subspace, $\theta = \pi/2$ and $R^2 = 0$. The angle is the same object whether you compute it as a correlation or as an angle between vectors.

> **Intuition**: $R^2$ goes up mechanically as we add regressors because enlarging $\text{col}(\mathbf{X})$ can only shrink the angle between $\mathbf{y}$ and the subspace. A bigger subspace contains more vectors, one of them closer to $\mathbf{y}$ than anything in the smaller subspace could be. Adjusted $R^2$ exists because random regressors reduce the angle just by adding dimensions, even when they carry no information. The adjustment subtracts the mechanical shrinkage so that $\bar R^2$ rises only when the added regressors do genuine work.

This is the puzzle from the introduction resolved in one sentence of geometry. A bigger subspace is always at least as close to any given vector, so the angle can only shrink. Adding pure noise as a regressor expands $\text{col}(\mathbf{X})$ by one dimension; the projection of $\mathbf{y}$ has slightly more room and inevitably lands slightly closer. The mechanical inflation of $R^2$ has nothing to do with the noise carrying information. It is a property of projection onto a higher-dimensional subspace, full stop.

---

## 12. The $F$-test as Comparison of Projection Lengths

Testing $H_0: \beta_2 = 0$ asks whether the regressors in $\mathbf{X}_2$ add explanatory power beyond $\mathbf{X}_1$. Geometrically, compare two projections: $\mathbf{y}$ onto $\text{col}(\mathbf{X}_1)$ (restricted) and $\mathbf{y}$ onto $\text{col}([\mathbf{X}_1 \mid \mathbf{X}_2])$ (unrestricted).

Let $\hat{\mathbf{y}}_r = \mathbf{P_{X_1}} \mathbf{y}$ and $\hat{\mathbf{y}}_u = \mathbf{P_{[X_1, X_2]}} \mathbf{y}$. Pythagoras decomposes the restricted fit:

$$\|\mathbf{y} - \hat{\mathbf{y}}_r\|^2 = \|\mathbf{y} - \hat{\mathbf{y}}_u\|^2 + \|\hat{\mathbf{y}}_u - \hat{\mathbf{y}}_r\|^2$$

The left side is $SSR_r$. The first term on the right is $SSR_u$. The second term is the squared length of what $\mathbf{X}_2$ adds: the portion of $\hat{\mathbf{y}}_u$ lying outside $\text{col}(\mathbf{X}_1)$.

The $F$-statistic:

$$F = \frac{(SSR_r - SSR_u)/q}{SSR_u / (n-k)}$$

where $q = \dim(\mathbf{X}_2)$ is the number of restrictions and $n - k$ is the residual degrees of freedom. The numerator is the squared length of $\hat{\mathbf{y}}_u - \hat{\mathbf{y}}_r$ per added degree of freedom. The denominator is the remaining unexplained squared length per remaining degree of freedom. The test asks whether the new projection is meaningfully longer than the old one, scaled by how much room we gave ourselves to search.

Under $H_0$ and spherical Gaussian errors, $F \sim F_{q, n-k}$: the ratio of two independent chi-squared variables divided by their degrees of freedom. The geometry: $\hat{\mathbf{y}}_u - \hat{\mathbf{y}}_r$ lives in the $q$-dimensional subspace that $\mathbf{X}_2$ adds to $\text{col}(\mathbf{X}_1)$; $\mathbf{y} - \hat{\mathbf{y}}_u$ lives in the $(n-k)$-dimensional orthogonal complement of $\text{col}([\mathbf{X}_1 \mid \mathbf{X}_2])$. Under spherical errors, noise in the two subspaces is independent and Gaussian, and squared lengths in them are chi-squared scaled by $\sigma^2$.

The $t$-test for $H_0: \beta_j = 0$ is the case $q = 1$: we are comparing $\text{col}(\mathbf{X}_{-j})$ with $\text{col}(\mathbf{X})$, and the added direction is one-dimensional. $t^2 = F$ when there is a single restriction.

---

## 13. The Hat Matrix and Leverage

The projection matrix $\mathbf{P_X} = \mathbf{X}(\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'$ deserves its own name: the **hat matrix**, written $\mathbf{H}$, because it puts a hat on $\mathbf{y}$:

$$\hat{\mathbf{y}} = \mathbf{H} \mathbf{y}$$

Written out, each fitted value is a weighted sum of the observations:

$$\hat y_i = \sum_j h_{ij} y_j$$

The diagonal entry $h_{ii}$ is the weight observation $i$ places on its own fitted value: the **leverage** of observation $i$. High leverage means $\hat y_i$ moves nearly one-for-one with $y_i$. Low leverage means $\hat y_i$ is driven primarily by the rest of the data.

Leverage has a tight range. $h_{ii} \in [0, 1]$, and $\text{tr}(\mathbf{H}) = \text{rank}(\mathbf{X}) = k$, so the average leverage across observations is $k/n$. "High-leverage" is usually flagged at $h_{ii} > 2k/n$ or $3k/n$.

Geometrically, $h_{ii}$ measures how far observation $i$ sits from the centroid of the regressor cloud. In centred regressors:

$$h_{ii} = \frac{1}{n} + (X_i - \bar X)'\left(\sum_j (X_j - \bar X)(X_j - \bar X)'\right)^{-1}(X_i - \bar X)$$

The first term is everyone's baseline leverage from the intercept. The second is the squared Mahalanobis distance of $X_i$ from the centroid in the metric defined by the regressor spread. An observation with regressor values far from the rest of the sample has high leverage. Its position in regressor space is unusual, so the projection has to reach to accommodate it.

Leverage measures potential, not realised, influence. A high-leverage observation with a residual near zero contributes little to $\hat\beta$ beyond defining the slope; it doesn't drag the fit off course. The same high-leverage observation with a large residual is the pivot around which the whole regression swings. **Cook's distance** combines leverage with residual size to measure actual influence.

> **Intuition**: Imagine dropping a new observation into the scatterplot. If it lands near the middle of the existing regressor cloud, the fit barely changes: the new point's contribution is averaged with its neighbours. If it lands at an extreme regressor value, far from the rest of the sample, the fit pivots to accommodate it. That is leverage. Whether the new point actually bends the fit (influence) depends on whether its $y$ value is unusual relative to what the existing data predicts.

---

## 14. Standard Errors as Subspace Geometry

Under spherical errors, $\text{Var}(\hat\beta | \mathbf{X}) = \sigma^2 (\mathbf{X}'\mathbf{X})^{-1}$. The diagonal entry $[(\mathbf{X}'\mathbf{X})^{-1}]_{jj}$ is $\text{Var}(\hat\beta_j | \mathbf{X}) / \sigma^2$. FWL gives its geometric content directly.

This is where FWL pays a second dividend. Post 04 used FWL to flatten the tilted room of correlated controls so the marginal effect of $\mathbf{x}_j$ could be read off cleanly. The same flattening sets the precision of $\hat\beta_j$. From FWL, the coefficient on $\mathbf{x}_j$ (the $j$-th column of $\mathbf{X}$) from the full regression equals the coefficient from a single-regressor OLS of $\mathbf{y}$ on $\tilde{\mathbf{x}}_j = \mathbf{M}_{-j} \mathbf{x}_j$, the residual from regressing $\mathbf{x}_j$ on all the other regressors. A single-regressor OLS on the residualised setup has variance:

$$\text{Var}(\hat\beta_j | \mathbf{X}) = \frac{\sigma^2}{\tilde{\mathbf{x}}_j'\tilde{\mathbf{x}}_j} = \frac{\sigma^2}{\|\tilde{\mathbf{x}}_j\|^2}$$

The standard error of $\hat\beta_j$ is inversely proportional to the length of $\tilde{\mathbf{x}}_j$: the regressor column $\mathbf{x}_j$ after partialling out everything else.

This is the geometric content of near-multicollinearity, quantified. When $\mathbf{x}_j$ is nearly a linear combination of the other regressors, $\tilde{\mathbf{x}}_j$ is a short vector: most of $\mathbf{x}_j$ is absorbed by the partialling-out step. The standard error explodes because there is almost no independent variation left in $\mathbf{x}_j$ with which to estimate $\hat\beta_j$.

The variance inflation factor ($\text{VIF}_j$) formalises this. $\text{VIF}_j = 1 / (1 - R_j^2)$ where $R_j^2$ is the $R^2$ from regressing $\mathbf{x}_j$ on the other regressors. When $\mathbf{x}_j$ is orthogonal to the others, $R_j^2 = 0$ and $\text{VIF}_j = 1$: no inflation. When $\mathbf{x}_j$ is nearly collinear, $R_j^2 \to 1$ and $\text{VIF}_j \to \infty$.

> **Intuition**: Each coefficient's precision depends on how much new information its regressor carries beyond the others. If $\mathbf{x}_j$ is orthogonal to the rest of the design, $\|\tilde{\mathbf{x}}_j\| = \|\mathbf{x}_j\|$ and the standard error is as tight as possible. If $\mathbf{x}_j$ is highly collinear with the others, $\|\tilde{\mathbf{x}}_j\|$ is small and the standard error blows up. Standard errors are telling you how well your regressors are separating themselves geometrically.

---

## 15. When the Picture Misleads: High Dimensions and Overfitting

The projection machinery works identically regardless of the relationship between $k$ and $n$. That mechanical indifference is a warning.

When $k$ is small relative to $n$, $\text{col}(\mathbf{X})$ is a thin subspace of $\mathbb{R}^n$. $\mathbf{y}$ projects onto it and has most of its length left over as residual; $R^2$ is driven by the part of $\mathbf{y}$ that genuinely aligns with the regressors.

As $k$ grows, $\text{col}(\mathbf{X})$ fills more of $\mathbb{R}^n$. Any $\mathbf{y}$ vector has more of its length inside the subspace and less left as residual. $R^2$ rises. At $k = n$, $\text{col}(\mathbf{X}) = \mathbb{R}^n$, the projection is the identity, $\hat{\mathbf{y}} = \mathbf{y}$ exactly, and $R^2 = 1$. Residual variance is zero.

Mechanically, the projection picture still works. Statistically, it has stopped being informative. A subspace this large captures any noise pattern in $\mathbf{y}$ perfectly, whether or not the regressors carry real signal. This is overfitting, and it is a geometric phenomenon: the target subspace has grown large enough to chase noise directions alongside signal.

Put concrete numbers on it. With $k = 5$ and $n = 100$, $\text{col}(\mathbf{X})$ is a 5-dimensional slice through a 100-dimensional space. Most of the noise ball sticks out perpendicular to the slice, safely captured by the 95-dimensional residual subspace. With $k = 95$, $\text{col}(\mathbf{X})$ is 95-dimensional, filling almost all of $\mathbb{R}^{100}$. The noise ball barely sticks out. Almost all the noise energy ends up inside the fit. The projection has absorbed the noise into $\hat{\mathbf{y}}$ and called it signal.

The diagnosis is clearer in the noise-ball picture. The residual vector $\mathbf{e}$ lives in the orthogonal complement of $\text{col}(\mathbf{X})$: an $(n - k)$-dimensional subspace. This is where the noise energy ends up after projection. Under spherical errors, the expected squared length of the residual is $\mathbb{E}[\|\mathbf{e}\|^2] = \sigma^2 (n - k)$, and $\hat\sigma^2 = \|\mathbf{e}\|^2 / (n - k)$ is the sample mean squared residual averaged across those $n - k$ orthogonal directions. When $n - k$ is large, the average is well-anchored: the residual subspace is thick enough that noise in it is reliably estimated.

When $k$ approaches $n$, the residual subspace collapses. At $k = n - 1$ you are estimating $\sigma^2$ from a single orthogonal direction. At $k = n$ the residual subspace is zero-dimensional and $\hat\sigma^2$ is undefined. The projection of a spherical noise ball onto a $k$-dimensional subspace retains $k/n$ of the noise's energy on average, so when $k$ is close to $n$, almost all the noise ends up inside the fit rather than the residual. $\hat\sigma^2$ is then estimated from whatever thin slice remains, and standard errors lose their meaning because the denominator in $\sigma^2 / \|\tilde{\mathbf{x}}_j\|^2$ is computed from a handful of directions.

**Regularisation** (ridge, lasso) constrains $\hat\beta$ to lie in or near a smaller set. Geometrically, instead of projecting onto all of $\text{col}(\mathbf{X})$, these methods project onto a restricted region: a ball around the origin (ridge), a polytope (lasso). The constraint pulls $\hat\beta$ toward zero in a principled way, trading bias for lower variance. The projection framework is the same; the feasible set has been made smaller.

> **Intuition**: Think of $k$ as the number of knobs the fit gets to turn. With 5 knobs and 100 observations, the fit cannot match every wiggle in $\mathbf{y}$; the residual carries real information about the noise. With 100 knobs and 100 observations, the fit can match $\mathbf{y}$ exactly, including every random fluctuation. The projection is perfect. It is also useless: you have modelled the noise.

---

## Concept Dictionary (so far)

The series is a translation exercise. Each chapter adds rows to the following table. By the end, the left column holds the econometrics vocabulary economists already know; the right column holds the geometric object it corresponds to.

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

**The OLS apparatus is orthogonal projection in two parallel spaces: the sample space $\mathbb{R}^n$ and the population space $L^2(P)$. Regression is projection, and projection is regression.**

---

## A Caveat on What Projection Does Not Give You

Projection gives you the mechanics. It does not give you identification. The moment conditions that make OLS unbiased ($\mathbb{E}[X'\varepsilon] = 0$), or that make IV work ($\mathbb{E}[Z'\varepsilon] = 0$), are inputs to the projection story. The framework takes them as given and shows what follows.

Where the moment conditions come from, and whether they hold in a particular empirical setting, is the hardest part of applied work. Choosing an instrument, defending an exclusion restriction, arguing for conditional independence: these are substantive claims about the world that the geometry cannot adjudicate. The geometry tells you what follows if the moment conditions hold. It does not tell you whether they do.
