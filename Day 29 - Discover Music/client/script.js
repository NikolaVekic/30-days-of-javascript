const API_BASE_URL = "http://localhost:3001";

const form = document.getElementById("music-form");
const submitBtn = document.getElementById("submit-btn");
const errorBox = document.getElementById("error-box");
const results = document.getElementById("results");
const recommendationsEl = document.getElementById("recommendations");

form.addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
  event.preventDefault();

  hideError();
  hideResults();
  setLoading(true);

  const formData = new FormData(form);

  const payload = {
    prompt: formData.get("prompt")?.trim(),
    type: formData.get("type"),
    era: formData.get("era"),
    discoveryLevel: formData.get("discoveryLevel"),
  };

  if (!payload.prompt) {
    showError("Prompt is required.");
    setLoading(false);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/music-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch music results.");
    }

    renderRecommendations(data.recommendations || []);
    results.classList.remove("hidden");
  } catch (error) {
    showError(error.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
}

function renderRecommendations(recommendations = []) {
  if (!recommendationsEl) return;

  if (!recommendations.length) {
    recommendationsEl.innerHTML = `
      <div class="empty-state">
        <p>No tracks found. Try a different mood or vibe.</p>
      </div>
    `;
    return;
  }

  recommendationsEl.innerHTML = recommendations
    .map(
      (track) => `
        <article class="spotify-embed-shell">
          <iframe
            class="spotify-card__embed"
            src="https://open.spotify.com/embed/track/${encodeURIComponent(track.id)}?utm_source=generator"
            width="100%"
            height="100%"
            frameborder="0"
            allowfullscreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify track"
          ></iframe>
        </article>
      `,
    )
    .join("");
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Finding music..." : "Explore";
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function hideResults() {
  results.classList.add("hidden");
  recommendationsEl.innerHTML = "";
}
