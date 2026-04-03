import { Router } from "express";
import {
  generateStory,
  getQuota,
  getStoryById,
  getStories,
  listCategories
} from "../controllers/storyController.js";

export const createStoryRouter = () => {
  const router = Router();
  const handle = (controller) => async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  router.get("/categories", handle(listCategories));
  router.get("/stories", handle(getStories));
  router.get("/stories/:id", handle(getStoryById));
  router.get("/quota", handle(getQuota));
  router.post("/stories/generate", handle(generateStory));

  return router;
};
