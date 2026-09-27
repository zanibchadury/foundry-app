const API = "/api/ideas";

const grid = document.getElementById("ideaGrid");
const emptyState = document.getElementById("emptyState");
const ideaCountEl = document.getElementById("ideaCount");
const topVotesEl = document.getElementById("topVotes");
const chips = document.querySelectorAll(".chip");
const sortSelect = document.getElementById("sortSelect");

const modalBackdrop = document.getElementById("modalBackdrop");
const openFormBtn = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const ideaForm = document.getElementById("ideaForm");
const formError = document.getElementById("formError");

let activeCategory = "";
let activeSort = "top";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  const units = [
    ["year", 31536000], ["month", 2592000], ["day", 86400],
    ["hour", 3600], ["minute", 60],
  ];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val} ${label}${val > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function renderIdeas(ideas) {
  grid.innerHTML = "";
  emptyState.hidden = ideas.length > 0;
  ideaCountEl.textContent = `${ideas.length} idea${ideas.length !== 1 ? "s" : ""} forged`;
  topVotesEl.textContent = ideas.length ? Math.max(...ideas.map((i) => i.votes)) : 0;

  for (const idea of ideas) {
    const card = document.createElement("article");
    card.className = "idea-card";
    card.innerHTML = `
      <div class="card-top">
        <span class="card-category">${escapeHtml(idea.category)}</span>
        <span class="card-status" data-status="${escapeHtml(idea.status)}">${escapeHtml(idea.status)}</span>
      </div>
      <h3 class="card-title">${escapeHtml(idea.title)}</h3>
      <p class="card-desc">${escapeHtml(idea.description)}</p>
      <div class="card-bottom">
        <span class="card-meta">${escapeHtml(idea.author)} · ${timeAgo(idea.created_at)}</span>
        <button class="vote-btn" data-id="${idea.id}">
          <span class="arrow">&#9650;</span> <span class="vote-count">${idea.votes}</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  }

  grid.querySelectorAll(".vote-btn").forEach((btn) => {
    btn.addEventListener("click", () => upvote(btn.dataset.id));
  });
}

async function loadIdeas() {
  const params = new URLSearchParams();
  if (activeCategory) params.set("category", activeCategory);
  params.set("sort", activeSort);

  try {
    const res = await fetch(`${API}?${params.toString()}`);
    const json = await res.json();
    renderIdeas(json.data || []);
  } catch (err) {
    grid.innerHTML = "";
    emptyState.hidden = false;
    emptyState.textContent = "Couldn't reach the server. Is the API running?";
  }
}

async function upvote(id) {
  try {
    const res = await fetch(`${API}/${id}/upvote`, { method: "POST" });
    if (!res.ok) return;
    await loadIdeas();
  } catch (err) {
    console.error(err);
  }
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    activeCategory = chip.dataset.category;
    loadIdeas();
  });
});

sortSelect.addEventListener("change", () => {
  activeSort = sortSelect.value === "new" ? "new" : "top";
  loadIdeas();
});

function openModal() {
  modalBackdrop.hidden = false;
  document.getElementById("titleInput").focus();
}
function closeModal() {
  modalBackdrop.hidden = true;
  ideaForm.reset();
  formError.hidden = true;
}

openFormBtn.addEventListener("click", openModal);
closeFormBtn.addEventListener("click", closeModal);
cancelFormBtn.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

ideaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;

  const payload = {
    title: document.getElementById("titleInput").value.trim(),
    description: document.getElementById("descInput").value.trim(),
    category: document.getElementById("categorySelect").value,
    author: document.getElementById("authorInput").value.trim() || "Anonymous",
  };

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      formError.textContent = json.message || "Something went wrong.";
      formError.hidden = false;
      return;
    }

    closeModal();
    await loadIdeas();
  } catch (err) {
    formError.textContent = "Couldn't reach the server.";
    formError.hidden = false;
  }
});

loadIdeas();
