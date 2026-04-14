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

  /**
   * marked.js interprets underscores as emphasis; that breaks LaTeX subscripts
   * inside $...$ and $$...$$. Strip math to opaque tokens before Markdown, restore after.
   */
  function protectMathDelimiters(md) {
    const store = [];
    const token = (kind, id) => `MATH${kind}${id}MATHEND`;

    let s = md.replace(/\$\$([\s\S]*?)\$\$/g, (_, body) => {
      const id = store.length;
      store.push(`$$${body}$$`);
      return token("D", id);
    });

    let out = "";
    for (let i = 0; i < s.length; i += 1) {
      const ch = s[i];
      if (ch === "$" && s[i + 1] === "$") {
        out += "$$";
        i += 1;
        continue;
      }
      if (ch === "$") {
        if (i > 0 && s[i - 1] === "\\") {
          out += ch;
          continue;
        }
        const j = s.indexOf("$", i + 1);
        if (j === -1) {
          out += ch;
          continue;
        }
        const id = store.length;
        store.push(s.slice(i, j + 1));
        out += token("I", id);
        i = j;
        continue;
      }
      out += ch;
    }

    return { text: out, store };
  }

  function restoreMathDelimiters(html, store) {
    return html.replace(/MATH(D|I)(\d+)MATHEND/g, (_, kind, idStr) => {
      const id = Number(idStr);
      return store[id] !== undefined ? store[id] : "";
    });
  }

  function setActive(index) {
    navLinks.forEach((a, i) => {
      a.classList.toggle("active", i === index);
    });
  }

  function isExampleHeading(el) {
    if (!el || (el.tagName !== "H2" && el.tagName !== "H3")) {
      return false;
    }
    const t = el.textContent.trim();
    if (!/\bexample\b/i.test(t)) {
      return false;
    }
    return /\bworked\b/i.test(t) || /^a\s+worked/i.test(t);
  }

  /**
   * Move nodes following `details` into `inner` until the next section boundary.
   * @param {HTMLElement} details
   * @param {HTMLElement} inner
   * @param {"H2"|"H3"|null} startTagName  null = paragraph-started example (stop at any h2/h3/hr)
   */
  function moveExampleFollowingSiblings(details, inner, startTagName) {
    const startLevel = startTagName === "H2" ? 2 : startTagName === "H3" ? 3 : 0;
    let n = details.nextSibling;
    while (n) {
      if (n.nodeType !== Node.ELEMENT_NODE) {
        const next = n.nextSibling;
        inner.appendChild(n);
        n = next;
        continue;
      }
      const tag = n.tagName;
      if (tag === "HR" || tag === "H1") {
        break;
      }
      if (startLevel === 0) {
        if (tag === "H2" || tag === "H3") {
          break;
        }
      } else {
        if (tag === "H2") {
          break;
        }
        if (tag === "H3" && startLevel === 3) {
          break;
        }
      }
      const next = n.nextSibling;
      inner.appendChild(n);
      n = next;
    }
  }

  function buildExampleDetails() {
    const details = document.createElement("details");
    details.className = "series-callout series-callout--example";
    details.open = true;
    const summary = document.createElement("summary");
    summary.className = "series-example-summary";
    const inner = document.createElement("div");
    inner.className = "series-example-body";
    details.appendChild(summary);
    details.appendChild(inner);
    return { details, summary, inner };
  }

  function decorateSeriesArticle(root) {
    root.querySelectorAll("blockquote").forEach((bq) => {
      const strong = bq.querySelector("p:first-child > strong:first-child");
      if (strong && /^Intuition$/i.test(strong.textContent.trim())) {
        bq.classList.add("series-callout", "series-callout--intuition");
      }
    });

    [...root.querySelectorAll("h2, h3")].forEach((h) => {
      if (!isExampleHeading(h) || h.closest(".series-callout--example")) {
        return;
      }
      const { details, summary, inner } = buildExampleDetails();
      h.replaceWith(details);
      summary.appendChild(h);
      moveExampleFollowingSiblings(details, inner, h.tagName);
    });

    [...root.querySelectorAll("p")].forEach((p) => {
      if (p.closest(".series-callout--example")) {
        return;
      }
      const strong = p.querySelector("strong:first-child");
      if (!strong) {
        return;
      }
      if (!/^worked example/i.test(strong.textContent.trim())) {
        return;
      }
      const { details, summary, inner } = buildExampleDetails();
      p.replaceWith(details);
      summary.appendChild(p);
      moveExampleFollowingSiblings(details, inner, null);
    });
  }

  function renderMath() {
    if (typeof renderMathInElement === "undefined") {
      return;
    }
    renderMathInElement(article, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false,
      strict: false
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
      const { text: mdSafe, store } = protectMathDelimiters(md);
      article.innerHTML = restoreMathDelimiters(marked.parse(mdSafe), store);
      decorateSeriesArticle(article);
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
