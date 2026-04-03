const storyCategory = document.querySelector("#storyCategory");
const storyDate = document.querySelector("#storyDate");
const storyTitle = document.querySelector("#storyTitle");
const storyPrompt = document.querySelector("#storyPrompt");
const storyWordCount = document.querySelector("#storyWordCount");
const storyContent = document.querySelector("#storyContent");

const params = new URLSearchParams(window.location.search);
const storyId = params.get("id");

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString([], {
    dateStyle: "long",
    timeStyle: "short"
  });

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatStoryContent = (content) => {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      if (/^(chapter|prologue|epilogue)\b/i.test(line)) {
        return `<h2>${escapeHtml(line)}</h2>`;
      }

      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("");
};

const renderMissingState = (message) => {
  storyCategory.textContent = "Unavailable";
  storyDate.textContent = "";
  storyTitle.textContent = "Story not found";
  storyPrompt.textContent = "";
  storyWordCount.textContent = "";
  storyContent.innerHTML = `<p>${escapeHtml(message)}</p>`;
};

const loadStory = async () => {
  if (!storyId) {
    renderMissingState("No story id was provided in the URL.");
    return;
  }

  try {
    const response = await fetch(`/api/stories/${encodeURIComponent(storyId)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load story.");
    }

    const { story } = data;
    storyCategory.textContent = story.category;
    storyDate.textContent = formatDate(story.createdAt);
    storyTitle.textContent = story.title;
    storyPrompt.textContent = `Prompt: ${story.prompt}`;
    storyWordCount.textContent = `${story.meta?.wordCount || 0} words`;
    storyContent.innerHTML = formatStoryContent(story.content);
    document.title = `${story.title} | Story Reader`;
  } catch (error) {
    renderMissingState(error.message);
  }
};

loadStory();
