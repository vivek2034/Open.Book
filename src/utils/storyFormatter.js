export const extractStoryText = (geminiResponse) => {
  const candidates = geminiResponse?.candidates || [];

  const text = candidates
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part?.text || "")
    .join("\n")
    .trim();

  return text;
};

export const buildExcerpt = (content, maxLength = 240) => {
  const compact = content.replace(/\s+/g, " ").trim();

  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength).trim()}...`;
};

export const estimateWordCount = (content) => {
  const normalized = content.trim();
  return normalized ? normalized.split(/\s+/).length : 0;
};
