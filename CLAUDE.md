# t1mchee.github.io

Tim Chee's personal website. Plain static HTML/CSS served by GitHub Pages — no build step, no static site generator.

## Repo structure

```
├── index.html              # Homepage (About page)
├── writing.html            # Writing index — lists all posts
├── cv.html                 # Embeds TC_CV_310326.pdf in an iframe
├── coursework.html         # Relevant coursework list
├── ceramics.html           # Ceramics photo gallery
├── style.css               # Single shared stylesheet (all pages use this)
├── dot-grid.js             # Interactive dot grid background (all pages)
├── favicon.js / favicon.svg
├── Profile Photo.jpeg      # Original profile photo
├── Profile Photo no background.png  # Current profile photo (used on homepage)
├── TC_CV_310326.pdf        # CV PDF (embedded on cv.html)
├── writing/
│   ├── _template.html      # Template for new posts (copy and fill in)
│   ├── sg-carry-trade.html
│   ├── debate-simulation.html
│   ├── ridge-regression.html
│   ├── econometrics-intro.html
│   └── sg-carry-trade/     # Chart images for the carry trade post
├── ceramics/               # Ceramics gallery images
└── Blog/                   # Source material for blog posts (not displayed)
```

## How pages work

Every page is hand-written HTML. They all share:
- `style.css` for styling (CSS variables defined in `:root`)
- `dot-grid.js` for the interactive background (`<canvas id="dot-grid">` + `<script src="dot-grid.js">`)
- `favicon.js` / `favicon.svg` for the animated favicon
- GoatCounter analytics script before `</body>`
- A consistent `<nav>` with links to: About, Writing, CV, Coursework, Ceramics

Pages in `writing/` use `../` relative paths for shared assets (e.g. `../style.css`, `../dot-grid.js`).

Math rendering uses KaTeX (loaded via CDN in posts that need it). Mermaid diagrams also available via CDN.

## Adding a new blog post

1. Copy `writing/_template.html` → `writing/my-post.html`
2. Replace `POST_TITLE` and `POST_DATE` placeholders
3. Write content between the post-header and closing `</div>`
4. Uncomment KaTeX or Mermaid `<script>` tags if needed
5. For images, create `writing/my-post/` and reference as `<img src="my-post/image.png">`
6. Add an entry to `writing.html` (newest first):
   ```html
   <li>
     <a href="writing/my-post.html" class="post-title">Title</a>
     <span class="post-tag">Essay</span>
     <time class="post-date" datetime="YYYY-MM-DD">Month YYYY</time>
     <p class="post-description">Short description.</p>
   </li>
   ```

## Updating the CV

Replace `TC_CV_*.pdf` in the repo root and update the filename in `cv.html` (appears twice: in the `<iframe src>` and the download `<a href>`).

## Deploying

There is no build step. Push to `main` and GitHub Pages deploys automatically.

```
git add -A && git commit -m "message" && git push
```

The site is live at **https://t1mchee.github.io**.

## Important notes

- The GitHub username is `t1mchee` (with a numeral 1), the repo is `t1mchee.github.io`
- There is a separate repo at `t1mchee/timchee.github.io` — that is NOT this site
- Nav links must be updated on ALL pages when adding a new tab (7+ HTML files)
- GoatCounter dashboard: https://timothychee.goatcounter.com
- Orange accent color: `#D97706`
- Background color: `#F5F0E8` (warm off-white)
