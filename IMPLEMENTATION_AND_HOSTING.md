# Implementation And Hosting Guide

## 1. Project Overview

This project is a public AI story generation web app built with:

- Node.js
- Express
- MongoDB with Mongoose
- Gemini API for story generation
- Vanilla HTML, CSS, and JavaScript frontend

The application allows users to:

- generate stories from prompts
- browse a public story feed
- open dedicated story pages
- view SEO-friendly story URLs
- enforce a daily IP-based generation limit

## 2. High-Level Architecture

The app uses a simple full-stack Node architecture:

- `server.js`
  Starts the Express server, connects to MongoDB, serves static files, exposes SEO routes, and mounts API routes.
- `public/`
  Contains the frontend pages and browser JavaScript.
- `src/routes/`
  Defines API endpoints.
- `src/controllers/`
  Handles request logic for stories, quota, and categories.
- `src/services/`
  Integrates with Gemini and quota management.
- `src/models/`
  Contains MongoDB schemas.
- `src/utils/`
  Contains helpers for formatting, IP handling, errors, and SEO rendering.

## 3. Request Flow

### Story Generation Flow

1. A user opens the homepage.
2. The frontend loads categories, current quota, and recent stories using the API.
3. The user submits a category and prompt.
4. `POST /api/stories/generate` validates the request.
5. The app checks the daily IP-based quota.
6. The Gemini service generates a story.
7. The story is saved to MongoDB.
8. The new story is returned to the frontend and shown in the feed.

### Story Reading Flow

1. A user clicks a story link.
2. The app opens a search-friendly URL like `/stories/:id/:slug`.
3. Express loads the story from MongoDB.
4. The server returns fully rendered HTML with:
   - story title
   - category
   - prompt
   - content
   - canonical metadata
   - structured data

This improves search engine visibility because story pages are server-rendered and crawlable.

## 4. Main Features Implemented

- Public AI story generation
- MongoDB-backed public story feed
- Story category support
- Story detail pages
- Daily generation quota per IP
- SEO-friendly story URLs
- Dynamic sitemap generation
- `robots.txt`
- Open Graph and Twitter metadata
- JSON-LD structured data for story pages

## 5. Important Files

- `server.js`
  Main server entry point
- `package.json`
  App scripts and dependencies
- `render.yaml`
  Render deployment blueprint
- `.env.example`
  Required environment variables
- `public/index.html`
  Homepage UI
- `public/app.js`
  Homepage logic for feed, quota, and generation
- `public/story.html`
  Legacy client page, set to `noindex`
- `src/routes/storyRoutes.js`
  API route definitions
- `src/controllers/storyController.js`
  API controllers
- `src/services/geminiService.js`
  Gemini API integration
- `src/models/Story.js`
  MongoDB story model
- `src/utils/seo.js`
  SEO page rendering, canonical paths, and metadata helpers

## 6. Environment Variables

Create a `.env` file for local development.

Required values:

- `PORT`
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `TRUST_PROXY`
- `SITE_URL`

Recommended local example:

```env
PORT=3000
MONGODB_URI=your-mongodb-connection-string
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
TRUST_PROXY=false
SITE_URL=http://localhost:3000
```

## 7. Local Development Setup

### Prerequisites

- Node.js 20 or later
- MongoDB Atlas database or another MongoDB instance
- Gemini API key

### Steps

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`.

3. Add your real values for:

- `MONGODB_URI`
- `GEMINI_API_KEY`
- `SITE_URL`

4. Start the development server:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

## 8. API Endpoints

### Public Endpoints

- `GET /api/health`
  Health check endpoint
- `GET /api/categories`
  Returns available story categories
- `GET /api/stories`
  Returns recent stories
- `GET /api/stories/:id`
  Returns one story as JSON
- `GET /api/quota`
  Returns current daily quota usage
- `POST /api/stories/generate`
  Generates and stores a new story

### SEO Endpoints

- `GET /robots.txt`
- `GET /sitemap.xml`
- `GET /stories/:id/:slug`

## 9. Hosting On GitHub And Render

### Step 1: Push The Project To GitHub

1. Create a new repository on GitHub.
2. Push this project to that repository.
3. Make sure `.env` is not committed.

### Step 2: Connect GitHub To Render

1. Log in to Render.
2. Click `New +`.
3. Choose `Blueprint`.
4. Connect your GitHub account.
5. Select the repository for this project.

Render will detect `render.yaml` and create the web service automatically.

## 10. Render Configuration

The project already contains a Render blueprint in `render.yaml`.

Current deployment settings:

- Runtime: `node`
- Build command: `npm install`
- Start command: `npm start`
- Health check: `/api/health`
- Plan: `free`

Environment variables required in Render:

- `MONGODB_URI`
- `GEMINI_API_KEY`
- `SITE_URL`

Optional:

- `GEMINI_MODEL`

Recommended production values:

- `TRUST_PROXY=true`
- `SITE_URL=https://your-app-name.onrender.com`

## 11. MongoDB Atlas Notes

If you use MongoDB Atlas:

1. Create a cluster.
2. Create a database user.
3. Copy the connection string.
4. Add it to:
   - local `.env`
   - Render environment variables

If Atlas uses IP allowlisting, make sure Render can connect.
In many setups this means allowing:

- `0.0.0.0/0`

Only use this if it fits your security requirements.

## 12. SEO Implementation Notes

This project includes practical SEO improvements:

- crawlable story URLs
- server-rendered story pages
- canonical URLs
- story-specific meta descriptions
- Open Graph metadata
- Twitter metadata
- structured data via JSON-LD
- sitemap generation from MongoDB stories
- robots.txt generation

For best results after deployment:

1. Open your live site.
2. Verify `https://your-domain/sitemap.xml` works.
3. Verify `https://your-domain/robots.txt` works.
4. Add the site to Google Search Console.
5. Submit the sitemap URL.

## 13. Production Checklist

Before going live, confirm:

- `.env` is not committed
- production keys are stored only in Render
- `SITE_URL` matches the live domain exactly
- MongoDB is reachable from Render
- `TRUST_PROXY=true` in Render
- `sitemap.xml` loads successfully
- story pages open at `/stories/:id/:slug`
- Google Search Console sitemap submission is complete

## 14. Security Notes

- Never commit real API keys to GitHub.
- Rotate any key that was accidentally exposed earlier.
- Keep `.env.example` limited to placeholders only.
- Store secrets in Render environment variables, not in source code.

## 15. Suggested Future Improvements

- Add category landing pages such as `/category/fantasy`
- Add pagination for older stories
- Add OG image generation for better social sharing
- Add analytics and Search Console monitoring
- Add caching for sitemap and public feed responses
- Add content moderation and prompt safety filtering

## 16. Summary

This project is already structured well for a simple production deployment.
GitHub is used for source control, and Render is used to host the Node.js service.
MongoDB stores generated stories, and Gemini powers the content generation.
The current implementation now also includes SEO-focused story pages, sitemap support,
and crawler-friendly metadata to improve discoverability over time.
