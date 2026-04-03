# AI Novel Feed

Public AI-powered novel generation web app built with Node.js, Express, MongoDB, and the Gemini API.

## Project Structure

```text
book/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/
│   ├── config/
│   │   └── db.js
│   ├── constants/
│   │   └── categories.js
│   ├── controllers/
│   │   └── storyController.js
│   ├── models/
│   │   ├── GenerationQuota.js
│   │   └── Story.js
│   ├── routes/
│   │   └── storyRoutes.js
│   ├── services/
│   │   ├── geminiService.js
│   │   └── quotaService.js
│   └── utils/
│       ├── appError.js
│       ├── ip.js
│       └── storyFormatter.js
├── .env.example
├── package.json
├── README.md
└── server.js
```

## Features

- Public story generation without authentication
- Every generated story is saved in MongoDB for the global feed
- IP-based daily generation limit of 5 stories per day
- Category support for Dark, Horror, Fantasy, Romance, Dark Romance, and Lusty
- Vanilla frontend with animated panels and story cards

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and add:

- `MONGODB_URI`
- `GEMINI_API_KEY`
- Optional `GEMINI_MODEL`

3. Start the app:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Deploy To Render

1. Push this project to a GitHub repository.
2. In Render, choose `New +` -> `Blueprint`.
3. Connect your GitHub account and select this repository.
4. Render will detect `render.yaml` and create the web service.
5. In Render, add these environment variables before the first deploy:

- `MONGODB_URI`
- `GEMINI_API_KEY`
- Optional `GEMINI_MODEL`
- `SITE_URL` set to your Render production URL, for example `https://your-app.onrender.com`

6. Deploy the service. Render will run `npm install` and `npm start`.

Notes:

- `TRUST_PROXY` is set to `true` in Render because requests will come through Render's proxy.
- Do not commit your real `.env` file to GitHub.
- `SITE_URL` is used for canonical URLs, sitemap generation, and search engine discovery.
- If your MongoDB Atlas cluster uses IP allowlisting, allow access from anywhere (`0.0.0.0/0`) or configure a supported network rule for Render.

## API Endpoints

- `GET /api/categories`
- `GET /api/stories`
- `GET /api/quota`
- `POST /api/stories/generate`
