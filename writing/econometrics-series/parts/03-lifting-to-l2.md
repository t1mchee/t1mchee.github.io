# Lifting to $L^2(P)$: Expectations as Inner Products

## 3. The Hilbert Space of Random Variables

Everything in the previous post lives in $\mathbb{R}^n$. Each axis is one observation; each vector is a concrete piece of data. The projection picture is vivid because we can draw it.

The population is different. It has infinitely many potential observations; we don't have a data matrix but a joint distribution. We want to do the same projection geometry in this world. The question is whether we can.

For projection to work, we need three things: a notion of length (how big is a random variable?), a notion of angle (how aligned are two random variables?), and these have to obey the Pythagorean theorem and the projection recipe we just used.

The candidates are already in front of us. The "size" of a random variable should be something like $\sqrt{\mathbb{E}[X^2]}$: its root mean square. The "alignment" between $X$ and $Y$ should be $\mathbb{E}[XY]$: their expected product. These are not arbitrary. We have been using $\frac{1}{n}\sum_i x_i y_i$ as an inner product on $\mathbb{R}^n$ this whole time, and that sample inner product is a Monte Carlo estimator of $\mathbb{E}[XY]$. The population inner product is the limit the sample one converges to. The geometry we just did with data vectors is an empirical approximation of geometry on random variables.

So define

$$\langle X, Y \rangle = \mathbb{E}[XY]$$

and check the axioms:

- **Linearity**: $\langle aX + bZ, Y \rangle = a\mathbb{E}[XY] + b\mathbb{E}[ZY]$
- **Symmetry**: $\langle X, Y \rangle = \langle Y, X \rangle$
- **Positive definiteness**: $\langle X, X \rangle = \mathbb{E}[X^2] \geq 0$, with equality iff $X = 0$ a.s.

All three hold. The space of random variables with finite second moments, $L^2(\Omega, \mathcal{F}, P)$, is a Hilbert space under this inner product, and the projection machinery carries over.

The a.s. qualifier in positive definiteness is doing important work. $L^2$ is a space of equivalence classes: random variables that agree almost surely are treated as the same element. Two functions on $\Omega$ that differ only on a probability-zero set correspond to the same vector in $L^2$. Without this identification, $\langle X, X \rangle = 0$ would not force $X = 0$ as an element, and the inner product axioms would fail.

The induced norm is $\|X\| = \sqrt{\mathbb{E}[X^2]}$, and the distance between random variables is $\|X - Y\| = \sqrt{\mathbb{E}[(X-Y)^2]}$: **root mean squared error**.

> **Intuition**: Random variables are now "vectors" in an infinite-dimensional space. The length of $X$ is its $L^2$ norm. The angle between $X$ and $Y$ encodes their correlation. The geometric moves from the previous post now apply to random variables instead of data vectors.

**The two levels of linear algebra.** Two parallel spaces, same geometry.

- The **sample space** $\mathbb{R}^n$: each axis is an observation, inner product is $\mathbf{u}'\mathbf{v}$, projection is OLS, residual is perpendicular to regressor columns.
- The **population space** $L^2(P)$: each "vector" is a random variable, inner product is $\mathbb{E}[XY]$, projection is conditional expectation or linear projection, residual is uncorrelated with regressor variables.

The sample inner product $\frac{1}{n}\mathbf{u}'\mathbf{v} = \frac{1}{n}\sum_i u_i v_i$ is a Monte Carlo estimator of the population inner product $\mathbb{E}[UV]$. Everything below holds in both spaces. Economists usually work in the sample; the population version is where identification lives.

---

## 4. Expectation as Inner Product with the Constant

In $L^2(P)$, the expectation $\mathbb{E}[X]$ is the inner product of $X$ with the constant random variable $\mathbf{1}$:

$$\mathbb{E}[X] = \langle X, \mathbf{1} \rangle$$

This is trivial but useful. The constant $\mathbf{1}$ plays the role of a basis vector in the space, and expectations are inner products of data with that one direction. Centring $X$ by subtracting its mean is geometrically the same as projecting $X$ onto the orthogonal complement of $\mathbf{1}$.

The identity has a payoff economists use without thinking. Whenever we centre the outcome before computing $R^2$, we are removing the component of $\mathbf{y}$ along the constant vector $\mathbf{1}$. The "total sum of squares" $\|\mathbf{y} - \bar y \mathbf{1}\|^2$ is the squared length of $\mathbf{y}$ after projecting out the constant direction. Then $R^2$ is the fraction of that residualised length the regressors recover. The algebra of "subtract the mean" and the geometry of "project onto $\mathbf{1}^\perp$" are the same operation.

---

## 5. Orthogonality, Two Strengths

Exogeneity comes in two versions, and they correspond to two different orthogonality statements.

The **moment condition** $\mathbb{E}[X\varepsilon] = 0$ (equivalently $\langle X_j, \varepsilon \rangle = 0$ for each $j$) says the error is orthogonal to each regressor individually, and therefore to their linear span. In the sample, this is $\mathbf{X}'\mathbf{e} = \mathbf{0}$: the residual vector is perpendicular to the columns of $\mathbf{X}$. In the population, $\varepsilon$ has zero inner product with each $X_j$ as random variables.

