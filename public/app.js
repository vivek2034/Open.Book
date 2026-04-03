const form = document.querySelector("#storyForm");
const categorySelect = document.querySelector("#category");
const promptInput = document.querySelector("#prompt");
const generateButton = document.querySelector("#generateButton");
const statusMessage = document.querySelector("#statusMessage");
const latestTitle = document.querySelector("#latestTitle");
const latestExcerpt = document.querySelector("#latestExcerpt");
const latestCategory = document.querySelector("#latestCategory");
const latestStoryLink = document.querySelector("#latestStoryLink");
const feedGrid = document.querySelector("#feedGrid");
const quotaValue = document.querySelector("#quotaValue");
const quotaSubtext = document.querySelector("#quotaSubtext");
const feedCategoryFilter = document.querySelector("#feedCategoryFilter");
const storyCardTemplate = document.querySelector("#storyCardTemplate");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "") || "story";

const buildStoryPath = (story) =>
  `/stories/${encodeURIComponent(story._id)}/${slugify(story.title)}`;

const setStatus = (message, type = "") => {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`.trim();
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });

const setQuota = (quota) => {
  quotaValue.textContent = `${quota.remaining} / ${quota.limit}`;
  quotaSubtext.textContent = `${quota.used} used today`;
};

const createStoryCard = (story, index) => {
  const fragment = storyCardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".story-card");
  const category = fragment.querySelector(".story-category");
  const date = fragment.querySelector(".story-date");
  const title = fragment.querySelector(".story-title");
  const excerpt = fragment.querySelector(".story-excerpt");
  const meta = fragment.querySelector(".story-meta");
  const readLink = fragment.querySelector(".story-read-link");

  card.style.animationDelay = `${Math.min(index * 70, 420)}ms`;
  category.textContent = story.category;
  date.textContent = formatDate(story.createdAt);
  title.textContent = story.title;
  excerpt.textContent = story.excerpt;
  meta.textContent = `${story.meta?.wordCount || 0} words`;
  readLink.href = buildStoryPath(story);
  readLink.setAttribute("aria-label", `Read ${story.title}`);

  return fragment;
};

const renderFeed = (stories) => {
  feedGrid.innerHTML = "";

  if (!stories.length) {
    feedGrid.innerHTML = `
      <article class="story-card" style="opacity:1;transform:none;">
        <h3 class="story-title">No stories yet</h3>
        <p class="story-excerpt">Be the first person to publish a new story into the public feed.</p>
      </article>
    `;
    return;
  }

  stories.forEach((story, index) => {
    feedGrid.appendChild(createStoryCard(story, index));
  });
};

const loadQuota = async () => {
  const response = await fetch("/api/quota");
  const quota = await response.json();
  setQuota(quota);
};

const loadCategories = async () => {
  const response = await fetch("/api/categories");
  const data = await response.json();

  categorySelect.innerHTML = data.categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");

  feedCategoryFilter.innerHTML = [
    `<option value="">All categories</option>`,
    ...data.categories.map((category) => `<option value="${category}">${category}</option>`)
  ].join("");
};

const loadStories = async (category = "") => {
  const query = new URLSearchParams();

  if (category) {
    query.set("category", category);
  }

  const response = await fetch(`/api/stories?${query.toString()}`);
  const data = await response.json();
  renderFeed(data.stories);
};

const updateLatestPreview = (story) => {
  latestTitle.textContent = story.title;
  latestExcerpt.textContent = story.excerpt;
  latestCategory.textContent = story.category;
  latestStoryLink.href = buildStoryPath(story);
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  generateButton.disabled = true;
  setStatus("Generating your story and publishing it to the feed...");

  try {
    const response = await fetch("/api/stories/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        category: categorySelect.value,
        prompt: promptInput.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    updateLatestPreview(data.story);
    setQuota(data.quota);
    setStatus("Story generated successfully.", "success");
    promptInput.value = "";
    await loadStories(feedCategoryFilter.value);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    generateButton.disabled = false;
  }
});

feedCategoryFilter.addEventListener("change", async (event) => {
  await loadStories(event.target.value);
});

const boot = async () => {
  try {
    await Promise.all([loadCategories(), loadQuota(), loadStories()]);
  } catch (error) {
    console.error(error);
    setStatus("Failed to load the application data.", "error");
  }
};

boot();
