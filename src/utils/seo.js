const DEFAULT_SITE_NAME = "StoryForge";

export const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const escapeXml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const slugify = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "") || "story";

export const buildStoryPath = (story) =>
  `/stories/${encodeURIComponent(String(story._id))}/${slugify(story.title)}`;

export const formatStoryContentHtml = (content) => {
  const lines = String(content ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      if (/^(chapter|prologue|epilogue)\b/i.test(line)) {
        return `<h2>${escapeHtml(line)}</h2>`;
      }

      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("");
};

const truncate = (value, maxLength) => {
  const compact = String(value ?? "").replace(/\s+/g, " ").trim();

  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
};

export const buildStoryMetaDescription = (story) =>
  truncate(
    `${story.title} is a ${story.category.toLowerCase()} AI story on ${DEFAULT_SITE_NAME}. ${story.excerpt}`,
    158
  );

export const buildSiteUrl = (port) => {
  const configured = String(process.env.SITE_URL || "").trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return `http://localhost:${port}`;
};

export const absoluteUrl = (siteUrl, path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
};

export const toJsonLd = (value) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

export const renderStoryPage = ({ story, siteUrl }) => {
  const canonicalPath = buildStoryPath(story);
  const canonicalUrl = absoluteUrl(siteUrl, canonicalPath);
  const description = buildStoryMetaDescription(story);
  const title = `${story.title} | ${story.category} Story | ${DEFAULT_SITE_NAME}`;
  const wordCount = story.meta?.wordCount || 0;
  const publishedTime = new Date(story.createdAt).toISOString();
  const formattedContent = formatStoryContentHtml(story.content);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description,
    articleSection: story.category,
    genre: story.category,
    wordCount,
    datePublished: publishedTime,
    dateModified: publishedTime,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    author: {
      "@type": "Organization",
      name: DEFAULT_SITE_NAME
    },
    publisher: {
      "@type": "Organization",
      name: DEFAULT_SITE_NAME
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${DEFAULT_SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="article:published_time" content="${escapeHtml(publishedTime)}" />
    <meta property="article:section" content="${escapeHtml(story.category)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Manrope:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/story.css" />
    <script type="application/ld+json">${toJsonLd(schema)}</script>
  </head>
  <body>
    <div class="bg-orb bg-orb-a"></div>
    <div class="bg-orb bg-orb-b"></div>

    <main class="reader-shell">
      <a class="back-link" href="/">Back to feed</a>

      <article class="reader-panel">
        <header class="reader-hero">
          <div class="reader-meta-row">
            <span class="eyebrow">${escapeHtml(story.category)}</span>
            <span class="reader-meta">${escapeHtml(
              new Date(story.createdAt).toLocaleString([], {
                dateStyle: "long",
                timeStyle: "short"
              })
            )}</span>
          </div>
          <h1>${escapeHtml(story.title)}</h1>
          <p class="reader-prompt">Prompt: ${escapeHtml(story.prompt)}</p>
          <div class="reader-meta-row">
            <span class="reader-stat">${escapeHtml(`${wordCount} words`)}</span>
          </div>
        </header>

        <section class="reader-content">${formattedContent}</section>
      </article>
    </main>
  </body>
</html>`;
};
