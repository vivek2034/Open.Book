import "dotenv/config";
import express from "express";
import morgan from "morgan";

import { connectDatabase } from "./src/config/db.js";
import { Story } from "./src/models/Story.js";
import { createStoryRouter } from "./src/routes/storyRoutes.js";
import {
  absoluteUrl,
  buildSiteUrl,
  buildStoryPath,
  escapeXml,
  renderStoryPage
} from "./src/utils/seo.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const siteUrl = buildSiteUrl(port);

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", true);
}

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ai-novel-feed" });
});

app.use("/api", createStoryRouter());

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
});

app.get("/sitemap.xml", async (_req, res, next) => {
  try {
    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .select("title createdAt updatedAt")
      .lean();

    const urls = [
      {
        loc: absoluteUrl(siteUrl, "/"),
        lastmod: new Date().toISOString()
      },
      ...stories.map((story) => ({
        loc: absoluteUrl(siteUrl, buildStoryPath(story)),
        lastmod: new Date(story.updatedAt || story.createdAt).toISOString()
      }))
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.type("application/xml").send(xml);
  } catch (error) {
    next(error);
  }
});

app.get("/story.html", async (req, res, next) => {
  const storyId = String(req.query.id || "").trim();

  if (!storyId) {
    res.redirect(302, "/");
    return;
  }

  try {
    const story = await Story.findById(storyId).select("title").lean();

    if (!story) {
      res.redirect(302, "/");
      return;
    }

    res.redirect(301, buildStoryPath({ _id: storyId, title: story.title }));
  } catch (error) {
    next(error);
  }
});

app.get("/stories/:id/:slug?", async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id)
      .select("title category prompt excerpt content meta createdAt")
      .lean();

    if (!story) {
      res.status(404).send("Story not found.");
      return;
    }

    const canonicalPath = buildStoryPath(story);
    const canonicalSlug = canonicalPath.split("/").pop();

    if (req.params.slug !== canonicalSlug) {
      res.redirect(301, canonicalPath);
      return;
    }

    res.send(renderStoryPage({ story, siteUrl }));
  } catch (error) {
    next(error);
  }
});

app.use(express.static("public"));

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error."
  });
});

const startServer = async () => {
  await connectDatabase(process.env.MONGODB_URI);

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
