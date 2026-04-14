Here is a fact that should bother you. Run a regression of wages on education and experience. Now add a column of pure noise: numbers from a random number generator with no relationship to anything. $R^2$ goes up. It always goes up. Why?

Here is another. You can prove that OLS minimises the sum of squared residuals. Separately, you can prove that OLS has the smallest variance among linear unbiased estimators. These are two different optimisation problems. One is about fitting data in a single sample. The other is about dispersion across hypothetical repetitions. There is no obvious reason they should have the same answer. Under certain conditions they do. What are those conditions, and what connects fitting well to estimating precisely?

Both questions have the same answer, and the answer is a picture. OLS is an orthogonal projection. Once you see that, every result in the econometrics canon (Gauss-Markov, FWL, OVB, 2SLS, GLS, GMM) becomes a variation on one drawing.

---

Econometrics is taught to economics undergraduates anecdotally, anchored to real-life examples. Much of the foundational intuition economists carry stems from that.

1. OLS is introduced as "the line that minimises squared residuals" rather than the orthogonal projection of $y$ onto $\text{col}(X)$.
2. Gauss-Markov is stated as a checklist of assumptions rather than a property of projections.
3. Mostly Harmless Econometrics (Angrist & Pischke) anchors endogeneity (OVB) on "people who go to college earn more, but they're also smarter, richer, and more motivated".
4. Woolridge (the other Econometrics Bible) illustrates:
	- Heteroskedasticity as "the variance of wages fans out with education level".
	- Multicollinearity as "experience and tenure move together because people who've worked longer at one firm have also worked longer overall".
	- Police spending and crime rates for simultaneity.

My friends over at the DPMMS and the engineering department were taught the same material grounded in linear algebra instead. The difference is probably that the average economist isn't very good at linear algebra. It cuts both ways: mathematicians and info engineers could use more data intuition.

Having relearnt it that way, the geometric picture gives a cleaner handle on the econometric concepts we pick up anecdotally. This series develops that picture for other new economists.

![](econometrics-series/img/Pasted%20image%2020260215151424.png)