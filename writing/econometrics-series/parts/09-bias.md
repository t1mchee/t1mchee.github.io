# Bias and the Four Ways It Arises

## What is bias and how do we interpret it geometrically?

Bias is a statement about where OLS lands relative to where it should.

OLS does one thing mechanically. It projects $\mathbf{y}$ onto $\text{col}(\mathbf{X})$. The projection $\hat{\mathbf{y}} = \mathbf{P_X} \mathbf{y}$ defines $\hat\beta$ through $\hat{\mathbf{y}} = \mathbf{X}\hat\beta$. It always exists and is always the closest point in $\text{col}(\mathbf{X})$ to $\mathbf{y}$ in Euclidean distance. Whether it lands at $\mathbf{X}\beta$ is a separate question.

Decompose $\mathbf{y}$ into the true model plus an error and apply the projection:

$$\hat{\mathbf{y}} = \mathbf{P_X} \mathbf{y} = \mathbf{P_X} \mathbf{X}\beta + \mathbf{P_X} \boldsymbol{\varepsilon} = \mathbf{X}\beta + \mathbf{P_X} \boldsymbol{\varepsilon}$$

The first term is what we want. The second, $\mathbf{P_X} \boldsymbol{\varepsilon}$, is the projection of the error onto the regressor space: a vector living inside $\text{col}(\mathbf{X})$. Equivalently, $\hat\beta = \beta + (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\boldsymbol{\varepsilon}$, and whether $\mathbb{E}[\hat\beta] = \beta$ comes down to whether $\mathbf{P_X} \boldsymbol{\varepsilon}$ averages to zero.

### The shadow

When the error is perpendicular to $\text{col}(\mathbf{X})$, it casts no shadow on the regressor space. $\mathbf{P_X} \boldsymbol{\varepsilon}$ is zero in expectation, $\hat\beta$ lands on $\beta$, OLS is unbiased.

When the error is tilted, any component of $\boldsymbol{\varepsilon}$ that aligns with some regressor direction casts a shadow onto $\text{col}(\mathbf{X})$. $\mathbf{P_X}$ catches the shadow and dumps it into $\hat\beta$. The estimator confuses the part of $\mathbf{y}$ that came from the tilt of $\boldsymbol{\varepsilon}$ with the part that came from $\mathbf{X}\beta$. That confusion is bias.

The two-panel version makes the mechanism literal. Exogenous error on the left: OLS drops a perpendicular and lands on the true model. Endogenous error on the right: OLS drops the same perpendicular, but the foot lands past the true model by exactly the shadow.

![](econometrics-series/img/Pasted%20image%2020260215152853.png)

### Reinterpreting The OVB formula

The omitted variable bias formula from the previous chapter is the same object, written algebraically. If the true model is $Y = X'\beta + W'\gamma + u$ with $\mathbb{E}[Xu] = 0$ but we regress on $X$ alone, then $\varepsilon = W'\gamma + u$ and

$$\hat\beta \xrightarrow{p} \beta + (\mathbb{E}[XX'])^{-1}\mathbb{E}[XW']\gamma$$

The bias term is the projection coefficient of $W$ onto $X$ times $\gamma$. That is exactly the shadow: $(\mathbb{E}[XX'])^{-1}\mathbb{E}[XW']$ says how much of $W$ lives in the linear span of $X$, and $\gamma$ says how much each unit of $W$ contributes to $Y$. Multiply them and you have the piece of $\varepsilon$ that OLS scoops up when $X$ projects over it.

Every source of endogeneity reduces to this picture. Ability lurking in the error term of a wage equation, classical measurement error, simultaneity, self-selection: the label changes, the geometry does not. Something systematic sits in $\varepsilon$; it has a non-zero component along the linear span of $X$; OLS projects and the component becomes bias.

![](econometrics-series/img/Pasted%20image%2020260215153056.png)

### Four ways the shadow can appear

Unbiasedness requires the projection to hit $\beta$ on target. That can go wrong in four places.

Linearity makes $\text{col}(\mathbf{X})$ the right subspace to project onto. If the true conditional expectation is curved, the flat subspace doesn't contain it, and the closest-flat-point approximation misses $\beta$ systematically.

Zero conditional mean (or the weaker moment condition $\mathbb{E}[X'\varepsilon] = 0$) holds $\varepsilon$ perpendicular to the linear span of $X$. Without it, $\boldsymbol{\varepsilon}$ is tilted and the shadow returns.

No perfect multicollinearity keeps $\text{col}(\mathbf{X})$ genuinely $k$-dimensional. If the columns are linearly dependent, the subspace collapses, $\mathbf{X}'\mathbf{X}$ is singular, and $\hat\beta$ is not identified.

Random sampling makes $\frac{1}{n}\mathbf{X}'\mathbf{X}$ and $\frac{1}{n}\mathbf{X}'\boldsymbol{\varepsilon}$ consistent estimators of their population analogues. Without it, the sample projection converges to the wrong target, or fails to converge at all.

The next four sections work through each.

---

## Linearity in Parameters: $Y = X\beta + \varepsilon$

![](econometrics-series/img/Pasted%20image%2020260215151837.png)

Think of OLS as a recipe. The ingredients are the regressors. The quantities are the parameters. Linearity in parameters means you multiply each ingredient by its quantity and add them together.

The ingredients themselves can be anything: $X^2$, $\log(X)$, $\sqrt{X}$, the interaction $X_1 X_2$. What has to stay linear is the combination. Each transformed regressor enters $Y$ through a $\beta$ coefficient, and the $\beta$'s combine additively. $Y = \beta_0 + \beta_1 X + \beta_2 X^2 + \varepsilon$ is linear in parameters even though the relationship with $X$ is quadratic. $Y = \beta_0 + X^{\beta_1} + \varepsilon$ is not.

Mathematically: $\partial y / \partial \beta_j = x_j$, independent of $\beta_j$. That is what makes the normal equations solvable by matrix algebra.

Geometrically: the assumption confines $\mathbb{E}[Y|X]$ to the column space of $\mathbf{X}$. The data matrix $\mathbf{X} \in \mathbb{R}^{n \times k}$ defines a $k$-dimensional flat subspace of $\mathbb{R}^n$, the set of all vectors $\mathbf{X}\beta$. Linearity says the systematic component of $\mathbf{y}$ lives in this flat subspace. The observed $\mathbf{y}$ is a flat-subspace vector plus orthogonal noise.

The recipe and the subspace are the same object. Each regressor column is one ingredient. The parameters $\beta_j$ are how much of each you use. The linear combination is a point in the subspace. Wooldridge's $\log(\text{wage}) = \beta_0 + \beta_1 \text{educ} + \beta_2 \text{exper} + \varepsilon$ defines a 3-dimensional hyperplane inside the $n$-dimensional space of all possible wage vectors across individuals. The functional form is a choice of which hyperplane.

Adding regressors adds dimensions. Interactions, polynomials, log transforms all expand the subspace, giving the projection more room to approximate $\mathbf{y}$. The degrees of freedom in choosing functional form map directly onto the dimensionality and orientation of the target subspace.

If linearity fails, the set of possible fitted values is no longer a flat subspace. It is a curved surface, and orthogonal projection onto a flat plane will systematically miss it. OLS still produces $\hat\beta$ (it always finds the closest point in $\text{col}(\mathbf{X})$ to $\mathbf{y}$), but that closest point no longer corresponds to anything meaningful about the data-generating process.

---

## Zero Conditional Mean: $\mathbb{E}[\varepsilon | X] = \mathbf{0}$

The assumption economists lose sleep over. It says: once we have controlled for the observed regressors, the remaining unobserved factors in $\varepsilon$ carry no systematic relationship to $X$, in any functional form.

Angrist and Pischke's college premium is the canonical case. People who attend college earn more, but they are also smarter, wealthier, more motivated. Those unobserved traits sit in $\varepsilon$. Education sits in $X$. If the traits correlate with schooling, exogeneity fails. The coefficient on education picks up not just the causal return to schooling but the "ability premium" lurking in the error.

Geometrically, the failure is a tilt. Under ZCM, the error vector $\boldsymbol{\varepsilon}$ is perpendicular to $\text{col}(\mathbf{X})$: it rises straight out of the regressor plane. Under endogeneity, it leans toward the plane. Ability tilts $\boldsymbol{\varepsilon}$ along the education direction.

![](econometrics-series/img/Pasted%20image%2020260215162727.png)

OLS projects $\mathbf{y}$ onto $\text{col}(\mathbf{X})$ and catches the shadow of the tilt. The projection lands past the true $\mathbf{X}\beta$ by exactly the amount the shadow contributes. "Ability biases the education coefficient" and "$\boldsymbol{\varepsilon}$ casts a non-zero shadow on $\text{col}(\mathbf{X})$" are the same sentence in different vocabulary.

![](econometrics-series/img/Pasted%20image%2020260215162859.png)

ZCM is the stronger of the two orthogonality conditions from the Expectations chapter. It requires $\varepsilon \perp L^2(\sigma(X))$: orthogonality to every measurable function of $X$, not just the linear span. The weaker moment condition $\mathbb{E}[X'\varepsilon] = 0$ only requires perpendicularity to $\text{span}\{1, X_1, \ldots, X_k\}$. For OLS consistency in a linear model, the moment condition suffices. For stronger identification arguments, particularly in time series where $\varepsilon_t$ must be uncorrelated with past and future $X$ as well as contemporaneous $X$, ZCM is required.

The OVB formula says how large the bias is. It is the projection coefficient of the omitted variable (ability) onto the included regressor (education), scaled by the effect of the omitted variable on $Y$. The tilt of $\boldsymbol{\varepsilon}$ toward $\text{col}(\mathbf{X})$ has an exact magnitude and direction, and the OLS projection copies both into $\hat\beta$.

The next post shows how instrumental variables fix this by projecting along a different direction.

---

## Random Sampling: $\{(Y_i, X_i)\}_{i=1}^n$ are i.i.d.

Every observation is an independent draw from the same population distribution. A worker in observation 42 is governed by the same wage equation as a worker in observation 7. Each is a fresh draw from the same data-generating process.

Economists tend to accept this in cross-sectional work and worry about it elsewhere. Time series violates it: this quarter's GDP depends on last quarter's. Clustered data violates it: students in the same school share unobserved shocks. The textbook treatment assumes random sampling early and relaxes it when time series and panel data arrive.

Geometrically, random sampling puts a specific structure on $\mathbb{R}^n$. The coordinate axes are exchangeable. Each axis is one observation, and because observations are i.i.d., no axis is privileged. The data matrix $\mathbf{X}$ and error vector $\boldsymbol{\varepsilon}$ are built from $n$ independent, identically distributed draws stacked vertically. There is a symmetry across rows.

The symmetry justifies two things economists rely on without thinking. First, the sample inner product $\frac{1}{n}\mathbf{X}'\mathbf{y}$ weights every observation equally, which is right precisely because every observation is drawn from the same distribution. Second, the covariance matrix of the stacked error vector has no off-diagonal structure attributable to the sampling design. Any correlation in $\varepsilon$ comes from the error process itself, not from the way we drew the sample.

When random sampling fails, $\mathbb{R}^n$ is warped before we even get to the error structure. In clustered data, coordinate axes for students in the same school carry correlated information. The effective dimensionality of the data is less than $n$; clustered observations partially duplicate each other. "Cluster your standard errors" and "the ambient space has lower effective dimension than $\mathbb{R}^n$" are the same instruction in different vocabulary.

Time series is the same story in a different shape. Rows are ordered and dependent. The data vector is a path rather than $n$ scattered points. The sample inner product $\frac{1}{n}\sum x_i y_i$ still converges to $\mathbb{E}[XY]$, but slower than $\sqrt{n}$, because each row contributes less fresh information. The geometry works; its convergence rate changes. That is why time series econometrics needs its own asymptotic theory.

---

## No Perfect Multicollinearity: $\text{rank}(\mathbf{X}) = k$ a.s.

No regressor is an exact linear function of the others. Wooldridge's example: experience and tenure move together because people who have worked longer at one firm have also worked longer overall. If tenure were exactly $0.8 \times \text{experience} + 3$, we could not separately identify their effects on wages. Perfect multicollinearity is rare in practice and usually signals a coding error, like including all dummy categories plus a constant. Near-multicollinearity, where regressors are highly but not perfectly correlated, inflates standard errors and destabilises estimates.

Geometrically, the $k$ columns of $\mathbf{X}$ must span a $k$-dimensional subspace of $\mathbb{R}^n$. If one column is a linear combination of the others, the columns span a subspace of dimension less than $k$: the column space collapses. Algebraically, $\mathbf{X}'\mathbf{X}$ becomes singular and $\hat\beta = (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\mathbf{y}$ is undefined; the matrix inverse does not exist. Geometrically, the projection $\mathbf{P_X}$ requires a well-defined subspace to project onto, and a degenerate subspace has no unique representation.

The experience-tenure example in $\mathbb{R}^n$: two nearly-parallel vectors. Their column space is a sliver of a plane rather than a robust 2D surface. OLS projects $\mathbf{y}$ onto this sliver, but the decomposition of the projection into "how much is experience" versus "how much is tenure" becomes arbitrary. A slightly different sample, one where a few individuals whose tenure and experience diverge more, would dramatically change the split between $\hat\beta_{\text{exper}}$ and $\hat\beta_{\text{tenure}}$, even though the total fitted values barely move.

"We cannot separately identify the effects" (the economist's version) and "the coordinates of the projection in a nearly-degenerate basis are unstable" (the geometer's version) are the same statement. The fitted values are stable; the decomposition into coefficients is not.

Near-multicollinearity has a practical signature beyond the interpretation problem. When the subspace is thin, the projection of $\mathbf{y}$ onto it is extremely sensitive to $\mathbf{y}$. Tiny perturbations cause the projection to slide dramatically along the direction where the subspace is nearly flat. Standard errors explode because the estimator is hypersensitive to noise along the collinear direction.

---

## Two flavours of degeneracy in $\mathbf{X}$

No perfect multicollinearity and random sampling are both about rank deficiency, in different dimensions of $\mathbf{X}$.

Multicollinearity is about the columns. If columns are linearly dependent, $\text{col}(\mathbf{X})$ is less than $k$-dimensional and $\mathbf{X}'\mathbf{X}$ is singular. The projection onto $\text{col}(\mathbf{X})$ has no unique representation in terms of $\beta$. This is a finite-sample, algebraic problem: $\mathbf{X}'\mathbf{X}$ literally isn't invertible.

Random sampling is about the rows. If observations are dependent (clustering, time series), the $n$ rows don't carry $n$ independent pieces of information. The effective rank of the row space is less than you'd expect. $\mathbf{X}'\mathbf{X}$ is still invertible and the projection is still well-defined, but $\frac{1}{n}\mathbf{X}'\mathbf{X}$ converges to $\mathbb{E}[XX']$ more slowly because the rows are partially redundant. This is an inferential problem: the projection works mechanically, but your uncertainty about it is larger than $n$ suggests.

The matrix $\mathbf{X}'\mathbf{X}$ connects both. Multicollinearity makes it singular. Dependence across rows doesn't make it singular, but it makes $\frac{1}{n}\mathbf{X}'\mathbf{X}$ a noisier estimate of $\mathbb{E}[XX']$ for a given $n$, because dependent rows contribute less marginal information. One breaks the projection. The other breaks your confidence in it.
