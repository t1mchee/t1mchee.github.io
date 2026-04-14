/**
 * One-off / local build: copy Econometrics sandbox markdown + Tripos images
 * into writing/econometrics-series/. Run from repo root:
 *   node scripts/build-econometrics-series.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const SANDBOX = "/Users/Tim/Documents/Tim/Projects/Blog/Econometrics Intuition Series Sandbox";
const IMAGES_SRC = "/Users/Tim/Documents/Tim/Tripos/Images";

const SERIES_DIR = path.join(REPO_ROOT, "writing", "econometrics-series");
const PARTS_DIR = path.join(SERIES_DIR, "parts");
const IMG_DIR = path.join(SERIES_DIR, "img");

const PART_FILES = [
  ["01-introduction.md", "01. Introduction.md"],
  ["02-ols-as-projection.md", "02. OLS as Projection.md"],
  ["03-lifting-to-l2.md", "03. Lifting to L2 - Expectations as Inner Products.md"],
  ["04-three-classic-results.md", "04. Three Classic Results - Tower, OVB, FWL.md"],
  ["05-inference-and-diagnostics.md", "05. Inference and Diagnostics.md"],
  ["06-gmm.md", "06. GMM.md"],
  ["07-asymptotic-theory.md", "07. Asymptotic Theory.md"],
  ["08-promise-of-blue.md", "08. The Promise of BLUE.md"],
  ["09-bias.md", "09. Bias and the Four Ways It Arises.md"],
  ["10-iv-2sls.md", "10. Instrumental Variables and 2SLS.md"],
  ["11-efficiency-gls.md", "11. Efficiency and GLS.md"],
  ["12-why-blue.md", "12. Why These Assumptions Give You BLUE.md"]
];

function processMarkdown(md) {
  return md.replace(
    /!\[\[([^\]]+)\]\]/g,
    (_, name) => `![](econometrics-series/img/${encodeURI(name)})`
  );
}

function main() {
  if (!fs.existsSync(SANDBOX)) {
    console.error("Sandbox not found:", SANDBOX);
    process.exit(1);
  }
  if (!fs.existsSync(IMAGES_SRC)) {
    console.error("Images dir not found:", IMAGES_SRC);
    process.exit(1);
  }

  fs.mkdirSync(PARTS_DIR, { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });

  const imageNames = new Set();
  for (const [, srcName] of PART_FILES) {
    const raw = fs.readFileSync(path.join(SANDBOX, srcName), "utf8");
    const matches = [...raw.matchAll(/!\[\[([^\]]+)\]\]/g)];
    for (const m of matches) {
      imageNames.add(m[1]);
    }
  }

  for (const name of imageNames) {
    const from = path.join(IMAGES_SRC, name);
    const to = path.join(IMG_DIR, name);
    if (!fs.existsSync(from)) {
      console.warn("Missing image (skipped):", name);
      continue;
    }
    fs.copyFileSync(from, to);
    console.log("Copied image:", name);
  }

  for (const [destName, srcName] of PART_FILES) {
    const srcPath = path.join(SANDBOX, srcName);
    const outPath = path.join(PARTS_DIR, destName);
    const md = fs.readFileSync(srcPath, "utf8");
    fs.writeFileSync(outPath, processMarkdown(md), "utf8");
    console.log("Wrote part:", destName);
  }

  console.log("Done.");
}

main();
