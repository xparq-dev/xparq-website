import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DART = path.join(
  ROOT,
  "..",
  "xparq_mobile",
  "apps",
  "mobile",
  "lib",
  "features",
  "profile",
  "data",
  "legal_documents.dart",
);
const OUT = path.join(ROOT, "legal");

const DOCS = [
  ["privacyPolicyEn", "privacy-policy", "en", "Privacy Policy"],
  ["privacyPolicyTh", "privacy-policy", "th", "นโยบายความเป็นส่วนตัว"],
  ["termsOfServiceEn", "terms", "en", "Terms of Service"],
  ["termsOfServiceTh", "terms", "th", "เงื่อนไขการให้บริการ"],
  ["communityGuidelinesEn", "community-guidelines", "en", "Community Guidelines"],
  ["communityGuidelinesTh", "community-guidelines", "th", "แนวทางปฏิบัติของชุมชน"],
];

function extractConst(name, text) {
  const re = new RegExp(
    `static const String ${name} = '''([\\s\\S]*?)''';`,
  );
  const m = text.match(re);
  if (!m) throw new Error(`Missing const: ${name}`);
  return m[1].trim();
}

function inline(s) {
  return s
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>',
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function mdToHtml(md) {
  const lines = md.split("\n");
  const out = [];
  let inUl = false;
  const closeUl = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (line === "---") {
      closeUl();
      out.push("<hr>");
      continue;
    }
    if (line.startsWith("### ")) {
      closeUl();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeUl();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      closeUl();
      out.push(`<h1>${inline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("* ") || line.startsWith("- ")) {
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    if (!line.trim()) {
      closeUl();
      continue;
    }
    closeUl();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeUl();
  return out.join("\n");
}

function page(slug, lang, title, bodyHtml) {
  const other = lang === "en" ? "th" : "en";
  const otherLabel = lang === "en" ? "ไทย" : "English";
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — XPARQ</title>
<meta name="description" content="${title} for the XPARQ platform and mobile app.">
<link rel="canonical" href="https://xparq.me/legal/${slug}.html?lang=${lang}">
<link rel="icon" type="image/x-icon" href="/assets/img/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/global.css">
<link rel="stylesheet" href="/assets/css/components.css">
<link rel="stylesheet" href="/assets/css/legal.css">
</head>
<body>
<nav class="legal-nav">
  <a href="/" class="nav-logo">
    <svg class="logo-bolt" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="58,5 20,55 48,55 42,95 80,45 52,45" fill="#2d9cff"/>
    </svg>
    <span class="logo-text">XPARQ</span>
  </a>
  <div class="legal-nav-links">
    <a href="/legal/privacy-policy.html">Privacy</a>
    <a href="/legal/terms.html">Terms</a>
    <a href="/legal/community-guidelines.html">Guidelines</a>
    <a class="lang-switch" href="/legal/${slug}.html?lang=${other}">${otherLabel}</a>
  </div>
</nav>
<main class="legal-page">
  <article class="legal-doc" data-lang="${lang}">
${bodyHtml}
  </article>
  <p class="legal-sync-note">Synced from XPARQ mobile app. Re-run: <code>node scripts/sync_legal_from_mobile.mjs</code></p>
</main>
<footer class="legal-footer">
  <span>© 2024–2026 XPARQ Holdings Corp.</span>
  <a href="mailto:contact@xparq.me">contact@xparq.me</a>
</footer>
<script src="/assets/js/legal.js"></script>
</body>
</html>`;
}

const dart = fs.readFileSync(DART, "utf8");
fs.mkdirSync(OUT, { recursive: true });

const bundles = {};
for (const [constName, slug, lang, title] of DOCS) {
  const md = extractConst(constName, dart);
  if (!bundles[slug]) bundles[slug] = {};
  bundles[slug][lang] = page(slug, lang, title, mdToHtml(md));
}

for (const [slug, langs] of Object.entries(bundles)) {
  fs.writeFileSync(path.join(OUT, `${slug}.html`), langs.en, "utf8");
  fs.writeFileSync(path.join(OUT, `${slug}.th.html`), langs.th, "utf8");
}

console.log(`Wrote ${Object.keys(bundles).length} legal pages to ${OUT}`);
