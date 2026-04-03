import { GenerationQuota } from "../models/GenerationQuota.js";
import { AppError } from "../utils/appError.js";

export const DAILY_GENERATION_LIMIT = 5;

const getDayKey = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getQuotaStatus = async (ipHash) => {
  const dayKey = getDayKey();
  const record = await GenerationQuota.findOne({ ipHash, dayKey }).lean();
  const used = record?.count || 0;

  return {
    dayKey,
    used,
    remaining: Math.max(0, DAILY_GENERATION_LIMIT - used),
    limit: DAILY_GENERATION_LIMIT
  };
};

export const consumeDailyQuota = async (ipHash) => {
  const dayKey = getDayKey();

  const updated = await GenerationQuota.findOneAndUpdate(
    {
      ipHash,
      dayKey,
      count: { $lt: DAILY_GENERATION_LIMIT }
    },
    {
      $inc: { count: 1 },
      $setOnInsert: { ipHash, dayKey }
    },
    {
      new: true,
      upsert: true
    }
  );

  if (!updated) {
    throw new AppError("Daily generation limit reached. Please come back tomorrow.", 429);
  }

  return {
    used: updated.count,
    remaining: Math.max(0, DAILY_GENERATION_LIMIT - updated.count),
    limit: DAILY_GENERATION_LIMIT
  };
};

export const rollbackDailyQuota = async (ipHash) => {
  const dayKey = getDayKey();

  await GenerationQuota.updateOne(
    {
      ipHash,
      dayKey,
      count: { $gt: 0 }
    },
    {
      $inc: { count: -1 }
    }
  );
};
