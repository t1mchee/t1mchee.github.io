# Ridge Regression Is (Sort Of) Doing PCA

This post started with a supervision question. (Cambridge Math Part II Math for ML Examples Sheet 1).

Working through the variance of Ridge predictions, I came across the standard result that

$$ \text{Var}(\hat{h}^\lambda(x) \mid X_{1:n}) = \sigma^2 \sum_{j=1}^{d} \frac{d_j , v_j^2}{(d_j + \lambda)^2} $$

where the $d_j$ are eigenvalues of $\Phi^\top \Phi$ and $v = U^\top \varphi(x)$ rotates your feature vector into the eigenbasis. 

In order to prove this, you show each summand is strictly decreasing in $\lambda$ (take the derivative, get $-2d_j v_j^2/(d_j+\lambda)^3 < 0$).

But thinking about this expression afterwards, I thought something about it seemed familiar. 

Those eigenvalues $d_j$ are doing two things. They're the eigenvalues of the Gram matrix $\Phi^\top \Phi$, which means they're also the squared singular values of $\Phi$, which means they're the **principal component variances** of the design matrix. 

The Ridge penalty shrinks coeffecients _along the principal component directions_ (with shrinkage inversely proportional to how much variance each component explains).

This is the connection between Ridge and PCA which was unintuitive to me at least.

## Wait why should these be related?


This is the part I found unintuitive. 
- PCA is unsupervised: it stares at $X$, finds directions of maximum variance, never touches $y$. 
- Ridge is supervised. It _needs_ $y$. The penalty term $\lambda |\beta|_2^2$ is about the coefficients, not the geometry of the features.

So why does a supervised method end up organising its work around a coordinate system defined by an unsupervised decomposition?

It comes down to the fact that Ridge's penalty is isotropic.
- It penalises $|\beta|_2^2$, every direction treated the same but the data aren't. 
- $X$ has directions where it varies a lot and directions where it's nearly constant. 
- An isotropic penalty applied to anisotropic data produces anisotropic shrinkage, and the axes of that anisotropy are the principal components. 
- $X^\top X$ appears in both the Ridge normal equations and the PCA eigendecomposition.

The labels $y$ still matter
- They determine the _size_ of each component's coefficient. 
- But the _pattern_ of shrinkage, which components get crushed and which survive, is entirely determined by the unsupervised structure of $X$. 
- PCA is baked into the problem.

One would think a method that uses labels and a method that ignores them would have nothing structural in common. 

But the penalty term forces the estimator into a coordinate system that the labels never defined, but instead comes purely from the geometry of the features.
- $y$ picks the coefficients
- $X$ picks the axes and the shrinkage schedule. 

I think that division of labour is underappreciated.

## Start With the SVD

We can see this by writing the design matrix $X$ in its singular value decomposition:

$$ X = U D V^\top $$

where $U$ is $n \times p$ with orthonormal columns, $D = \text{diag}(d_1, \ldots, d_p)$ contains the singular values, and $V$ is $p \times p$ orthogonal. 

The columns of $V$ are the principal component directions, and the singular values $d_j$ tell you how much variance each component captures.

The OLS estimator is:

$$ \hat{\beta}^{\text{OLS}} = (X^\top X)^{-1} X^\top y = V D^{-1} U^\top y $$

Now consider what Ridge does. The Ridge estimator at penalty $\lambda$ is:

$$ \hat{\beta}^{\text{Ridge}} = (X^\top X + \lambda I)^{-1} X^\top y = V (D^2 + \lambda I)^{-1} D , U^\top y $$

To see the structure, rewrite both estimators in the principal component basis. 

Now rotate into the PC coordinate system. Define $\theta = V^\top \beta$, the coefficients in the rotated coordinate system aligned with the principal components. 

Then:

$$ \hat{\theta}_j^{\text{OLS}} = \frac{d_j , u_j^\top y}{d_j^2} = \frac{u_j^\top y}{d_j} $$

$$ \hat{\theta}_j^{\text{Ridge}} = \frac{d_j}{d_j^2 + \lambda} , u_j^\top y $$

The ratio between the Ridge and OLS estimates for the $j$-th principal component is:

$$ \frac{\hat{\theta}_j^{\text{Ridge}}}{\hat{\theta}_j^{\text{OLS}}} = \frac{d_j^2}{d_j^2 + \lambda} $$

Ridge regression shrinks each principal component's contribution by a factor of $d_j^2 / (d_j^2 + \lambda)$. 
- Components with large singular values (high-variance directions) barely get touched. 
- Components with small singular values (low-variance directions) get crushed toward zero.


## PCA Regression Is Just the Limiting Case