The **zero conditional mean** $\mathbb{E}[\varepsilon | X] = 0$ is strictly stronger. It says $\varepsilon$ is orthogonal to every measurable function of $X$, not just $X_1, \ldots, X_k$ themselves. That means orthogonality with the entire subspace $L^2(\sigma(X))$, which includes $X^2$, $\log X$, $\mathbf{1}_{\{X > 0\}}$, and every other function of $X$ you could write down.

The distinction is exactly the linear-vs-nonlinear projection distinction in §7. The moment condition asks for perpendicularity with the linear span of the regressors. Strict exogeneity asks for perpendicularity with the full nonlinear subspace $L^2(\sigma(X))$ that contains it.

Which version you need depends on the goal. For consistency of OLS in a linear model, the moment condition suffices. For strict-exogeneity identification arguments (particularly in time series, where $\varepsilon_t$ has to be orthogonal to past, present, and future values of the regressors), the stronger form is required. The two coincide under joint normality and in many textbook i.i.d. settings, which is why the distinction is often glossed over.

---

## 6. Conditional Expectation as Projection

Let $\mathcal{G} \subseteq \mathcal{F}$ be a sub-$\sigma$-algebra (intuitively, the information contained in some set of random variables). The conditional expectation $\mathbb{E}[Y | \mathcal{G}]$ is the **orthogonal projection** of $Y$ onto $L^2(\mathcal{G})$, the subspace of $\mathcal{G}$-measurable random variables.

$\mathbb{E}[Y | \mathcal{G}]$ is the unique element $\hat Y \in L^2(\mathcal{G})$ satisfying:

$$\mathbb{E}[(Y - \hat Y)Z] = 0 \quad \forall Z \in L^2(\mathcal{G})$$

Equivalently: $Y - \hat Y \perp L^2(\mathcal{G})$.

In finite-dimensional linear algebra, the orthogonal projection of a vector onto a subspace $V$ is the unique element of $V$ whose residual is perpendicular to $V$. The conditional expectation is exactly this, but in $L^2(P)$ instead of $\mathbb{R}^n$.

> **Intuition**: Conditioning on $X$ means asking "what is the best approximation to $Y$ using only information in $X$?" Best means minimising $\mathbb{E}[(Y - g(X))^2]$ over measurable functions $g$. The solution is $g(X) = \mathbb{E}[Y|X]$, exactly as projection minimises squared distance.

Any random variable $Y$ decomposes as:

$$Y = \underbrace{\mathbb{E}[Y|X]}_{\text{projection onto } L^2(\sigma(X))} + \underbrace{(Y - \mathbb{E}[Y|X])}_{\text{orthogonal residual}}$$

This is the Pythagorean theorem in $L^2$:

$$\mathbb{E}[Y^2] = \mathbb{E}[\mathbb{E}[Y|X]^2] + \mathbb{E}[(Y - \mathbb{E}[Y|X])^2]$$

which, after centring, is the variance decomposition $\text{Var}(Y) = \text{Var}(\mathbb{E}[Y|X]) + \mathbb{E}[\text{Var}(Y|X)]$.

---

## 7. Linear Projection vs. Conditional Expectation

The **conditional expectation** $\mathbb{E}[Y|X]$ projects onto all measurable functions of $X$: the full subspace $L^2(\sigma(X))$.

The **linear projection** $X'\beta^*$ where $\beta^* = (\mathbb{E}[XX'])^{-1}\mathbb{E}[XY]$ projects onto a linear subspace: the span of the components of $X$.

The inverse $(\mathbb{E}[XX'])^{-1}$ exists when the components of $X$ are linearly independent as elements of $L^2$: no $X_j$ can be written as an almost-sure linear combination of the others. This is the population version of no perfect multicollinearity. At the sample level, $\mathbf{X}'\mathbf{X}$ is invertible iff the columns of $\mathbf{X}$ are linearly independent. At the population level, $\mathbb{E}[XX']$ is invertible iff the random variables $X_1, \ldots, X_k$ are linearly independent in $L^2$.

The linear subspace is contained in the nonlinear one:

$$\text{span}\{1, X_1, \ldots, X_k\} \subseteq L^2(\sigma(X))$$

with equality iff $\mathbb{E}[Y|X]$ happens to be linear in $X$.

Joint normality is the canonical case where the two projections coincide. If $(X, Y)$ is jointly multivariate normal with mean zero, the standard partitioned-density calculation gives:

$$\mathbb{E}[Y|X] = \Sigma_{YX}\Sigma_{XX}^{-1} X$$

which is linear in $X$. The proof is a completion-of-the-square exercise on the joint normal density: conditioning on $X$ produces another normal with mean $\Sigma_{YX}\Sigma_{XX}^{-1}X$ and variance $\Sigma_{YY} - \Sigma_{YX}\Sigma_{XX}^{-1}\Sigma_{XY}$. Linearity of the conditional mean is the payoff.

Under joint normality, the nonlinear subspace $L^2(\sigma(X))$ is strictly larger than the linear span, but the closest point in the larger subspace happens to lie inside the smaller one. The two projections land on the same vector.

In general, $X'\beta^*$ is the projection of $Y$ onto the linear subspace, and $\mathbb{E}[Y|X]$ is the projection onto the full nonlinear subspace. The linear projection is (weakly) further from $Y$ and explains weakly less variance.
