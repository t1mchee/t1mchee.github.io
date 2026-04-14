(() => {
  "use strict";

  const PARTS = [
    { file: "01-introduction.md", label: "1. Introduction" },
    { file: "02-ols-as-projection.md", label: "2. OLS as projection" },
    { file: "03-lifting-to-l2.md", label: "3. Lifting to L² (inner products)" },
    { file: "04-three-classic-results.md", label: "4. Three classic results" },
    { file: "05-inference-and-diagnostics.md", label: "5. Inference & diagnostics" },
    { file: "06-gmm.md", label: "6. GMM" },
    { file: "07-asymptotic-theory.md", label: "7. Asymptotic theory" },
    { file: "08-promise-of-blue.md", label: "8. The promise of BLUE" },
    { file: "09-bias.md", label: "9. Bias" },
    { file: "10-iv-2sls.md", label: "10. IV & 2SLS" },
    { file: "11-efficiency-gls.md", label: "11. Efficiency & GLS" },
    { file: "12-why-blue.md", label: "12. Why BLUE" }
  ];

  const navList = document.getElementById("series-nav-list");
  const article = document.getElementById("series-article");
  const loading = document.getElementById("series-loading");
  const errBox = document.getElementById("series-error");

  let navLinks = [];

  function setActive(index) {
    navLinks.forEach((a, i) => {
      a.classList.toggle("active", i === index);
    });
  }

  function renderMath() {
    if (typeof renderMathInElement === "undefined") {
      return;
    }
    renderMathInElement(article, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ],
      throwOnError: false
    });
  }

  async function loadPart(index) {
    const i = Math.min(Math.max(index, 0), PARTS.length - 1);
    const part = PARTS[i];
    loading.classList.remove("hidden");
    errBox.textContent = "";
    errBox.classList.add("hidden");
    article.innerHTML = "";

    const url = `econometrics-series/parts/${part.file}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Could not load ${part.file} (${res.status})`);
      }
      const md = await res.text();
      article.innerHTML = marked.parse(md);
      setActive(i);
      renderMath();
      article.scrollTop = 0;
      window.scrollTo(0, 0);
    } catch (e) {
      errBox.textContent = e.message || String(e);
      errBox.classList.remove("hidden");
    } finally {
      loading.classList.add("hidden");
    }
  }

  function initNav() {
    PARTS.forEach((p, i) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = p.label;
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("part", String(i + 1));
        window.history.replaceState(null, "", nextUrl.toString());
        loadPart(i);
      });
      li.appendChild(a);
      navList.appendChild(li);
      navLinks.push(a);
    });
  }

  function readInitialIndex() {
    const params = new URLSearchParams(window.location.search);
    const raw = parseInt(params.get("part") || "1", 10);
    if (Number.isNaN(raw)) {
      return 0;
    }
    return Math.min(Math.max(raw - 1, 0), PARTS.length - 1);
  }

  marked.setOptions({ gfm: true, breaks: false });
  initNav();
  loadPart(readInitialIndex());
})();
