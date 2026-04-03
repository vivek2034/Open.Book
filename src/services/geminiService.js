import { AppError } from "../utils/appError.js";
import { extractStoryText } from "../utils/storyFormatter.js";

const buildPrompt = ({ category, prompt }) => `
You are an expert fiction author.

Write one original story in the "${category}" category.
User direction: "${prompt}"

Requirements:
- Create a compelling title on the first line prefixed with "Title:"
- Then write the story body as a long-form chaptered reading experience
- Length: 2200 to 3200 words
- Structure it like a mini novella with 4 to 6 chapter headings
- Build momentum across the chapters with a strong opening hook, escalating middle, and satisfying ending
- Keep the tone immersive, descriptive, and emotionally engaging
- Use clear paragraphs
- Avoid meta commentary, bullet points, and explanations outside the story
`.trim();

export const generateStoryWithGemini = async ({ category, prompt }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new AppError("Missing GEMINI_API_KEY in environment variables.", 500);
  }

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildPrompt({ category, prompt })
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.95,
        topP: 0.9,
        maxOutputTokens: 8192
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`Gemini request failed: ${errorText}`, response.status);
  }

  const data = await response.json();
  const content = extractStoryText(data);

  if (!content) {
    throw new AppError("Gemini returned an empty response.", 502);
  }

  const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);
  const titleLine = lines.find((line) => /^title:/i.test(line));
  const title = titleLine ? titleLine.replace(/^title:/i, "").trim() : "Untitled Story";
  const body = titleLine ? content.replace(titleLine, "").trim() : content.trim();

  return {
    title,
    content: body
  };
};
