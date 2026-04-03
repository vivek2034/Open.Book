import mongoose from "mongoose";

const generationQuotaSchema = new mongoose.Schema(
  {
    ipHash: {
      type: String,
      required: true
    },
    dayKey: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

generationQuotaSchema.index({ ipHash: 1, dayKey: 1 }, { unique: true });

export const GenerationQuota = mongoose.model("GenerationQuota", generationQuotaSchema);
