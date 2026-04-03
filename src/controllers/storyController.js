import { STORY_CATEGORIES } from "../constants/categories.js";
import { Story } from "../models/Story.js";
import {
  consumeDailyQuota,
  getQuotaStatus,
  rollbackDailyQuota
} from "../services/quotaService.js";
import { generateStoryWithGemini } from "../services/geminiService.js";
import { AppError } from "../utils/appError.js";
import { hashIp, getClientIp } from "../utils/ip.js";
import { buildExcerpt, estimateWordCount } from "../utils/storyFormatter.js";

const sanitizeInput = (value) => String(value || "").trim();

export const listCategories = (_req, res) => {
  res.json({ categories: STORY_CATEGORIES });
};

export const getStories = async (req, res) => {
  const category = sanitizeInput(req.query.category);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const query = category ? { category } : {};

  const stories = await Story.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("title category prompt excerpt content meta createdAt")
    .lean();

  res.json({ stories });
};

export const getStoryById = async (req, res) => {
  const story = await Story.findById(req.params.id)
    .select("title category prompt excerpt content meta createdAt")
    .lean();

  if (!story) {
    throw new AppError("Story not found.", 404);
  }

  res.json({ story });
};

export const getQuota = async (req, res) => {
  const ipHash = hashIp(getClientIp(req));
  const quota = await getQuotaStatus(ipHash);

  res.json(quota);
};

export const generateStory = async (req, res) => {
  const category = sanitizeInput(req.body.category);
  const prompt = sanitizeInput(req.body.prompt);

  if (!STORY_CATEGORIES.includes(category)) {
    throw new AppError("Invalid category selected.", 400);
  }

  if (prompt.length < 12) {
    throw new AppError("Prompt must be at least 12 characters long.", 400);
  }

  if (prompt.length > 1000) {
    throw new AppError("Prompt must be under 1000 characters.", 400);
  }

  const ipHash = hashIp(getClientIp(req));
  const quota = await consumeDailyQuota(ipHash);

  try {
    const generated = await generateStoryWithGemini({ category, prompt });

    const story = await Story.create({
      title: generated.title,
      category,
      prompt,
      excerpt: buildExcerpt(generated.content),
      content: generated.content,
      ipHash,
      meta: {
        wordCount: estimateWordCount(generated.content),
        source: "gemini"
      }
    });

    res.status(201).json({
      message: "Story generated successfully.",
      quota,
      story: {
        _id: story._id,
        title: story.title,
        category: story.category,
        prompt: story.prompt,
        excerpt: story.excerpt,
        content: story.content,
        meta: story.meta,
        createdAt: story.createdAt
      }
    });
  } catch (error) {
    await rollbackDailyQuota(ipHash);
    throw error;
  }
};
