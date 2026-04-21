(() => {
  "use strict";

  const EDITOR_PASSWORD_SHA256 = "ac31e044fb0cccba680ccea5d2a60d4e347d2d9119734c7f74bcdb52d32a435d";

  const state = {
    owner: "t1mchee",
    repo: "t1mchee.github.io",
    branch: "main",
    token: "",
    writingIndex: "",
    ceramicsIndex: "",
    posts: [],
    ceramics: [],
    loadedPostSlug: "",
    loadedCeramicId: "",
    loadedPostIsEditorManaged: false,
    loadedPostRawHtml: "",
    loadedCeramicSourceImage: ""
  };

  const el = {
    lockScreen: document.getElementById("lock-screen"),
    app: document.getElementById("editor-app"),
    password: document.getElementById("editor-password"),
    unlockBtn: document.getElementById("unlock-btn"),
    lockStatus: document.getElementById("lock-status"),

    owner: document.getElementById("gh-owner"),
    repo: document.getElementById("gh-repo"),
    branch: document.getElementById("gh-branch"),
    token: document.getElementById("gh-token"),
    connectBtn: document.getElementById("connect-btn"),
    refreshBtn: document.getElementById("refresh-btn"),
    gitStatus: document.getElementById("git-status"),

    postSlug: document.getElementById("post-slug"),
    postTitle: document.getElementById("post-title"),
    postTag: document.getElementById("post-tag"),
    postDateIso: document.getElementById("post-date-iso"),
    postDateDisplay: document.getElementById("post-date-display"),
    postDescription: document.getElementById("post-description"),
    postMarkdown: document.getElementById("post-markdown"),
    publishPostBtn: document.getElementById("publish-post-btn"),
    postStatus: document.getElementById("post-status"),

    editPostSelect: document.getElementById("edit-post-select"),
    editPostTitle: document.getElementById("edit-post-title"),
    editPostTag: document.getElementById("edit-post-tag"),
    editPostDateIso: document.getElementById("edit-post-date-iso"),
    editPostDateDisplay: document.getElementById("edit-post-date-display"),
    editPostDescription: document.getElementById("edit-post-description"),
    editPostMarkdown: document.getElementById("edit-post-markdown"),
    loadPostBtn: document.getElementById("load-post-btn"),
    savePostBtn: document.getElementById("save-post-btn"),
    editPostStatus: document.getElementById("edit-post-status"),

    ceramicId: document.getElementById("ceramic-id"),
    ceramicTitle: document.getElementById("ceramic-title"),
    ceramicAlt: document.getElementById("ceramic-alt"),
    ceramicMeta: document.getElementById("ceramic-meta"),
    ceramicDescription: document.getElementById("ceramic-description"),
    ceramicImage: document.getElementById("ceramic-image"),
    publishCeramicBtn: document.getElementById("publish-ceramic-btn"),
    ceramicStatus: document.getElementById("ceramic-status"),

    editCeramicSelect: document.getElementById("edit-ceramic-select"),
    editCeramicTitle: document.getElementById("edit-ceramic-title"),
    editCeramicAlt: document.getElementById("edit-ceramic-alt"),
    editCeramicMeta: document.getElementById("edit-ceramic-meta"),
    editCeramicDescription: document.getElementById("edit-ceramic-description"),
    editCeramicImage: document.getElementById("edit-ceramic-image"),
    loadCeramicBtn: document.getElementById("load-ceramic-btn"),
    saveCeramicBtn: document.getElementById("save-ceramic-btn"),
    editCeramicStatus: document.getElementById("edit-ceramic-status"),

    cvFile: document.getElementById("cv-file"),
    cvFilename: document.getElementById("cv-filename"),
    uploadCvBtn: document.getElementById("upload-cv-btn"),
    cvStatus: document.getElementById("cv-status")
  };

  function setStatus(node, message, type) {
    node.textContent = message || "";
    node.classList.remove("error", "success");
    if (type) {
      node.classList.add(type);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function sanitizeSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function sanitizeFileName(value) {
    return value.replace(/[^a-zA-Z0-9._-]/g, "-");
  }

  function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map((part) => part.toString(16).padStart(2, "0")).join("");
  }

  function b64Utf8Encode(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function b64Utf8Decode(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function encodePath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }

  function requireConnected() {
    if (!state.token) {
      throw new Error("Connect Git Sync first.");
    }
  }

  async function githubRequest(path, options = {}) {
    requireConnected();
    const response = await fetch(`https://api.github.com${path}`, {
      method: options.method || "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${state.token}`,
        "Content-Type": "application/json"
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      let message = `GitHub API error (${response.status})`;
      try {
        const data = await response.json();
        if (data && data.message) {
          message = data.message;
        }
      } catch (error) {
        // Keep fallback message.
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }
    return response.json();
  }

  async function getFile(path) {
    const apiPath = `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}/contents/${encodePath(path)}?ref=${encodeURIComponent(state.branch)}`;
    try {
      const data = await githubRequest(apiPath);
      return {
        sha: data.sha,
        content: b64Utf8Decode(String(data.content || "").replace(/\n/g, ""))
      };
    } catch (error) {
      if (String(error.message).toLowerCase().includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async function putTextFile(path, content, message) {
    const existing = await getFile(path);
    const apiPath = `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}/contents/${encodePath(path)}`;
    await githubRequest(apiPath, {
      method: "PUT",
      body: {
        message,
        content: b64Utf8Encode(content),
        branch: state.branch,
        sha: existing ? existing.sha : undefined
      }
    });
  }

  async function putBinaryFile(path, file, message) {
    const existing = await getFile(path);
    const apiPath = `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}/contents/${encodePath(path)}`;
    const buffer = await file.arrayBuffer();
    await githubRequest(apiPath, {
      method: "PUT",
      body: {
        message,
        content: arrayBufferToBase64(buffer),
        branch: state.branch,
        sha: existing ? existing.sha : undefined
      }
    });
  }

  function buildPostListItem(meta) {
    return `      <li>
        <a href="writing/${escapeHtml(meta.slug)}.html" class="post-title">${escapeHtml(meta.title)}</a>
        <span class="post-tag">${escapeHtml(meta.tag)}</span>
        <time class="post-date" datetime="${escapeHtml(meta.dateIso)}">${escapeHtml(meta.dateDisplay)}</time>
        <p class="post-description">${escapeHtml(meta.description)}</p>
      </li>`;
  }

  function buildPostHtml(meta, markdown) {
    const safeTitle = escapeHtml(meta.title);
    const safeDisplayDate = escapeHtml(meta.dateDisplay);
    const markdownB64 = b64Utf8Encode(markdown);
    const renderedHtml = marked.parse(markdown);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} - Tim Chee</title>
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <script src="../favicon.js" defer></script>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <canvas id="dot-grid"></canvas>
  <div class="container">
    <nav>
      <a href="../index.html" class="site-name">Tim Chee</a>
      <a href="../index.html">About</a>
      <a href="../writing.html" class="active">Posts</a>
      <a href="../cv.html">CV</a>
      <a href="../coursework.html">Coursework</a>
      <a href="../ceramics.html">Ceramics</a>
    </nav>

    <a href="../writing.html" class="back-link">Posts</a>

    <div class="post-header">
      <h1>${safeTitle}</h1>
      <p class="post-meta">${safeDisplayDate}</p>
    </div>

    <!-- EDITOR_META:${escapeHtml(JSON.stringify(meta))} -->
    <!-- EDITOR_MARKDOWN_B64:${markdownB64} -->
    <article class="post-content">
${renderedHtml}
    </article>
  </div>
  <script src="../dot-grid.js"></script>
  <script data-goatcounter="https://timothychee.goatcounter.com/count"
          async src="//gc.zgo.at/count.js"></script>
</body>
</html>
`;
  }

  function buildCeramicBlock(entry) {
    return `      <div class="ceramics-piece">
        <img src="ceramics/${escapeHtml(entry.imageFileName)}" alt="${escapeHtml(entry.alt)}" loading="lazy">
        <div class="piece-info">
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.description)}</p>
          <span class="piece-meta">${escapeHtml(entry.meta)}</span>
        </div>
      </div>`;
  }

  function upsertPostInWritingIndex(html, meta) {
    const block = buildPostListItem(meta);
    const slugRegex = new RegExp(`\\s*(?:<!--\\s*EDITOR_POST:${meta.slug}\\s*-->\\s*)?<li>[\\s\\S]*?<a href="writing/${meta.slug}\\.html" class="post-title">[\\s\\S]*?<\\/li>`, "m");
    if (slugRegex.test(html)) {
      return html.replace(slugRegex, `\n${block}`);
    }
    const anchor = '<ul class="writing-list">';
    if (!html.includes(anchor)) {
      throw new Error("Could not find writing list in writing.html");
    }
    return html.replace(anchor, `${anchor}\n${block}`);
  }

  function upsertCeramicInIndex(html, entry) {
    const block = buildCeramicBlock(entry);
    const targetImage = escapeRegex(entry.sourceImageFileName || entry.imageFileName);
    const imageRegex = new RegExp(`\\s*<div class="ceramics-piece">[\\s\\S]*?<img src="ceramics/${targetImage}"[^>]*>[\\s\\S]*?<\\/div>\\s*<\\/div>`, "m");
    if (imageRegex.test(html)) {
      return html.replace(imageRegex, `\n${block}`);
    }
    const anchor = '<div class="ceramics-gallery">';
    if (!html.includes(anchor)) {
      throw new Error("Could not find ceramics gallery in ceramics.html");
    }
    return html.replace(anchor, `${anchor}\n\n${block}`);
  }

  function parsePostsFromWritingIndex(html) {
    const posts = [];
    const regex = /<li>[\s\S]*?<a href="writing\/([a-z0-9-]+)\.html" class="post-title">([^<]+)<\/a>[\s\S]*?<span class="post-tag">([^<]*)<\/span>[\s\S]*?<time class="post-date" datetime="([^"]+)">([^<]+)<\/time>[\s\S]*?<p class="post-description">([^<]*)<\/p>[\s\S]*?<\/li>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      posts.push({
        slug: sanitizeSlug(match[1]),
        title: match[2].trim(),
        tag: match[3].trim(),
        dateIso: match[4].trim(),
        dateDisplay: match[5].trim(),
        description: match[6].trim()
      });
    }
    return posts;
  }

  function parseCeramicsFromIndex(html) {
    const entries = [];
    const regex = /<div class="ceramics-piece">[\s\S]*?<img src="ceramics\/([^"]+)" alt="([^"]*)" loading="lazy">[\s\S]*?<h3>([^<]*)<\/h3>[\s\S]*?<p>([^<]*)<\/p>[\s\S]*?<span class="piece-meta">([^<]*)<\/span>[\s\S]*?<\/div>\s*<\/div>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const imageFileName = match[1].trim();
      const baseName = imageFileName.includes(".") ? imageFileName.slice(0, imageFileName.lastIndexOf(".")) : imageFileName;
      entries.push({
        id: sanitizeSlug(baseName),
        imageFileName,
        alt: match[2].trim(),
        title: match[3].trim(),
        description: match[4].trim(),
        meta: match[5].trim()
      });
    }
    return entries;
  }

  function fillPostSelect() {
    el.editPostSelect.innerHTML = "";
    if (!state.posts.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No posts found";
      el.editPostSelect.appendChild(option);
      return;
    }
    state.posts.forEach((post) => {
      const option = document.createElement("option");
      option.value = post.slug;
      option.textContent = `${post.title} (${post.slug})`;
      el.editPostSelect.appendChild(option);
    });
  }

  function fillCeramicSelect() {
    el.editCeramicSelect.innerHTML = "";
    if (!state.ceramics.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No ceramics entries found";
      el.editCeramicSelect.appendChild(option);
      return;
    }
    state.ceramics.forEach((piece) => {
      const option = document.createElement("option");
      option.value = piece.id;
      option.textContent = `${piece.title} (${piece.id})`;
      el.editCeramicSelect.appendChild(option);
    });
  }

  async function refreshIndexes() {
    setStatus(el.gitStatus, "Refreshing indexes...", "");
    const writing = await getFile("writing.html");
    const ceramics = await getFile("ceramics.html");
    if (!writing || !ceramics) {
      throw new Error("Could not load writing.html or ceramics.html.");
    }
    state.writingIndex = writing.content;
    state.ceramicsIndex = ceramics.content;
    state.posts = parsePostsFromWritingIndex(state.writingIndex);
    state.ceramics = parseCeramicsFromIndex(state.ceramicsIndex);
    fillPostSelect();
    fillCeramicSelect();
    setStatus(el.gitStatus, "Connected. Indexes refreshed.", "success");
  }

  async function connectGit() {
    state.owner = el.owner.value.trim() || "t1mchee";
    state.repo = el.repo.value.trim() || "t1mchee.github.io";
    state.branch = el.branch.value.trim() || "main";
    state.token = el.token.value.trim();
    if (!state.token) {
      throw new Error("Enter a GitHub token.");
    }

    setStatus(el.gitStatus, "Connecting...", "");
    await githubRequest(`/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}`);
    await refreshIndexes();
  }

  function readPostMetaFromEditorHtml(html) {
    const metaMatch = html.match(/<!--\s*EDITOR_META:([\s\S]*?)\s*-->/);
    const markdownMatch = html.match(/<!--\s*EDITOR_MARKDOWN_B64:([A-Za-z0-9+/=]+)\s*-->/);
    if (!metaMatch || !markdownMatch) {
      throw new Error("No editor metadata found.");
    }

    let meta;
    try {
      meta = JSON.parse(metaMatch[1]);
    } catch (error) {
      throw new Error("Could not parse editor metadata for this post.");
    }

    return {
      meta,
      markdown: b64Utf8Decode(markdownMatch[1])
    };
  }

  function nodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tag = node.tagName.toLowerCase();
    const children = Array.from(node.childNodes).map((child) => nodeToMarkdown(child)).join("");

    if (tag === "strong" || tag === "b") {
      return `**${children.trim()}**`;
    }
    if (tag === "em" || tag === "i") {
      return `*${children.trim()}*`;
    }
    if (tag === "code") {
      return `\`${children.trim()}\``;
    }
    if (tag === "a") {
      const href = node.getAttribute("href") || "";
      return href ? `[${children.trim()}](${href})` : children;
    }
    if (tag === "br") {
      return "\n";
    }
    if (tag === "hr") {
      return "\n---\n";
    }
    if (tag === "h1") {
      return `\n# ${children.trim()}\n`;
    }
    if (tag === "h2") {
      return `\n## ${children.trim()}\n`;
    }
    if (tag === "h3") {
      return `\n### ${children.trim()}\n`;
    }
    if (tag === "h4") {
      return `\n#### ${children.trim()}\n`;
    }
    if (tag === "h5") {
      return `\n##### ${children.trim()}\n`;
    }
    if (tag === "h6") {
      return `\n###### ${children.trim()}\n`;
    }
    if (tag === "p") {
      return `\n${children.trim()}\n`;
    }
    if (tag === "li") {
      return children.trim();
    }
    if (tag === "ul") {
      const items = Array.from(node.children)
        .filter((child) => child.tagName && child.tagName.toLowerCase() === "li")
        .map((li) => `- ${nodeToMarkdown(li).trim()}`)
        .join("\n");
      return `\n${items}\n`;
    }
    if (tag === "ol") {
      const items = Array.from(node.children)
        .filter((child) => child.tagName && child.tagName.toLowerCase() === "li")
        .map((li, index) => `${index + 1}. ${nodeToMarkdown(li).trim()}`)
        .join("\n");
      return `\n${items}\n`;
    }

    return children;
  }

  function htmlToMarkdown(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const root = doc.body.firstElementChild;
    if (!root) {
      return "";
    }

    const parts = Array.from(root.childNodes).map((child) => nodeToMarkdown(child));
    let markdown = parts.join("");
    markdown = markdown
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+\n/g, "\n")
      .trim();
    return markdown;
  }

  function collectNewPostForm() {
    const slug = sanitizeSlug(el.postSlug.value);
    const title = el.postTitle.value.trim();
    const tag = el.postTag.value.trim();
    const dateIso = el.postDateIso.value;
    const dateDisplay = el.postDateDisplay.value.trim();
    const description = el.postDescription.value.trim();
    const markdown = el.postMarkdown.value.trim();

    if (!slug || !title || !tag || !dateIso || !dateDisplay || !description || !markdown) {
      throw new Error("Fill all post fields before publishing.");
    }

    return {
      meta: { slug, title, tag, dateIso, dateDisplay, description },
      markdown
    };
  }

  async function publishPost() {
    const { meta, markdown } = collectNewPostForm();
    setStatus(el.postStatus, "Publishing post...", "");

    if (state.posts.some((item) => item.slug === meta.slug)) {
      throw new Error(`A post with slug "${meta.slug}" already exists.`);
    }

    const postPath = `writing/${meta.slug}.html`;
    const postHtml = buildPostHtml(meta, markdown);
    const newWritingIndex = upsertPostInWritingIndex(state.writingIndex, meta);

    await putTextFile(postPath, postHtml, `Add post: ${meta.title}`);
    await putTextFile("writing.html", newWritingIndex, `Update posts index: ${meta.title}`);

    state.writingIndex = newWritingIndex;
    state.posts = parsePostsFromWritingIndex(state.writingIndex);
    fillPostSelect();
    setStatus(el.postStatus, `Published ${meta.title}.`, "success");
  }

  async function loadPostForEdit() {
    const slug = el.editPostSelect.value;
    if (!slug) {
      throw new Error("Select a post first.");
    }
    setStatus(el.editPostStatus, "Loading post...", "");

    const postFile = await getFile(`writing/${slug}.html`);
    if (!postFile) {
      throw new Error("Could not find selected post file.");
    }

    state.loadedPostSlug = slug;
    const indexMeta = state.posts.find((post) => post.slug === slug);
    if (!indexMeta) {
      throw new Error("Post metadata not found in writing index.");
    }

    el.editPostTitle.value = indexMeta.title || "";
    el.editPostTag.value = indexMeta.tag || "";
    el.editPostDateIso.value = indexMeta.dateIso || "";
    el.editPostDateDisplay.value = indexMeta.dateDisplay || "";
    el.editPostDescription.value = indexMeta.description || "";

    state.loadedPostRawHtml = postFile.content;
    state.loadedPostIsEditorManaged = false;

    try {
      const parsed = readPostMetaFromEditorHtml(postFile.content);
      el.editPostMarkdown.value = parsed.markdown || "";
      state.loadedPostIsEditorManaged = true;
      setStatus(el.editPostStatus, `Loaded ${slug} (markdown mode).`, "success");
      return;
    } catch (error) {
      const bodyMatch = postFile.content.match(/<div class="post-header">[\s\S]*?<\/div>\s*([\s\S]*?)\s*<\/div>\s*<script src="\.\.\/dot-grid\.js"><\/script>/);
      if (!bodyMatch) {
        throw new Error("Could not parse post body. This post may use a custom structure.");
      }
      el.editPostMarkdown.value = htmlToMarkdown(bodyMatch[1]);
      setStatus(el.editPostStatus, `Loaded ${slug} (converted from HTML).`, "success");
    }
  }

  function updateNonEditorPostHtml(originalHtml, meta, bodyHtml) {
    let updated = originalHtml;
    const renderedBody = marked.parse(bodyHtml);
    updated = updated.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)} - Tim Chee</title>`);
    updated = updated.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${escapeHtml(meta.title)}</h1>`);
    updated = updated.replace(/<p class="post-meta">[\s\S]*?<\/p>/, `<p class="post-meta">${escapeHtml(meta.dateDisplay)}</p>`);
    updated = updated.replace(/(<div class="post-header">[\s\S]*?<\/div>)([\s\S]*?)(\s*<\/div>\s*<script src="\.\.\/dot-grid\.js"><\/script>)/, `$1\n\n${renderedBody}\n$3`);
    return updated;
  }

  async function saveEditedPost() {
    if (!state.loadedPostSlug) {
      throw new Error("Load a post first.");
    }

    const meta = {
      slug: state.loadedPostSlug,
      title: el.editPostTitle.value.trim(),
      tag: el.editPostTag.value.trim(),
      dateIso: el.editPostDateIso.value,
      dateDisplay: el.editPostDateDisplay.value.trim(),
      description: el.editPostDescription.value.trim()
    };
    const markdown = el.editPostMarkdown.value.trim();
    if (!meta.title || !meta.tag || !meta.dateIso || !meta.dateDisplay || !meta.description || !markdown) {
      throw new Error("Fill all edit fields.");
    }

    setStatus(el.editPostStatus, "Saving post changes...", "");
    const newPostHtml = state.loadedPostIsEditorManaged
      ? buildPostHtml(meta, markdown)
      : updateNonEditorPostHtml(state.loadedPostRawHtml, meta, markdown);
    const updatedWritingIndex = upsertPostInWritingIndex(state.writingIndex, meta);

    await putTextFile(`writing/${meta.slug}.html`, newPostHtml, `Edit post: ${meta.title}`);
    await putTextFile("writing.html", updatedWritingIndex, `Update posts index: ${meta.title}`);

    state.writingIndex = updatedWritingIndex;
    state.posts = parsePostsFromWritingIndex(state.writingIndex);
    fillPostSelect();
    setStatus(el.editPostStatus, `Saved ${meta.slug}.`, "success");
  }

  function extensionFromFileName(name) {
    const idx = name.lastIndexOf(".");
    if (idx === -1) {
      return "";
    }
    return name.slice(idx + 1).toLowerCase();
  }

  async function publishCeramic() {
    const id = sanitizeSlug(el.ceramicId.value);
    const title = el.ceramicTitle.value.trim();
    const alt = el.ceramicAlt.value.trim();
    const meta = el.ceramicMeta.value.trim();
    const description = el.ceramicDescription.value.trim();
    const imageFile = el.ceramicImage.files[0];

    if (!id || !title || !alt || !meta || !description || !imageFile) {
      throw new Error("Fill all ceramics fields and choose an image.");
    }
    if (state.ceramics.some((item) => item.id === id)) {
      throw new Error(`A ceramic entry with ID "${id}" already exists.`);
    }

    const ext = extensionFromFileName(imageFile.name) || "png";
    const imageFileName = `${id}.${sanitizeFileName(ext)}`;
    const entry = { id, title, alt, meta, description, imageFileName, sourceImageFileName: imageFileName };

    setStatus(el.ceramicStatus, "Publishing ceramic piece...", "");

    const newCeramicsIndex = upsertCeramicInIndex(state.ceramicsIndex, entry);
    await putBinaryFile(`ceramics/${imageFileName}`, imageFile, `Add ceramic image: ${title}`);
    await putTextFile("ceramics.html", newCeramicsIndex, `Add ceramic piece: ${title}`);

    state.ceramicsIndex = newCeramicsIndex;
    state.ceramics = parseCeramicsFromIndex(state.ceramicsIndex);
    fillCeramicSelect();
    setStatus(el.ceramicStatus, `Published ceramic piece "${title}".`, "success");
  }

  async function loadCeramicForEdit() {
    const id = el.editCeramicSelect.value;
    if (!id) {
      throw new Error("Select a ceramic piece first.");
    }

    const piece = state.ceramics.find((item) => item.id === id);
    if (!piece) {
      throw new Error("Selected ceramic entry was not found in index.");
    }

    state.loadedCeramicId = id;
    state.loadedCeramicSourceImage = piece.imageFileName;
    el.editCeramicTitle.value = piece.title;
    el.editCeramicAlt.value = piece.alt;
    el.editCeramicMeta.value = piece.meta;
    el.editCeramicDescription.value = piece.description;
    setStatus(el.editCeramicStatus, `Loaded ${piece.title}.`, "success");
  }

  async function saveCeramicEdit() {
    if (!state.loadedCeramicId) {
      throw new Error("Load a ceramic piece first.");
    }

    const current = state.ceramics.find((item) => item.id === state.loadedCeramicId);
    if (!current) {
      throw new Error("Could not find loaded ceramic entry.");
    }

    const title = el.editCeramicTitle.value.trim();
    const alt = el.editCeramicAlt.value.trim();
    const meta = el.editCeramicMeta.value.trim();
    const description = el.editCeramicDescription.value.trim();
    const replacementImage = el.editCeramicImage.files[0];
    if (!title || !alt || !meta || !description) {
      throw new Error("Fill all ceramic edit fields.");
    }

    let imageFileName = current.imageFileName;
    if (replacementImage) {
      const ext = extensionFromFileName(replacementImage.name) || "png";
      imageFileName = `${current.id}.${sanitizeFileName(ext)}`;
      await putBinaryFile(`ceramics/${imageFileName}`, replacementImage, `Update ceramic image: ${title}`);
    }

    const updated = {
      id: current.id,
      title,
      alt,
      meta,
      description,
      imageFileName,
      sourceImageFileName: state.loadedCeramicSourceImage || current.imageFileName
    };

    setStatus(el.editCeramicStatus, "Saving ceramic changes...", "");
    const newCeramicsIndex = upsertCeramicInIndex(state.ceramicsIndex, updated);
    await putTextFile("ceramics.html", newCeramicsIndex, `Edit ceramic piece: ${title}`);

    state.ceramicsIndex = newCeramicsIndex;
    state.ceramics = parseCeramicsFromIndex(state.ceramicsIndex);
    fillCeramicSelect();
    setStatus(el.editCeramicStatus, `Saved ceramic "${title}".`, "success");
  }

  async function uploadCvPdf() {
    const file = el.cvFile.files[0];
    if (!file) {
      throw new Error("Choose a PDF file.");
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("The selected file is not a PDF.");
    }

    const targetName = sanitizeFileName(el.cvFilename.value.trim() || file.name);
    setStatus(el.cvStatus, "Uploading CV PDF...", "");

    const cvHtmlFile = await getFile("cv.html");
    if (!cvHtmlFile) {
      throw new Error("Could not load cv.html.");
    }

    let updatedCvHtml = cvHtmlFile.content;
    updatedCvHtml = updatedCvHtml.replace(/(<iframe src=")[^"]+(" title="Tim Chee CV"><\/iframe>)/, `$1${targetName}$2`);
    updatedCvHtml = updatedCvHtml.replace(/(<a href=")[^"]+(" class="pdf-download" download>)/, `$1${targetName}$2`);

    await putBinaryFile(targetName, file, `Upload CV PDF: ${targetName}`);
    await putTextFile("cv.html", updatedCvHtml, `Update cv.html to ${targetName}`);
    setStatus(el.cvStatus, `Uploaded ${targetName} and updated cv.html.`, "success");
  }

  async function unlockEditor() {
    const value = el.password.value;
    const valueHash = await sha256Hex(value);
    if (valueHash !== EDITOR_PASSWORD_SHA256) {
      setStatus(el.lockStatus, "Incorrect password.", "error");
      return;
    }
    el.lockScreen.classList.add("hidden");
    el.app.classList.remove("hidden");
    setStatus(el.lockStatus, "", "");
  }

  function wireEvents() {
    el.unlockBtn.addEventListener("click", async () => {
      try {
        await unlockEditor();
      } catch (error) {
        setStatus(el.lockStatus, "Unlock failed.", "error");
      }
    });
    el.password.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") {
        try {
          await unlockEditor();
        } catch (error) {
          setStatus(el.lockStatus, "Unlock failed.", "error");
        }
      }
    });

    el.connectBtn.addEventListener("click", async () => {
      try {
        await connectGit();
      } catch (error) {
        setStatus(el.gitStatus, error.message, "error");
      }
    });

    el.refreshBtn.addEventListener("click", async () => {
      try {
        await refreshIndexes();
      } catch (error) {
        setStatus(el.gitStatus, error.message, "error");
      }
    });

    el.publishPostBtn.addEventListener("click", async () => {
      try {
        await publishPost();
      } catch (error) {
        setStatus(el.postStatus, error.message, "error");
      }
    });

    el.loadPostBtn.addEventListener("click", async () => {
      try {
        await loadPostForEdit();
      } catch (error) {
        setStatus(el.editPostStatus, error.message, "error");
      }
    });
    el.editPostSelect.addEventListener("change", async () => {
      if (!el.editPostSelect.value) {
        return;
      }
      try {
        await loadPostForEdit();
      } catch (error) {
        setStatus(el.editPostStatus, error.message, "error");
      }
    });

    el.savePostBtn.addEventListener("click", async () => {
      try {
        await saveEditedPost();
      } catch (error) {
        setStatus(el.editPostStatus, error.message, "error");
      }
    });

    el.publishCeramicBtn.addEventListener("click", async () => {
      try {
        await publishCeramic();
      } catch (error) {
        setStatus(el.ceramicStatus, error.message, "error");
      }
    });

    el.loadCeramicBtn.addEventListener("click", async () => {
      try {
        await loadCeramicForEdit();
      } catch (error) {
        setStatus(el.editCeramicStatus, error.message, "error");
      }
    });

    el.saveCeramicBtn.addEventListener("click", async () => {
      try {
        await saveCeramicEdit();
      } catch (error) {
        setStatus(el.editCeramicStatus, error.message, "error");
      }
    });

    el.uploadCvBtn.addEventListener("click", async () => {
      try {
        await uploadCvPdf();
      } catch (error) {
        setStatus(el.cvStatus, error.message, "error");
      }
    });
  }

  wireEvents();
})();
