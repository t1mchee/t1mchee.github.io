# Three Classic Results, Geometrically

## 8. The Law of Iterated Expectations as Tower Property

If $\mathcal{G}_1 \subseteq \mathcal{G}_2$, then $L^2(\mathcal{G}_1) \subseteq L^2(\mathcal{G}_2)$, and:

$$\mathbb{E}[\mathbb{E}[Y|\mathcal{G}_2]|\mathcal{G}_1] = \mathbb{E}[Y|\mathcal{G}_1]$$

In projection language: if $V_1 \subseteq V_2$ are subspaces and $P_1, P_2$ are the corresponding projection operators, then:

$$P_1 P_2 = P_1$$

Projecting onto a big subspace and then a smaller one is the same as projecting directly onto the smaller one. This is the **tower property** of orthogonal projections, and it is equivalent to the law of iterated expectations.

> **Intuition**: If you first summarise $Y$ using more information ($\mathcal{G}_2$), then summarise that using less information ($\mathcal{G}_1$), you get the same thing as summarising $Y$ directly using less information.

The geometry reveals something the probability notation hides. $P_1 P_2 = P_1$ but $P_2 P_1 \neq P_1$ in general. Projecting first onto the coarse subspace $V_1$ and then onto the finer $V_2$ does not recover $P_2 Y$. Translated back, conditioning on a coarse $\sigma$-algebra first and then refining does not give the fine conditional expectation back. Once you project information away, no subsequent projection onto a finer subspace can recover what you lost.

The tower property has a direction, and the direction is toward less information, never more. The probability statement $\mathbb{E}[\mathbb{E}[Y|\mathcal{G}_2]|\mathcal{G}_1] = \mathbb{E}[Y|\mathcal{G}_1]$ doesn't obviously contain this asymmetry. The geometry makes it jump out.

---

## 9. $\mathbb{E}[X\varepsilon]$ as Misalignment: Endogeneity and OVB

The inner product $\mathbb{E}[X\varepsilon] = \langle X, \varepsilon \rangle$ measures the alignment between regressor and error. In the true model:

$$\mathbb{E}[X\varepsilon] = 0$$

When this fails (endogeneity), $\varepsilon$ has a nonzero component along $X$; it is not orthogonal to the regressor space. The OLS estimator is biased because the projection onto $\text{col}(\mathbf{X})$ absorbs the part of $\varepsilon$ that is not actually orthogonal to it.

If $Y = X'\beta + W'\gamma + u$ with $\mathbb{E}[Xu] = 0$ but we regress $Y$ on $X$ alone:

$$\hat\beta \xrightarrow{p} \beta + \underbrace{(\mathbb{E}[XX'])^{-1}\mathbb{E}[XW']}_{\text{projection coefficient of } W \text{ on } X}\gamma$$

The bias term is the projection coefficient of the omitted variable onto the included regressor, scaled by the effect of the omitted variable. Pure linear algebra: decompose $W$ into its component along $X$ and its orthogonal complement. OLS scoops up the along-$X$ component and attributes it to $\beta$.

**Worked example, continued.** Return to the $3 \times 2$ example with $\mathbf{X}$, $\mathbf{x}_1 = (1,0,1)$, $\mathbf{x}_2 = (0,1,1)$. Suppose the true data-generating process actually has a third regressor $\mathbf{w} = (1, 1, 0)$ with coefficient $\gamma = 1$, so:

$$\mathbf{y}_{\text{true}} = \mathbf{X} \begin{pmatrix} 2 \\ 1 \end{pmatrix} + \mathbf{w} \cdot 1 = (2, 0, 2) + (0, 1, 1) + (1, 1, 0) = (3, 2, 3)$$

Note $\mathbf{w}$ is not in $\text{col}(\mathbf{X})$ (third coordinate is 0, but first+second = 2).

Regress $\mathbf{y}_{\text{true}}$ on $\mathbf{X}$ alone, omitting $\mathbf{w}$:

$$\mathbf{X}'\mathbf{y}_{\text{true}} = (6, 5), \qquad \hat\beta = \frac{1}{3}\begin{pmatrix} 2 & -1 \\ -1 & 2 \end{pmatrix}\begin{pmatrix} 6 \\ 5 \end{pmatrix} = \begin{pmatrix} 7/3 \\ 4/3 \end{pmatrix}$$

True $\beta = (2, 1)$. Bias is $\hat\beta - \beta = (1/3, 1/3)$.

Now check the OVB formula. It predicts bias $= (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\mathbf{w} \cdot \gamma$:

$$\mathbf{X}'\mathbf{w} = (1, 1), \qquad (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\mathbf{w} = \frac{1}{3}\begin{pmatrix} 2 & -1 \\ -1 & 2 \end{pmatrix}\begin{pmatrix} 1 \\ 1 \end{pmatrix} = \begin{pmatrix} 1/3 \\ 1/3 \end{pmatrix}$$

Times $\gamma = 1$: predicted bias $(1/3, 1/3)$. Matches the direct computation.

Geometrically, $(\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\mathbf{w}$ is the coordinate representation of $\mathbf{w}$'s shadow on $\text{col}(\mathbf{X})$, written in the $(\mathbf{x}_1, \mathbf{x}_2)$ basis. The shadow points to $(1/3, 1/3)$, meaning $\mathbf{w}$'s component inside the plane is $\frac{1}{3}\mathbf{x}_1 + \frac{1}{3}\mathbf{x}_2$. When $\mathbf{w}$'s contribution to $\mathbf{y}$ is missing from the regression, that shadow gets absorbed by $\hat\beta$ and scaled by $\gamma$. Bias is the shadow of $\mathbf{w}\gamma$ on $\text{col}(\mathbf{X})$, and the formula is reading off the coordinates of that shadow.

Notice that the bias has a direction. Both $\hat\beta_1$ and $\hat\beta_2$ are pulled up by $1/3$ because $\mathbf{w}$'s shadow has equal components along $\mathbf{x}_1$ and $\mathbf{x}_2$. A different $\mathbf{w}$, more aligned with $\mathbf{x}_1$ than $\mathbf{x}_2$, would bias $\hat\beta_1$ more than $\hat\beta_2$. OVB is a vector pointing along whichever regressors the omitted variable correlates with most strongly. The textbook habit of reporting "the bias on the education coefficient" is a one-coordinate slice of a higher-dimensional pull on the whole vector $\hat\beta$.

---

## 10. The Frisch-Waugh-Lovell Theorem: Iterated Projections

Partition the data matrix $\mathbf{X} = [\mathbf{X}_1 \mid \mathbf{X}_2]$. FWL says: the coefficient on $\mathbf{X}_1$ from regressing $\mathbf{y}$ on $[\mathbf{X}_1 \mid \mathbf{X}_2]$ equals the coefficient from regressing $\mathbf{M}_2 \mathbf{y}$ on $\mathbf{M}_2 \mathbf{X}_1$, where $\mathbf{M}_2 = \mathbf{I} - \mathbf{X}_2(\mathbf{X}_2'\mathbf{X}_2)^{-1}\mathbf{X}_2'$ is the annihilator (residual-maker) matrix.

**Geometric content**: To find the marginal effect of $\mathbf{X}_1$, first remove from both $\mathbf{y}$ and $\mathbf{X}_1$ everything that can be explained by $\mathbf{X}_2$ (project onto the orthogonal complement of the $\mathbf{X}_2$ subspace), then regress. This is partialling out: working in the subspace orthogonal to the controls.

> **Intuition**: Suppose you want to know how much height predicts basketball ability, controlling for age. FWL says: first strip age out of both height and basketball ability by regressing each on age and keeping the residuals. The residuals are "age-adjusted height" and "age-adjusted ability". Regress one on the other and you have the partial effect of height controlling for age. Geometrically, you have moved the problem into the subspace orthogonal to age. Think of it as flattening a tilted room so the remaining measurement happens on a level floor. Age is no longer around to contaminate the answer.

A less obvious payoff: the residualised variables live in a lower-dimensional space. The annihilator $\mathbf{M}_2$ kills the $k_2$-dimensional subspace spanned by the controls, so its image is $(n - k_2)$-dimensional. FWL is therefore also a dimension reduction: partialling out is equivalent to working in a smaller ambient space where the controls are built in. The degrees-of-freedom correction in the second-stage regression reflects this shrinkage.

The population analogue:

$$\beta_1^* = \frac{\mathbb{E}[\tilde X_1 \tilde Y]}{\mathbb{E}[\tilde X_1^2]}$$

where $\tilde X_1 = X_1 - \mathbb{E}[X_1 | X_2]$ and $\tilde Y = Y - \mathbb{E}[Y|X_2]$ (using linear projections). The inner product of the residualised variables, normalised by the squared norm of the residualised regressor.
