# OLS as Projection in $\mathbb{R}^n$

The insight that runs through this chapter is that **expectations behave like inner products**, and **conditional expectations behave like projections**. The correspondence is a formal isomorphism, and it makes Hilbert space geometry available to probability theory.

We build up to that by starting somewhere economists can draw. OLS is a picture in $\mathbb{R}^n$. The picture lifts cleanly to the infinite-dimensional space of random variables once we have the moves. So we draw it first, then lift it.

---

## 1. OLS as Projection in $\mathbb{R}^n$

Stack the $n$ observations into a column vector $\mathbf{y} \in \mathbb{R}^n$ and an $n \times k$ data matrix $\mathbf{X}$ whose rows are the regressor values for each observation. Each coordinate axis of $\mathbb{R}^n$ corresponds to one observation. The outcome vector $\mathbf{y}$ is a point in this $n$-dimensional space.

OLS picks the $\hat\beta \in \mathbb{R}^k$ that minimises the sum of squared residuals:

$$\hat\beta = \arg\min_\beta \| \mathbf{y} - \mathbf{X}\beta \|^2$$

The set of all possible fitted values $\{\mathbf{X}\beta : \beta \in \mathbb{R}^k\}$ is the **column space** $\text{col}(\mathbf{X})$: the $k$-dimensional subspace of $\mathbb{R}^n$ spanned by the columns of $\mathbf{X}$. OLS finds the point in this subspace closest to $\mathbf{y}$.

> **Intuition**: Imagine $\mathbf{y}$ as a point floating above the plane $\text{col}(\mathbf{X})$. The closest point on the plane to $\mathbf{y}$ is the foot of the perpendicular dropped from $\mathbf{y}$. Everything that follows is a variation on this drawing.

The foot of the perpendicular is the **orthogonal projection** of $\mathbf{y}$ onto $\text{col}(\mathbf{X})$:

$$\hat{\mathbf{y}} = \mathbf{P_X} \mathbf{y}, \qquad \mathbf{P_X} = \mathbf{X}(\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'$$

Setting $\hat{\mathbf{y}} = \mathbf{X}\hat\beta$ and solving gives $\hat\beta = (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\mathbf{y}$, the OLS formula.

The residual $\mathbf{e} = \mathbf{y} - \hat{\mathbf{y}}$ is the part of $\mathbf{y}$ orthogonal to $\text{col}(\mathbf{X})$. Expressed as a condition: $\mathbf{X}'\mathbf{e} = \mathbf{0}$. These are the **normal equations**, and they are orthogonality conditions in $\mathbb{R}^n$. Each column of $\mathbf{X}$ has zero inner product with $\mathbf{e}$.

---

## 2. Pythagoras in the Sample

The Euclidean inner product on $\mathbb{R}^n$ is $\langle \mathbf{u}, \mathbf{v} \rangle = \mathbf{u}'\mathbf{v} = \sum_i u_i v_i$. The norm is $\|\mathbf{u}\| = \sqrt{\mathbf{u}'\mathbf{u}}$. Because $\hat{\mathbf{y}} \perp \mathbf{e}$, the Pythagorean theorem holds:

$$\|\mathbf{y}\|^2 = \|\hat{\mathbf{y}}\|^2 + \|\mathbf{e}\|^2$$

This is the variance decomposition in the sample: total sum of squares = explained + residual. It is also the source of $R^2$, which we revisit in a later post.

Two observations to carry forward. First, the normal equation $\mathbf{X}'\mathbf{e} = \mathbf{0}$ is literally an inner product statement: residual is perpendicular to every regressor. Second, the squared-error loss function is squared-distance, so minimising it is equivalent to finding the closest point, which is equivalent to orthogonal projection. Least squares, projection, and orthogonality are three names for the same move.

---

## A Worked $3 \times 2$ Example

The machinery is easier to trust after computing it once by hand. Take the smallest case that shows all the moving parts.

Let $n = 3$ observations and $k = 2$ regressors:

$$\mathbf{X} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \\ 1 & 1 \end{pmatrix}, \qquad \mathbf{y} = \begin{pmatrix} 3 \\ 2 \\ 2 \end{pmatrix}$$

Each axis of $\mathbb{R}^3$ is one observation. $\mathbf{y}$ is a single point in $\mathbb{R}^3$. The columns of $\mathbf{X}$ are vectors $\mathbf{x}_1 = (1, 0, 1)$ and $\mathbf{x}_2 = (0, 1, 1)$, and $\text{col}(\mathbf{X})$ is the 2D plane through the origin that they span.

**Compute $\hat\beta$.**

$$\mathbf{X}'\mathbf{X} = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}, \qquad (\mathbf{X}'\mathbf{X})^{-1} = \frac{1}{3}\begin{pmatrix} 2 & -1 \\ -1 & 2 \end{pmatrix}$$

