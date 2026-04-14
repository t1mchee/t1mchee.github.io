# GMM: Approximate Orthogonality

The previous chapter established the core insight: **regression is projection, and projection is regression.** OLS projects $\mathbf{y}$ onto the column space of $\mathbf{X}$, the residual is orthogonal to the regressors, and the normal equations are orthogonality conditions in both the sample space $\mathbb{R}^n$ and the population space $L^2(P)$.

OLS lives in a special world. The number of orthogonality conditions equals the number of parameters, and exact orthogonality is achievable. The Generalized Method of Moments is what happens when we leave that world. The geometry doesn't break; it generalises.

---

## 1. Moment Conditions as Orthogonality

Start with the general setup. You have a parameter vector $\theta \in \mathbb{R}^k$ and a vector of moment conditions:

$$\mathbb{E}[g(Z_i, \theta_0)] = \mathbf{0}$$

where $g : \mathbb{R}^d \times \mathbb{R}^k \to \mathbb{R}^\ell$ maps a single observation and a parameter to $\ell$ moment restrictions. In the linear IV model, $g(Z_i, \theta) = Z_i(Y_i - X_i'\theta)$, and the moment conditions say:

$$\mathbb{E}[Z_j \varepsilon(\theta_0)] = 0, \quad j = 1, \ldots, \ell$$

In the Hilbert space language from the previous chapter, each condition is an inner product:

$$\langle Z_j, \varepsilon(\theta_0) \rangle = 0$$

The moment conditions say: **the residual $\varepsilon(\theta_0)$ is orthogonal to each instrument $Z_j$ in $L^2(P)$**.

This is the same orthogonality we had in OLS, but now the "regressors" (instruments) and the "parameters" (coefficients on $X$) live in different spaces. We are no longer projecting onto the same subspace we're parameterising.

---

## 2. Exact Identification: Projection Still Works

When $\ell = k$ (the number of moment conditions equals the number of parameters), the system $\mathbb{E}[g(Z_i, \theta)] = \mathbf{0}$ is generically exactly identified. There exists a unique $\theta_0$ that makes the residual orthogonal to all $\ell$ instruments.

This is the IV estimator. In the linear case, the population IV coefficient is:

$$\beta_{IV} = (\mathbb{E}[ZX'])^{-1}\mathbb{E}[ZY]$$

Geometrically, we are still doing projection, but with a twist. OLS projects $\mathbf{y}$ onto $\text{col}(\mathbf{X})$ in the sample (and the corresponding linear span of $X$ in the population) using the Euclidean inner product. IV uses the instruments to define the projection instead. The condition $\mathbb{E}[Z\varepsilon] = 0$ says the residual is orthogonal to the _instrument_ space, not the _regressor_ space. When $X$ and $Z$ span different subspaces (as they do when $X$ is endogenous), this is an **oblique projection**: project $\mathbf{y}$ onto $\text{col}(\mathbf{X})$ along the direction orthogonal to $\text{col}(\boldsymbol{Z})$, rather than along the direction orthogonal to $\text{col}(\mathbf{X})$ itself.

> **Intuition**: OLS drops a perpendicular from $\mathbf{y}$ to $\text{col}(\mathbf{X})$. IV drops a line from $\mathbf{y}$ to $\text{col}(\mathbf{X})$ that is perpendicular to $\text{col}(\boldsymbol{Z})$ instead. When $\boldsymbol{Z} = \mathbf{X}$, the two coincide. When $\boldsymbol{Z} \neq \mathbf{X}$, the line lands on $\text{col}(\mathbf{X})$ but approaches from a different angle.

---

## 3. Overidentification: Too Many Orthogonality Conditions

Now the case that makes GMM necessary. You have $\ell$ instruments and $k$ parameters, with $\ell > k$. To fix ideas, take $k = 2$ parameters and $\ell = 3$ instruments. The model produces three orthogonality conditions, one per instrument:

$$\langle Z_1, \varepsilon(\theta) \rangle = 0, \quad \langle Z_2, \varepsilon(\theta) \rangle = 0, \quad \langle Z_3, \varepsilon(\theta) \rangle = 0$$

Each equation is one constraint on $\theta = (\theta_1, \theta_2) \in \mathbb{R}^2$. Three constraints on two unknowns. Generically, no $\theta$ satisfies all three simultaneously. This is the linear-algebra fact that a system of three equations in two unknowns is overdetermined.

The geometry makes the problem visible. Define the **moment map** $m: \mathbb{R}^k \to \mathbb{R}^\ell$ by $m(\theta) = \mathbb{E}[g(Z, \theta)]$. In our example $m$ takes a 2D parameter and outputs a 3D moment vector. We want $m(\theta) = \mathbf{0}$.

As $\theta$ varies over $\mathbb{R}^2$, the image $\{m(\theta) : \theta \in \mathbb{R}^2\}$ traces out a 2D surface sitting inside $\mathbb{R}^3$. For some $\theta_0$ to solve $m(\theta_0) = \mathbf{0}$, that 2D surface has to pass through the origin of $\mathbb{R}^3$.

A 2D surface in 3D generically misses any particular point. Think of a plane floating in space: it passes through the origin only if it is positioned precisely to do so. Under correct model specification, the moment manifold does pass through the origin at the true $\theta_0$. But the sample version typically doesn't — and even in the population, if the model is misspecified, no parameter makes all moments hold at once.

### The Sample Version

In the sample the moment conditions become:

$$\bar g_n(\theta) = \frac{1}{n}\sum_{i=1}^n g(Z_i, \theta)$$

The sample moment map $\bar g_n$ is a noisy estimator of the population moment map $m$. Even under correct specification, $\bar g_n(\theta_0) \neq \mathbf{0}$ at any finite $n$: sampling noise of order $1/\sqrt{n}$ pushes the sample moment vector off the true zero. The sample moment vector lies somewhere in $\mathbb{R}^\ell$ away from the origin, and the $k$-dimensional image of $\bar g_n$ generally doesn't pass through zero.

In the just-identified case ($\ell = k$), we can still find a $\hat\theta$ that makes the sample moment vector exactly zero — the system is square and generically invertible. The $k$-dimensional image of a $k$-to-$k$ function fills $\mathbb{R}^k$, so hitting zero is typical. In the overidentified case, the image is a $k$-dimensional surface inside the larger $\mathbb{R}^\ell$, and hitting any specific point (like the origin) is atypical.

The situation: we want to pick $\theta$ to drive $\bar g_n(\theta)$ toward zero, but we can't reach zero exactly. This is why we need an estimator at all. In the just-identified case the moment conditions _determine_ the estimator; in the overidentified case they only _constrain_ it, and we have to make a choice.

The choice is: if we can't hit zero, pick the $\theta$ that comes closest. The next section makes "closest" precise.

---

## 4. GMM: Minimising Distance from Orthogonality

If you can't achieve exact orthogonality, find the $\theta$ that comes **closest**.

Define the GMM objective:

$$Q_n(\theta) = \bar g_n(\theta)' W \bar g_n(\theta)$$

where $W$ is a positive definite $\ell \times \ell$ weighting matrix. The GMM estimator is:

$$\hat\theta_{GMM} = \arg\min_\theta \; \bar g_n(\theta)' W \bar g_n(\theta)$$

$Q_n(\theta)$ is the **squared norm** of the moment vector $\bar g_n(\theta)$ under the inner product defined by $W$:

$$Q_n(\theta) = \|\bar g_n(\theta)\|_W^2$$

GMM minimises the squared distance of the moment vector from the origin in a $W$-weighted space. The moment vector $\bar g_n(\theta)$ lives in $\mathbb{R}^\ell$. As $\theta$ varies over $\mathbb{R}^k$, the image $\{\bar g_n(\theta) : \theta \in \mathbb{R}^k\}$ traces out a $k$-dimensional surface in $\mathbb{R}^\ell$. GMM finds the point on this surface closest to $\mathbf{0}$.

> **Intuition**: Think of $\mathbb{R}^\ell$ as the moment space where each axis represents one orthogonality condition. The origin $\mathbf{0}$ is the point of perfect orthogonality. As you vary $\theta$, you trace out a manifold in this space. GMM finds the point on the manifold nearest to the origin: the parameter value that comes closest to satisfying all moment conditions at once.

In the exactly identified case ($\ell = k$), the surface is $k$-dimensional in $\mathbb{R}^k$, generically passes through the origin, and GMM reduces to the method of moments.

---

## 5. The Weighting Matrix as Metric

The weighting matrix $W$ defines the **metric** on moment space. Different choices of $W$ correspond to different notions of distance from orthogonality, and hence different estimators.

The quadratic form $\bar g' W \bar g$ defines an ellipsoid of equidistant points in $\mathbb{R}^\ell$. The eigenvectors of $W$ determine the axes of the ellipsoid; the eigenvalues determine how compressed or stretched each axis is. A large eigenvalue in some direction means violations of the corresponding moment condition are penalised heavily.

With $W = I_\ell$, all moment conditions are penalised equally; the iso-distance sets are spheres. With $W \neq I$, some conditions matter more than others and the geometry is anisotropic.

Efficient GMM sets:

$$W^* = \text{Var}(g(Z_i, \theta_0))^{-1} = \Sigma^{-1}$$

The moment conditions have different variances and are correlated with each other. A well-estimated moment condition (low variance) provides more information and should receive more weight. A poorly estimated one (high variance) is noisy and should be downweighted.

$W^* = \Sigma^{-1}$ is the **Mahalanobis metric**: it whitens the moment space so the noise is spherical, then minimises Euclidean distance in the whitened space. This is the same move as GLS in regression. GLS whitens heteroskedastic errors before projecting; efficient GMM whitens heterogeneous moment conditions before minimising.

> **Intuition**: Imagine two moment conditions, one estimated with standard error 0.01 and the other with standard error 10. The identity weighting matrix treats a violation of 1 in either direction equally. A violation of 1 in the first condition is 100 standard errors, overwhelmingly informative. The optimal $W$ rescales the space so one standard error is the same distance in every direction.

### A Worked Example

Take the smallest case with enough structure to show the machinery in action. Two parameters $\theta = (\theta_1, \theta_2)$ and three moment conditions, chosen so the moment map is linear in $\theta$:

$$m_1(\theta) = \theta_1 - 2, \qquad m_2(\theta) = \theta_2 - 1, \qquad m_3(\theta) = \theta_1 + \theta_2 - 4$$

Three orthogonality conditions, two unknowns. Overdetermined. The first two would pin $\theta$ to $(2, 1)$, but then $m_3 = 2 + 1 - 4 = -1 \neq 0$. No $\theta$ satisfies all three at once.

The image $\{m(\theta) : \theta \in \mathbb{R}^2\}$ is a 2D plane in $\mathbb{R}^3$. We want the point on it closest to the origin. Closeness is measured by $W$.

**Unweighted.** Set $W = I_3$. Minimise $m_1^2 + m_2^2 + m_3^2$. First-order conditions give:

$$2\theta_1 + \theta_2 = 6, \qquad \theta_1 + 2\theta_2 = 5$$

Solving: $\hat\theta = (7/3, 4/3)$. At this point, $m(\hat\theta) = (1/3, 1/3, -1/3)$. Each moment condition is violated by the same amount. Equal weighting gives equal sacrifice.

The residual moment vector $(1/3, 1/3, -1/3)$ points perpendicular to the 2D plane $\{m(\theta) : \theta \in \mathbb{R}^2\}$ inside $\mathbb{R}^3$. It is the leftover distance the plane cannot eliminate, fixed by the plane's orientation relative to the origin.

**Reweighted.** Set $W = \text{diag}(1, 1, 4)$, putting four times more weight on the third moment. Minimise $m_1^2 + m_2^2 + 4 m_3^2$:

$$5\theta_1 + 4\theta_2 = 18, \qquad 4\theta_1 + 5\theta_2 = 17$$

Solving: $\hat\theta = (22/9, 13/9)$. Now $m(\hat\theta) = (4/9, 4/9, -1/9)$. The third moment is nearly satisfied ($|m_3|$ dropped from $1/3$ to $1/9$) at the cost of larger violations on $m_1$ and $m_2$ (from $1/3$ to $4/9$). Weighting $m_3$ heavily pulls the estimator toward the manifold point that best satisfies that specific condition.

Two observations. First, different weights give different estimates. The weighting matrix is a modelling choice, not a cosmetic one. Second, at the optimum, the residual moment vector is orthogonal (in the $W$-metric) to the tangent plane of the moment manifold. That perpendicularity is the geometric content of the FOC: no direction of movement along the manifold reduces $W$-distance to the origin.

The population version is §9. The map $m(\theta) = \mathbb{E}[g(Z, \theta)]$ is a $k$-dimensional surface in $\mathbb{R}^\ell$. Under correct specification it passes through the origin at $\theta_0$; under misspecification or finite-sample noise it doesn't. GMM finds the point on the surface closest to the origin in the $W$-metric.

---

## 6. Two-Stage Least Squares as a Special GMM

2SLS fits cleanly into this framework and connects back to the projection story.

In the linear IV model with data matrix $\mathbf{X}$ and instrument matrix $\boldsymbol{Z}$ ($\ell \geq k$), 2SLS proceeds. **First stage.** Project $\mathbf{X}$ onto $\text{col}(\boldsymbol{Z})$ in $\mathbb{R}^n$, yielding $\hat{\mathbf{X}} = \mathbf{P}_{\boldsymbol{Z}} \mathbf{X}$ where $\mathbf{P}_{\boldsymbol{Z}} = \boldsymbol{Z}(\boldsymbol{Z}'\boldsymbol{Z})^{-1}\boldsymbol{Z}'$. **Second stage.** Regress $\mathbf{y}$ on $\hat{\mathbf{X}}$, yielding $\hat\beta_{2SLS} = (\hat{\mathbf{X}}'\hat{\mathbf{X}})^{-1}\hat{\mathbf{X}}'\mathbf{y}$.

The 2SLS estimator is a GMM estimator with $W = (\boldsymbol{Z}'\boldsymbol{Z}/n)^{-1}$.

The first stage finds the best linear approximation to $\mathbf{X}$ in $\text{col}(\boldsymbol{Z})$, a standard orthogonal projection. The second stage projects $\mathbf{y}$ onto $\text{col}(\hat{\mathbf{X}})$, another orthogonal projection. Since $\hat{\mathbf{X}} = \mathbf{P}_{\boldsymbol{Z}} \mathbf{X}$ lies in $\text{col}(\boldsymbol{Z})$, the composition projects $\mathbf{y}$ onto a $k$-dimensional subspace of $\text{col}(\boldsymbol{Z})$.

This is the "closest to orthogonality" idea made explicit. Among all vectors in $\text{col}(\mathbf{X})$, 2SLS finds the one whose residual $\mathbf{y} - \mathbf{X}\beta$ comes closest to being orthogonal to $\text{col}(\boldsymbol{Z})$. The procedure is to first collapse the instruments to their $\mathbf{X}$-relevant part via the first stage, then project $\mathbf{y}$ onto that.

When $\ell = k$, the first stage is invertible: $\text{col}(\hat{\mathbf{X}}) = \text{col}(\boldsymbol{Z})$, and 2SLS reduces to IV.

---

## 7. The $J$-Test: Testing Residual Orthogonality

The Hansen $J$-statistic has a clean geometric interpretation. Under the null hypothesis that the model is correctly specified, the population moment vector is exactly zero: $\mathbb{E}[g(Z_i, \theta_0)] = \mathbf{0}$. In the sample, $\bar g_n(\hat\theta)$ is not exactly zero, but should be close, within sampling noise.

The $J$-statistic measures how close:

$$J = n \cdot \bar g_n(\hat\theta)' \hat W^* \bar g_n(\hat\theta) \xrightarrow{d} \chi^2_{\ell - k}$$

This is the **squared Mahalanobis distance** of $\bar g_n(\hat\theta)$ from the origin, scaled by $n$.

The moment vector $\bar g_n(\theta)$ lives in $\mathbb{R}^\ell$. By choosing $\hat\theta$ to minimise $Q_n$, we have used up $k$ dimensions: the minimisation forces $\bar g_n(\hat\theta)$ to be orthogonal to the $k$-dimensional tangent space of the model at $\hat\theta$. The remaining variation in $\bar g_n(\hat\theta)$ is confined to the $(\ell - k)$-dimensional orthogonal complement.

Under the null, this residual variation is purely noise, asymptotically $\chi^2$ with $\ell - k$ degrees of freedom. Under the alternative (misspecification), the moment vector has a systematic component in the $(\ell - k)$-dimensional space, and the $J$-statistic is inflated.

> **Intuition**: You are fitting a $k$-dimensional surface to pass near the origin in $\ell$-dimensional moment space. The $J$-test checks whether the remaining distance, in the $\ell - k$ directions you couldn't eliminate, is small enough to be noise. It tests whether the extra orthogonality conditions beyond the ones you needed for identification are approximately satisfied.

---

## 8. The Hierarchy of Projections

OLS, IV, and GMM are instances of the same geometric idea at different levels of constraint.

**OLS** ($\ell = k$, $Z = X$): Project $\mathbf{y}$ onto $\text{col}(\mathbf{X})$. Orthogonality condition $\langle X_j, \varepsilon \rangle = 0$ for $j = 1, \ldots, k$. Exactly identified. Residual perpendicular to regressor space.

**IV, just-identified** ($\ell = k$, $Z \neq X$): Oblique projection of $\mathbf{y}$ onto $\text{col}(\mathbf{X})$ along $\text{col}(\boldsymbol{Z})^\perp$. Orthogonality condition $\langle Z_j, \varepsilon \rangle = 0$ for $j = 1, \ldots, k$. Exactly identified. Residual perpendicular to instrument space.

**GMM, overidentified** ($\ell > k$): Approximate projection. Find $\theta$ minimising $\|\bar g_n(\theta)\|_W^2$. Orthogonality conditions $\langle Z_j, \varepsilon \rangle = 0$ for $j = 1, \ldots, \ell$ cannot all be satisfied. Residual is made as perpendicular as possible to the instrument space, with "as possible" defined by $W$.

As we add instruments beyond parameters, exact orthogonality gives way to approximate orthogonality, and the estimator shifts from projection to optimisation. The objective being optimised _is_ a distance from orthogonality. The geometry of inner products and perpendicularity never leaves.

---

## 9. GMM and the Population Hilbert Space

Return to the population Hilbert space $L^2(P)$ where random variables are vectors. The population GMM problem is:

$$\theta_0 = \arg\min_\theta \; \mathbb{E}[g(Z, \theta)]' W \mathbb{E}[g(Z, \theta)]$$

The vector $m(\theta) = \mathbb{E}[g(Z, \theta)] \in \mathbb{R}^\ell$ is a function of $\theta$ alone. It maps parameters to expected moment violations. The image $\{m(\theta) : \theta \in \mathbb{R}^k\}$ is a $k$-dimensional manifold in $\mathbb{R}^\ell$.

At $\theta_0$ (under correct specification), $m(\theta_0) = \mathbf{0}$; the manifold passes through the origin. The manifold itself is only $k$-dimensional. The orthogonality conditions constrain $\theta$ to a specific point on a specific manifold.

When the model is misspecified, $m(\theta) \neq \mathbf{0}$ for all $\theta$. GMM finds the **pseudo-true value**: the point on the manifold closest to the origin under the $W$-metric. This is the population analogue of "best approximate orthogonality," and it gives GMM a well-defined target even under misspecification.

---

## 10. Connection to the Gauss-Markov Theorem

The efficiency theory of OLS has a direct counterpart in GMM.

Gauss-Markov says OLS is the best linear unbiased estimator: among all estimators that are linear in $\mathbf{y}$ and satisfy the normal equations, OLS has the smallest variance. The proof is projection. Any other linear unbiased estimator adds a component orthogonal to $\text{col}(\mathbf{X})$, which only adds variance.

The GMM efficiency result is analogous. Among all GMM estimators using the same moment conditions but different weighting matrices, the one with $W^* = \Sigma^{-1}$ has the smallest asymptotic variance. The proof: an inefficient $W$ distorts the metric on moment space, causing the estimator to chase noisy moment conditions at the expense of informative ones. The optimal $W$ aligns the metric with the information content, so no variance is wasted.

Both results say: **the efficient estimator uses the right geometry.** OLS is efficient because it uses the correct inner product in $\mathbb{R}^n$ (or rather, GLS uses the correct one under heteroskedasticity; OLS is efficient under homoskedasticity). Efficient GMM is efficient because it uses the correct inner product in moment space.

---

## Concept Dictionary

The running dictionary, with GMM rows at the bottom. Earlier rows carry over from the Expectations chapter.

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

**GMM is approximate projection in moment space.** When there are more orthogonality conditions than parameters, exact perpendicularity is unattainable, so the estimator finds the parameter value that gets closest. The weighting matrix defines "closest", the $J$-test checks whether the remaining gap is noise, and efficient GMM uses the geometry that extracts the most information. The setting is still inner products and perpendicularity, just with perfect orthogonality too much to ask for.
