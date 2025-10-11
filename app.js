const $ = (s, r = document) => r.querySelector(s);
const grid = $("#grid");

// Pfade anpassen, falls du andere Ordner nutzt:
const DATA_URL = "data/tools.json";
const FALLBACK_IMG = "fallback.webp";

async function loadTools() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.tools) ? data.tools : [];
  } catch (err) {
    console.error("Fehler beim Laden der Tools:", err);
    return [];
  }
}

function toolCard(t) {
  // bestmögliche Quelle bestimmen (leer/null => Fallback)
  const imgSrc = t.image && t.image.trim() ? t.image : FALLBACK_IMG;

  return `
    <article class="card" data-id="${t.id || ""}">
      <div class="thumb">
        <img
          src="${imgSrc}"
          alt="${t.name ? `${t.name} cover` : "Tool cover"}"
          loading="lazy"
          decoding="async"
          onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
          width="1280" height="720"
        />
      </div>
      <div class="content">
        <h3>${t.name || "Tool"}</h3>
        <p>${t.description || ""}</p>
        <a class="btn" href="${t.url || "#"}" target="_blank" rel="noopener">Visit</a>
      </div>
    </article>
  `;
}

async function init() {
  const tools = await loadTools();
  grid.innerHTML = tools.map(toolCard).join("");
}

init();