$$\mathbf{X}'\mathbf{y} = \begin{pmatrix} 5 \\ 4 \end{pmatrix}, \qquad \hat\beta = (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\mathbf{y} = \frac{1}{3}\begin{pmatrix} 6 \\ 3 \end{pmatrix} = \begin{pmatrix} 2 \\ 1 \end{pmatrix}$$

**Compute $\hat{\mathbf{y}}$ and $\mathbf{e}$.**

$$\hat{\mathbf{y}} = \mathbf{X}\hat\beta = \begin{pmatrix} 2 \\ 1 \\ 3 \end{pmatrix}, \qquad \mathbf{e} = \mathbf{y} - \hat{\mathbf{y}} = \begin{pmatrix} 1 \\ 1 \\ -1 \end{pmatrix}$$

**Verify orthogonality.** The normal equation says $\mathbf{X}'\mathbf{e} = \mathbf{0}$. Directly:

$$\mathbf{X}'\mathbf{e} = \begin{pmatrix} 1 \cdot 1 + 0 \cdot 1 + 1 \cdot (-1) \\ 0 \cdot 1 + 1 \cdot 1 + 1 \cdot (-1) \end{pmatrix} = \begin{pmatrix} 0 \\ 0 \end{pmatrix} \checkmark$$

The residual vector has zero inner product with each regressor column. Geometrically, $\mathbf{e} = (1, 1, -1)$ is perpendicular to both $\mathbf{x}_1 = (1, 0, 1)$ and $\mathbf{x}_2 = (0, 1, 1)$, so it is perpendicular to the entire plane they span.

**Verify Pythagoras.**

$$\|\mathbf{y}\|^2 = 9 + 4 + 4 = 17$$
$$\|\hat{\mathbf{y}}\|^2 = 4 + 1 + 9 = 14$$
$$\|\mathbf{e}\|^2 = 1 + 1 + 1 = 3$$

$14 + 3 = 17 \checkmark$. Total squared length decomposes exactly into explained plus residual.

**The picture.** $\mathbf{y} = (3, 2, 2)$ is a point in $\mathbb{R}^3$. $\text{col}(\mathbf{X})$ is a plane containing the origin, $\mathbf{x}_1$, and $\mathbf{x}_2$. $\hat{\mathbf{y}} = (2, 1, 3)$ sits inside that plane. The arrow from $\hat{\mathbf{y}}$ to $\mathbf{y}$ is $\mathbf{e}$, and it points perpendicular to the plane. Every equation above is a coordinate version of that drawing.

**$R^2$ here.** $R^2 = \|\hat{\mathbf{y}}\|^2 / \|\mathbf{y}\|^2 = 14/17 \approx 0.82$, uncentred. 82% of $\mathbf{y}$'s length sits inside $\text{col}(\mathbf{X})$; 18% sticks out perpendicular to it. Equivalently, $\cos^2\theta = 0.82$ where $\theta$ is the angle between $\mathbf{y}$ and its projection onto the plane.

The example comes back when we discuss OVB in a later post. The same $\mathbf{X}$, with a deliberately-omitted third regressor, reproduces the OVB formula from direct computation and from the projection argument. Hold the numbers $\hat\beta = (2, 1)$, $\mathbf{e} = (1, 1, -1)$, and the plane $\text{col}(\mathbf{X})$ in your head.
