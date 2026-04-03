import mongoose from "mongoose";
import { STORY_CATEGORIES } from "../constants/categories.js";

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    category: {
      type: String,
      required: true,
      enum: STORY_CATEGORIES
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 420
    },
    content: {
      type: String,
      required: true
    },
    ipHash: {
      type: String,
      required: true
    },
    meta: {
      wordCount: {
        type: Number,
        default: 0
      },
      source: {
        type: String,
        default: "gemini"
      }
    }
  },
  {
    timestamps: true
  }
);

storySchema.index({ createdAt: -1 });
storySchema.index({ category: 1, createdAt: -1 });

export const Story = mongoose.model("Story", storySchema);