Now consider what happens if, instead of Ridge, you do _Principal Component Regression_ (PCR): keep only the top $k$ principal components and run OLS in that subspace. 

The shrinkage factor for PCR is:

$$ \frac{\hat{\theta}_j^{\text{PCR}}}{\hat{\theta}_j^{\text{OLS}}} = \begin{cases} 1 & \text{if } j \leq k \\ 0 & \text{if } j > k \end{cases} $$

This is a hard threshold. You either keep a component completely or kill it entirely.

Ridge, by contrast, is a continuous relaxation of PCR as it applies a _smooth_ shrinkage. 
- It's doing the same thing PCA regression does (downweighting low-variance directions) but continuously rather than discretely.
- They live in the same coordinate system and do the same kind of thing; they just disagree about whether the transition from "keep" to "drop" should be smooth or abrupt.

Graphically:

![[shrinkage-factors.png]]
## Why do we care in practice

A few practical considerations follow from this:

1. Ridge is more stable under tuning than PCR. 
	
	- Nudge $\lambda$ and the shrinkage factors move continuously. 
	- Nudge $k$ by 1 in PCR and you've suddenly included or excluded an entire direction (gets noisy when adjacent singular values are similar).
	
2. Ridge can also win when signal hides in low-variance directions. 
	- PCA ranks components by variance in $X$, which has nothing to do with predictive relevance for $y$. 
	- If the outcome loads on a small component (not unusual in economics when you have many correlated features) PCR drops it entirely. 
	- Ridge shrinks it but keeps it alive.
	
3. The effective degrees of freedom make the connection explicit:
	$$ \text{df}(\lambda) = \sum_{j=1}^{p} \frac{d_j^2}{d_j^2 + \lambda} $$

	- which is just the sum of the shrinkage factors. 
	- For PCR, $\text{df} = k$. 
	- Ridge smoothly dials model complexity between $p$ and $0$.

## The Bayesian Angle

There's also a satisfying Bayesian interpretation. 

Ridge corresponds to a Gaussian prior $\beta \sim \mathcal{N}(0, \tau^2 I)$ on the coefficients, where $\lambda = \sigma^2 / \tau^2$. 
- This prior is isotropic (treats all directions equally).

But in the principal component basis, the _likelihood_ is not isotropic.
- High-variance directions in $X$ carry more Fisher information than low-variance ones (large $d_j$)
- Data is is less informative about low-variance directions (small $d_j$)

The posterior combines isotropic prior with anisotropic likelihood, and the result is exactly the differential shrinkage we derived: Components where the data speak loudly ($d_j^2 \gg \lambda$) are barely regularised; components where the prior dominates ($d_j^2 \ll \lambda$) get pulled to zero.

If you instead put a prior that's _aligned with the principal components_ (say $\theta_j \sim \mathcal{N}(0, d_j^2 \tau^2)$, giving more prior variance to high-variance directions) you'd get different shrinkage. 

The point is that Ridge's implicit inductive bias is to shrink along principal components, weighted by inverse variance.


## So What?

This result might be completely trivial/obvious to many of you, but it has changed how I think about both methods. 

- More than just "OLS with a penalty", Ridge is smooth, variance-aware dimensionality reduction that operates in the same coordinate system as PCA. 

- PCA regression isn't just "reduce dimensions, then regress." It's the hard-thresholding limit of a continuum of shrinkage estimators.

In choosing between Ridge and PCR, what you're doing isn't choosing between fundamentally different philosophies. You are choosing between a smooth curve and a step function over the same set of principal components.

## Appendix: Three nice pieces of intuition that I didn't have time to incorporate


1. **Spectral Link:** If you think of OLS as an operator $X^\dagger$, Ridge is a **spectral regularization** of that operator. 
	- In functional analysis, this is similar to Tikhonov regularization. 
	- You are essentially replacing the singular values $\frac{1}{d_j}$ with a "damped" version $\frac{d_j}{d_j^2 + \lambda}$ to prevent the operator from blowing up when $d_j$ is near zero.
    
2. **The Rotational Invariance:** The Ridge penalty $|\beta|_2^2$ is isotropic. 
	- A key property of the $L_2$ norm is that it is **rotationally invariant**. 
	- Because the penalty doesn't care about the coordinate system, the data ($X$) is free to dictate the "natural" coordinate system via its own covariance structure. 
	- This is why the PCA basis (the SVD) emerges so naturally from the math.
    
3. **Signal-to-Noise Intuition:** 
	- In the variance formula $\text{Var} \propto \frac{d_j}{(d_j^2 + \lambda)^2}$, you can see that Ridge specifically protects you where OLS is most vulnerable. 
	- In OLS, as $d_j \to 0$, the variance explodes like $1/d_j^2$. Ridge caps this explosion.