# Instrumental Variables: Fixing the Tilted Residual

Bias is the shadow of $\boldsymbol{\varepsilon}$ on $\text{col}(\mathbf{X})$. When the error isn't orthogonal to the regressors, OLS absorbs the error component that points along $\mathbf{X}$ and calls it signal. Strict exogeneity fails, the residual is tilted, and the projection lands past $\beta$.

Instrumental variables is the fix. Economists meet it as a procedure; geometrically, it is a change of projection direction.

## Restating the Problem

In the model $\mathbf{y} = \mathbf{X}\beta + \boldsymbol{\varepsilon}$, exogeneity requires $\mathbb{E}[X\varepsilon] = 0$ at the population level, equivalently $\frac{1}{n}\mathbf{X}'\boldsymbol{\varepsilon} \xrightarrow{p} 0$ in the sample. When this fails, the OLS projection of $\mathbf{y}$ onto $\text{col}(\mathbf{X})$ absorbs the component of $\boldsymbol{\varepsilon}$ that aligns with $\mathbf{X}$:

$$\mathbf{P_X} \mathbf{y} = \mathbf{X}\beta + \mathbf{P_X} \boldsymbol{\varepsilon}$$

The bias is $\mathbf{P_X} \boldsymbol{\varepsilon}$, the shadow. No manipulation of the OLS machinery can remove it, because OLS, by construction, projects onto $\text{col}(\mathbf{X})$, and the shadow is a feature of the relationship between $\boldsymbol{\varepsilon}$ and $\text{col}(\mathbf{X})$. Project onto the same subspace, absorb the same shadow.

---

## The Instrument: A Clean Direction

### The Economics

An instrument $Z$ has to satisfy two conditions. **Relevance**: $Z$ is correlated with the endogenous regressor $X$. In the returns-to-education example, a classic instrument is proximity to a college (Card, 1995): people who grew up near a college tend to get more education. **Exclusion**: $Z$ is uncorrelated with the error $\varepsilon$. Living near a college affects wages only through its effect on education, not through any direct channel. Proximity does not make you smarter, richer, or more motivated. It makes college cheaper to attend.

The intuition economists carry is that the instrument isolates the exogenous part of the variation in $X$. Some variation in education is endogenous (driven by ability, which sits in $\varepsilon$). Some is exogenous (driven by proximity to college, which is plausibly random). The instrument picks out the exogenous part and uses only that to estimate the effect of education on wages.

### The Geometry

Translate the two conditions into Hilbert space language. **Relevance**: $\langle Z, X \rangle = \mathbb{E}[ZX] \neq 0$. The instrument is not orthogonal to the regressor; it has a nonzero projection onto the linear span of $X$, or equivalently, $X$ has a nonzero projection onto the linear span of $Z$. **Exclusion**: $\langle Z, \varepsilon \rangle = \mathbb{E}[Z\varepsilon] = 0$. The instrument is orthogonal to the error. The error casts no shadow on $Z$.

The instrument is a direction in $L^2(P)$ (and, at the sample level, in $\mathbb{R}^n$) that is correlated with $X$ but perpendicular to $\varepsilon$. The regressor is contaminated; it has a component along $\varepsilon$. The instrument is clean; it points partly toward $X$ but has no component along $\varepsilon$.

The setup has three arrows. $\boldsymbol{Z}$ lies in a horizontal clean-zone plane. $\boldsymbol{\varepsilon}$ rises perpendicular to that plane. $\mathbf{X}$ is the dirty regressor, tilted up out of the plane because it shares variance with $\boldsymbol{\varepsilon}$.

![](econometrics-series/img/Pasted%20image%2020260215161914.png)

> **Intuition**: $X$ is a vector tilted partly toward $\varepsilon$. The instrument $Z$ points in a similar direction to $X$ but lies flat on the plane perpendicular to $\varepsilon$. $Z$ guides us to the clean direction within $X$.

---

## IV Estimation: Changing the Orthogonality Condition

### The Economics

The IV estimator replaces the OLS moment condition $\mathbb{E}[X\varepsilon] = 0$ (which is false under endogeneity) with the IV moment condition $\mathbb{E}[Z\varepsilon] = 0$ (which is true by the exclusion restriction). The residual has to be orthogonal to $Z$ instead of $X$.

In the just-identified case ($k$ instruments for $k$ endogenous regressors), the IV estimator is:

$$\hat\beta_{IV} = (\boldsymbol{Z}'\mathbf{X})^{-1}\boldsymbol{Z}'\mathbf{y}$$

This is the method of moments estimator from the condition $\mathbb{E}[Z(Y - X'\beta)] = 0$.

### The Geometry

OLS enforces $\mathbf{e} \perp \text{col}(\mathbf{X})$: the residual is perpendicular to the regressor space. This is orthogonal projection, dropping a perpendicular from $\mathbf{y}$ onto $\text{col}(\mathbf{X})$.

IV enforces $\mathbf{e} \perp \text{col}(\boldsymbol{Z})$: the residual is perpendicular to the _instrument_ space. Since $\boldsymbol{Z} \neq \mathbf{X}$, the residual is being made perpendicular to a different subspace. The projection still lands in $\text{col}(\mathbf{X})$; we are still expressing $\hat{\mathbf{y}}$ as $\mathbf{X}\hat\beta$. The direction from which we approach $\text{col}(\mathbf{X})$ has changed.

This is an **oblique projection**: project $\mathbf{y}$ onto $\text{col}(\mathbf{X})$ along the direction perpendicular to $\text{col}(\boldsymbol{Z})$, rather than perpendicular to $\text{col}(\mathbf{X})$ itself.

> **Intuition**: OLS drops a perpendicular from $\mathbf{y}$ straight down onto the floor ($\text{col}(\mathbf{X})$). IV drops a line from $\mathbf{y}$ down to the floor too, but the line is perpendicular to a different plane ($\text{col}(\boldsymbol{Z})$). The line hits the floor at a different point. When $\boldsymbol{\varepsilon}$ is correlated with $\mathbf{X}$, the OLS perpendicular lands at the wrong point because the shadow contaminates it. The IV line, angled to be perpendicular to $\boldsymbol{Z}$ instead, avoids the shadow because $\varepsilon \perp Z$ in the population.

### Why This Fixes the Bias

The OLS bias was $\mathbf{P_X} \mathbb{E}[\boldsymbol{\varepsilon} | \mathbf{X}]$, the shadow of the error on $\text{col}(\mathbf{X})$. IV eliminates the bias because the projection direction is now along $\text{col}(\boldsymbol{Z})^\perp$, and $\varepsilon$ has no component along $Z$. The error may still have a component along $X$ (endogeneity hasn't disappeared), but IV never looks in the $X$ direction. It only checks orthogonality against $Z$. Since $\varepsilon \perp Z$, the error is invisible to the IV projection.

Formally:

$$\hat\beta_{IV} = \beta + (\boldsymbol{Z}'\mathbf{X})^{-1}\boldsymbol{Z}'\boldsymbol{\varepsilon}$$

IV is consistent rather than unbiased. The bias vanishes as $n \to \infty$, but $\hat\beta_{IV}$ is biased in finite samples because $(\boldsymbol{Z}'\mathbf{X})^{-1}$ and $\boldsymbol{Z}'\boldsymbol{\varepsilon}$ both depend on $\boldsymbol{Z}$ and are not independent. Taking a naive expectation doesn't factor the product cleanly into $\mathbb{E}[(\boldsymbol{Z}'\mathbf{X})^{-1}] \cdot \mathbb{E}[\boldsymbol{Z}'\boldsymbol{\varepsilon}]$, and only the latter is zero.

The asymptotics chapter gives the formal statement: sample inner products converge, and the exclusion restriction $\mathbb{E}[Z\varepsilon] = 0$ forces the product to converge in probability to zero. $\hat\beta_{IV} \xrightarrow{p} \beta$ with the usual $\sqrt{n}$ rate. Finite-sample unbiasedness is gone, but consistency and asymptotic normality survive.

---

## 2SLS: The Two-Step Geometry

With more instruments than endogenous regressors ($\ell > k$), IV is no longer directly applicable: more orthogonality conditions than parameters (the overidentification problem from the GMM chapter). Two-stage least squares resolves this through two sequential projections.

### The Economics

Economists learn 2SLS as a recipe. **First stage.** Regress the endogenous regressor $\mathbf{X}$ on the instruments $\boldsymbol{Z}$. Save the fitted values $\hat{\mathbf{X}} = \boldsymbol{Z}(\boldsymbol{Z}'\boldsymbol{Z})^{-1}\boldsymbol{Z}'\mathbf{X}$. These fitted values are the exogenous part of $\mathbf{X}$: the variation in education predicted by proximity to college (and other instruments), stripped of the endogenous variation driven by ability. **Second stage.** Regress $\mathbf{y}$ on $\hat{\mathbf{X}}$ instead of $\mathbf{X}$. Since $\hat{\mathbf{X}}$ contains only exogenous variation, the second-stage OLS is unbiased.

The first stage purifies $\mathbf{X}$ by extracting only the instrument-driven variation. The second stage uses the purified regressor, which is clean of endogeneity.

### The Geometry

Each stage is a projection.

**First stage: project $\mathbf{X}$ onto $\text{col}(\boldsymbol{Z})$.** The endogenous regressor decomposes as:

$$\mathbf{X} = \underbrace{\mathbf{P}_{\boldsymbol{Z}} \mathbf{X}}_{= \hat{\mathbf{X}}, \text{ in } \text{col}(\boldsymbol{Z})} + \underbrace{\mathbf{M}_{\boldsymbol{Z}} \mathbf{X}}_{\perp \text{col}(\boldsymbol{Z})}$$

where $\mathbf{P}_{\boldsymbol{Z}} = \boldsymbol{Z}(\boldsymbol{Z}'\boldsymbol{Z})^{-1}\boldsymbol{Z}'$ is the projection onto the instrument space. The component $\hat{\mathbf{X}} = \mathbf{P}_{\boldsymbol{Z}} \mathbf{X}$ is the part of $\mathbf{X}$ that the instruments can explain. The residual $\mathbf{M}_{\boldsymbol{Z}} \mathbf{X}$ is the part of $\mathbf{X}$ orthogonal to the instruments.

$\hat{\mathbf{X}}$ lives in $\text{col}(\boldsymbol{Z})$. Since $\boldsymbol{\varepsilon} \perp \text{col}(\boldsymbol{Z})$ (asymptotically, by the exclusion restriction), $\boldsymbol{\varepsilon} \perp \hat{\mathbf{X}}$. The first stage has produced a regressor that is, by construction, orthogonal to the error. The endogeneity has been projected away.

![](econometrics-series/img/Pasted%20image%2020260215161934.png)

The endogenous component has not vanished; it has been isolated into $\mathbf{M}_{\boldsymbol{Z}} \mathbf{X}$, the part of education not explained by proximity to college. This is where ability-driven variation in education lives. Ability affects education but is uncorrelated with proximity to college, so it sits in the residual of the first stage. The first stage discards this contaminated component.

**Second stage: project $\mathbf{y}$ onto $\text{col}(\hat{\mathbf{X}})$.** Since $\hat{\mathbf{X}} \perp \boldsymbol{\varepsilon}$, the OLS projection of $\mathbf{y}$ onto $\text{col}(\hat{\mathbf{X}})$ satisfies the exogeneity condition. No shadow. No bias.

$$\mathbf{P}_{\hat{\mathbf{X}}} \mathbf{y} = \hat{\mathbf{X}} \hat\beta_{2SLS}$$

and $\hat\beta_{2SLS}$ is consistent for $\beta$.

![](econometrics-series/img/Pasted%20image%2020260215161942.png)

### The Composite Geometry

The two projections compose. First project $\mathbf{X}$ onto $\text{col}(\boldsymbol{Z})$ to get $\hat{\mathbf{X}}$, a clean version of $\mathbf{X}$. Then project $\mathbf{y}$ onto $\text{col}(\hat{\mathbf{X}})$, a subspace of $\text{col}(\boldsymbol{Z})$.

The composition projects $\mathbf{y}$ onto a $k$-dimensional subspace within $\text{col}(\boldsymbol{Z})$. Specifically, $\text{col}(\hat{\mathbf{X}}) = \mathbf{P}_{\boldsymbol{Z}}(\text{col}(\mathbf{X}))$: the image of the regressor space under the instrument projection. This is the subspace of $\text{col}(\boldsymbol{Z})$ that is relevant for predicting $\mathbf{X}$.

> **Intuition**: The instrument space $\text{col}(\boldsymbol{Z})$ is an $\ell$-dimensional subspace where the error casts no shadow. The first stage finds the $k$-dimensional slice of this clean space most relevant for $\mathbf{X}$. The second stage projects $\mathbf{y}$ onto that slice. We have restricted the analysis to the shadow-free zone, and inside it we find the best $k$-dimensional approximation.

---

## What Instruments Cannot Do

### Weak Instruments: Relevance Failure

The relevance condition $\mathbb{E}[ZX] \neq 0$ requires that $\mathbf{X}$ has a nontrivial projection onto $\text{col}(\boldsymbol{Z})$. If the instruments are weak ($\boldsymbol{Z}$ is barely correlated with $\mathbf{X}$), then $\hat{\mathbf{X}} = \mathbf{P}_{\boldsymbol{Z}} \mathbf{X}$ is almost zero. The first stage extracts almost no variation from $\mathbf{X}$.

Geometrically, $\mathbf{X}$ is nearly orthogonal to $\text{col}(\boldsymbol{Z})$. The projection $\mathbf{P}_{\boldsymbol{Z}} \mathbf{X}$ is a tiny sliver: the shadow of $\mathbf{X}$ on the instrument plane is nearly zero-length. The second stage then projects $\mathbf{y}$ onto the subspace spanned by that sliver, and tiny perturbations in $\mathbf{y}$ cause $\hat\beta_{2SLS}$ to swing wildly. It is like trying to measure the slope of a surface from a nearly-horizontal shadow: the measurement is well-defined but extremely unstable. The estimator is consistent but has enormous variance, and in finite samples it can be severely biased.

In the economics language, proximity to college barely predicts education, so the exogenous variation we extract is minuscule. We are estimating the return to education using almost no variation, and the estimate is unreliable. In the geometric language, we are projecting onto a nearly-degenerate subspace, which is the same problem as near-multicollinearity, now in the instrument-purified space.

### Exclusion Failure: The Shadow Returns

If $\mathbb{E}[Z\varepsilon] \neq 0$ (the instrument is correlated with the error), then $\boldsymbol{\varepsilon}$ is not orthogonal to $\text{col}(\boldsymbol{Z})$ (asymptotically), and the entire construction collapses. The first stage no longer produces a clean regressor. $\hat{\mathbf{X}} = \mathbf{P}_{\boldsymbol{Z}} \mathbf{X}$ lives in $\text{col}(\boldsymbol{Z})$, but so does a component of $\boldsymbol{\varepsilon}$. The shadow is back, just in a different subspace.

In the economics language, proximity to college affects wages through channels other than education. People near colleges live in richer areas with better labour markets, say. The instrument is "not excluded" from the wage equation. The variation we extract in the first stage is contaminated, and the second stage inherits the contamination.

Geometrically, an invalid instrument changes the direction of the oblique projection without moving it to a shadow-free zone. You have changed which perpendicular you drop from $\mathbf{y}$ to $\text{col}(\mathbf{X})$, but the new perpendicular still passes through a region where $\boldsymbol{\varepsilon}$ has nonzero projection. The bias changes in magnitude, may be larger or smaller than OLS bias, and can even change sign. It does not disappear.

---

## The Hierarchy, Geometrically

The progression from OLS to IV to 2SLS is a story about projection direction.

**OLS**: Project $\mathbf{y}$ onto $\text{col}(\mathbf{X})$, dropping a perpendicular from $\mathbf{y}$ to $\text{col}(\mathbf{X})$. Residual is orthogonal to $\text{col}(\mathbf{X})$. Unbiased if $\varepsilon \perp X$ in the population, which fails under endogeneity.

**IV (just-identified)**: Project $\mathbf{y}$ onto $\text{col}(\mathbf{X})$, but along the direction perpendicular to $\text{col}(\boldsymbol{Z})$ instead. Residual is orthogonal to $\text{col}(\boldsymbol{Z})$. Unbiased (asymptotically) if $\varepsilon \perp Z$, which holds by the exclusion restriction. Oblique projection: same target space, different projection direction.

**2SLS (overidentified)**: First project $\mathbf{X}$ onto $\text{col}(\boldsymbol{Z})$ to extract the clean component $\hat{\mathbf{X}}$. Then project $\mathbf{y}$ onto $\text{col}(\hat{\mathbf{X}}) \subseteq \text{col}(\boldsymbol{Z})$. Both projections are orthogonal. The composition restricts the analysis to the shadow-free zone and finds the best approximation within it.

In every case, the fix for endogeneity is the same geometric move: find a subspace where the error casts no shadow, and work within it. The instrument defines that subspace. Relevance ensures there is enough room in the shadow-free zone to say something about $X$. Exclusion ensures the zone really is shadow-free. The estimator, IV or 2SLS, is the appropriate projection within the clean space.
