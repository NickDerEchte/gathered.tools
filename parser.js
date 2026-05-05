const defaultFeedUrl = "/data/v2.json";
const serviceFeed = "/data/service.json";

// --- STATE MANAGEMENT ---
let activeFeedUrls = JSON.parse(localStorage.getItem('gathered_feeds_v2')) || [defaultFeedUrl, serviceFeed];
let loadedFeedsMetadata = [];
let allLoadedTools = [];
let activeFilter = null; // kept for compatibility (not used for tags now)
let activeTags = []; // array of selected tags, most-recent-first
let activePricing = null;

// --- CORE LOGIC ---
async function initApp() {
    // Show loading screen
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';
    loadingScreen.style.opacity = '1';

    // Run the fetch AND a minimum 1-second delay concurrently
    const fetchPromise = fetchAllFeeds(activeFeedUrls);
    const minimumDelay = new Promise(resolve => setTimeout(resolve, 1300));

    // Wait for both to finish
    const [fetchResult] = await Promise.all([fetchPromise, minimumDelay]);

    allLoadedTools = fetchResult.allTools;
    loadedFeedsMetadata = fetchResult.feedsMetadata;

    renderTools();
    renderSettingsList();

    // Hide loading screen smoothly
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        // Show welcome popup only after loading animation is finished
        if (typeof showWelcomePopupIfNeeded === 'function') {
            showWelcomePopupIfNeeded();
        }
    }, 300);
}

async function fetchAllFeeds(urls) {
    let allTools = [];
    let feedsMetadata = [];

    try {
        const responses = await Promise.all(urls.map(url => fetch(url).catch(e => null)));

        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            const feedUrl = urls[i];

            if (!response || !response.ok) continue;

            const data = await response.json();

            if (data["tooldata-version"] === "v2" || data["tooldata-version"] === "v3") {
                // Attach _feedUrl to each tool for sorting later
                const toolsWithFeed = data.tools.map(tool => ({ ...tool, _feedUrl: feedUrl }));
                allTools = allTools.concat(toolsWithFeed);
                feedsMetadata.push({
                    url: feedUrl,
                    name: data["feed-name"],
                    author: data["feed-author"],
                    authorSrc: data["feed-author-src"],
                    icon: data["feed-icon"] || 'data/fallback.jpg',
                    updated: data["updated"] || 'Unknown'
                });
            }
        }
        return {
            allTools,
            feedsMetadata
        };
    } catch (error) {
        console.error("Critical error fetching feeds:", error);
        return {
            allTools: [],
            feedsMetadata: []
        };
    }
}


// name (:

function credits() {
    console.log(`%c
███╗   ██╗██╗ ██████╗██╗  ██╗                 
████╗  ██║██║██╔════╝██║ ██╔╝                 
██╔██╗ ██║██║██║     █████╔╝                  
██║╚██╗██║██║██║     ██╔═██╗                  
██║ ╚████║██║╚██████╗██║  ██╗                 
╚═╝  ╚═══╝╚═╝ ╚═════╝╚═╝  ╚═╝                 
%c                                              
███████╗██╗ ██████╗ ███╗   ██╗███████╗██████╗ 
██╔════╝██║██╔════╝ ████╗  ██║██╔════╝██╔══██╗
█████╗  ██║██║  ███╗██╔██╗ ██║█████╗  ██████╔╝
██╔══╝  ██║██║   ██║██║╚██╗██║██╔══╝  ██╔══██╗
██║     ██║╚██████╔╝██║ ╚████║███████╗██║  ██║
╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
%c
(c) 2026 gathered.tools by Nick Figner. All rights reserved. nickfigner.com
%c`,

   "color: #28AFD4; font-family: monospace;", 
   "color: #28afd494; font-family: monospace;", 
   "background-color: #222317; color: #606140; font-family: monospace; font-weight: bold;", 
   "");
}

window.onload = credits;


// --- FILTERING LOGIC ---
function setFilter(type, value) {
    if (type === 'tag') {
        const container = document.getElementById('tag-selector');

        // FLIP: capture positions before DOM change
        const beforeRects = {};
        if (container) {
            Array.from(container.children).forEach(btn => {
                beforeRects[btn.textContent] = btn.getBoundingClientRect();
            });
        }

        // toggle tag in activeTags (keep most-recent-first)
        const existing = activeTags.indexOf(value);
        if (existing > -1) {
            activeTags.splice(existing, 1);
        } else {
            activeTags.unshift(value);
        }

        // Re-render selector and tools
        renderTools();

        // FLIP: animate from previous positions to new ones
        requestAnimationFrame(() => {
            const containerAfter = document.getElementById('tag-selector');
            if (!containerAfter) return;
            Array.from(containerAfter.children).forEach(btn => {
                const tag = btn.textContent;
                const before = beforeRects[tag];
                if (!before) return;
                const after = btn.getBoundingClientRect();
                const dx = before.left - after.left;
                const dy = before.top - after.top;
                if (dx === 0 && dy === 0) return;
                btn.style.transition = 'none';
                btn.style.transform = `translate(${dx}px, ${dy}px)`;
                // force layout
                btn.getBoundingClientRect();
                btn.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1)';
                btn.style.transform = '';
                btn.addEventListener('transitionend', function cleanup() {
                    btn.style.transition = '';
                    btn.style.transform = '';
                    btn.removeEventListener('transitionend', cleanup);
                });
            });
        });

        // keep page at top so user sees filter change
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        return;
    }

    if (type === 'pricing') {
        // single pricing filter - toggle
        if (activePricing === value) activePricing = null;
        else activePricing = value;
        // clear tags when switching to pricing? keep both active (allow combined filtering)
        renderTools();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        return;
    }

    // fallback (preserve compatibility)
    activeFilter = {
        type,
        value
    };
    renderTools();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function clearFilter() {
    activeTags = [];
    activePricing = null;
    activeFilter = null;
    renderTools();
}

// Render a tag selector bar at the top sorted by frequency (desc)
function renderTagSelector() {
    const container = document.getElementById('tag-selector');
    if (!container) return;

    const counts = getTagCounts();

    // Sort tags by frequency, but keep selected tags (activeTags) first in their selected order
    const remaining = Object.keys(counts).filter(t => !activeTags.includes(t)).sort((a, b) => counts[b] - counts[a]);
    const tags = [...activeTags.filter(t => counts[t]), ...remaining];

    if (tags.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = tags.map(tag => {
        const selected = activeTags.includes(tag);
        const safeTag = tag.replace(/'/g, "\\'");
        return `<button class="tag-selector-pill ${selected ? 'selected' : ''}" onclick="setFilter('tag', '${safeTag}')">${tag}${selected ? '<img src="data/close.svg" class="pill-close" alt="remove">' : ''}</button>`;
    }).join('');
}

// Render a price selector bar (single selection) sorted by frequency
function renderPriceSelector() {
    const container = document.getElementById('price-selector');
    if (!container) return;

    const counts = getPricingCounts();
    const prices = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    if (prices.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = prices.map(p => {
        const selected = activePricing === p;
        const safe = p.replace(/'/g, "\\'");
        return `<button class="price-pill ${selected ? 'selected' : ''}" onclick="setFilter('pricing', '${safe}')">${p} <span style="opacity:.7;margin-left:6px">(${counts[p]})</span></button>`;
    }).join('');
}

function getPricingCounts() {
    const counts = {};
    allLoadedTools.forEach(tool => {
        const p = (tool.pricing || 'Unknown');
        counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
}

// Helper: return counts map of all tags
function getTagCounts() {
    const counts = {};
    allLoadedTools.forEach(tool => {
        if (!tool.tags) return;
        tool.tags.forEach(t => {
            counts[t] = (counts[t] || 0) + 1;
        });
    });
    return counts;
}

// --- UI RENDERING ---
function renderTools() {
    const grid = document.getElementById('tools-grid');
    const filterContainer = document.getElementById('filter-container');
    grid.innerHTML = '';

    // Prepare filter container: price selector, tag selector on top, then active filter banner
    filterContainer.innerHTML = `
    <div id="price-selector" class="price-selector" aria-hidden="false"></div>
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.2rem;">
      <span style="font-size:1.1rem;font-weight:600;opacity:.7;">Select a Tag</span>
      <div id="tag-selector" class="tag-selector" aria-hidden="false"></div>
    </div>
    <div id="active-filter-banner" class="active-filter-banner"></div>
  `;

    // Render tag selector (fills #tag-selector)
    // Render price selector first, then tags
    renderPriceSelector();
    renderTagSelector();

    // Wire up search autocomplete (tags)
    const searchInput = document.getElementById('tag-search');
    const suggestions = document.getElementById('tag-suggestions');
    if (searchInput && suggestions) {
        searchInput.oninput = function () {
            const q = this.value.trim().toLowerCase();
            const counts = getTagCounts();
            const tags = Object.keys(counts).filter(t => t.toLowerCase().includes(q));
            tags.sort((a, b) => counts[b] - counts[a]);
            if (q.length === 0 || tags.length === 0) {
                suggestions.classList.remove('show');
                suggestions.innerHTML = '';
                return;
            }
            suggestions.classList.add('show');
            suggestions.innerHTML = tags.slice(0, 10).map(t => `<div class="tag-suggestion" role="option" data-tag="${t}">${t} <span style="opacity:.6;margin-left:8px">(${counts[t]})</span></div>`).join('');
            // attach clicks
            Array.from(suggestions.children).forEach(ch => ch.addEventListener('click', () => {
                const tag = ch.getAttribute('data-tag');
                setFilter('tag', tag);
                searchInput.value = '';
                suggestions.classList.remove('show');
                suggestions.innerHTML = '';
            }));
        };
        // keyboard: Enter selects first
        searchInput.onkeydown = function (evt) {
            if (evt.key === 'Enter') {
                const first = suggestions.querySelector('[data-tag]');
                if (first) {
                    const tag = first.getAttribute('data-tag');
                    setFilter('tag', tag);
                    this.value = '';
                    suggestions.classList.remove('show');
                    suggestions.innerHTML = '';
                    evt.preventDefault();
                }
            }
        };
    }

    // Active Filter Banner
    const activeBanner = document.getElementById('active-filter-banner');
    if (activeFilter) {
        const prefix = activeFilter.type === 'pricing' ? 'Price: ' : 'Tag: ';
        activeBanner.innerHTML = `<button class="clear-filter-btn" onclick="clearFilter()">✕ Clear Filter: <strong>${prefix}${activeFilter.value}</strong></button>`;
    } else {
        activeBanner.innerHTML = '';
    }

    // 2. Filter the tools
    let toolsToRender = [...allLoadedTools]; // Copy array

    // Apply active tag filters (multiple) and pricing (if set)
    if (activeTags && activeTags.length > 0) {
        toolsToRender = toolsToRender.filter(tool => {
            if (!tool.tags) return false;
            return activeTags.every(t => tool.tags.includes(t));
        });
    }

    if (activePricing) {
        toolsToRender = toolsToRender.filter(tool => tool.pricing && tool.pricing.toLowerCase() === activePricing.toLowerCase());
    }

    if ((!activeTags || activeTags.length === 0) && !activePricing) {
        // Sort: Highlighted tools first, then by newest feed order, with non-highlighted serviceFeed tools always at the bottom
        toolsToRender.sort((a, b) => {
            if (a.highlight && !b.highlight) return -1;
            if (!a.highlight && b.highlight) return 1;
            // Non-highlighted serviceFeed tools always at the bottom
            const aIsService = !a.highlight && a._feedUrl === serviceFeed;
            const bIsService = !b.highlight && b._feedUrl === serviceFeed;
            if (aIsService && !bIsService) return 1;
            if (!aIsService && bIsService) return -1;
            // Otherwise, sort by newest feed order
            const aFeedIdx = activeFeedUrls.lastIndexOf(a._feedUrl);
            const bFeedIdx = activeFeedUrls.lastIndexOf(b._feedUrl);
            return bFeedIdx - aFeedIdx;
        });
    }

    // 4. Render
    if (toolsToRender.length === 0) {
        grid.innerHTML = '<p>No tools found for this criteria.</p>';
        return;
    }

    toolsToRender.forEach(tool => {
        const imgSrc = tool.image || 'data/fallback.jpg';
        const isHighlighted = tool.highlight === true;

        const card = document.createElement('div');
        // Add the highlighted class if applicable
        card.className = `tool-card ${isHighlighted ? 'highlighted' : ''}`;

        card.innerHTML = `
      
      <div class="tool-content">
      <img src="${imgSrc}" class="tool-img" alt="${tool.name} preview" loading="lazy" onerror="this.src='data/fallback.jpg'">
        <div class="tool-name">${tool.name}</div>
        <div class="tool-desc">${tool.description}</div>
        
        <div class="tool-meta">
          <svg style="width: 16px; height: 16px;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span class="filter-pill" onclick="setFilter('pricing', '${tool.pricing}')">${tool.pricing}</span>
        </div>
        
        <div class="tool-meta">
          <svg style="width: 16px; height: 16px;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
          ${tool.tags.map((tag, idx) => `<span class="filter-pill" onclick="setFilter('tag', '${tag}')">${tag}</span>${idx < tool.tags.length - 1 ? ', ' : ''}`).join('')}
        </div>
        
        <button class="open-btn" style="margin-top: auto;" onclick="window.open('${tool.url}', '_blank')">Open</button>
      </div>
    `;
        grid.appendChild(card);
    });
}

function renderSettingsList() {
    const list = document.getElementById('feeds-list');
    list.innerHTML = '';

    // Sort feeds so serviceFeed is always first
    const sortedFeeds = [...loadedFeedsMetadata].sort((a, b) => {
        if (a.url === serviceFeed) return -1;
        if (b.url === serviceFeed) return 1;
        return 0;
    });

    sortedFeeds.forEach(feed => {
        const item = document.createElement('div');
        item.className = 'feed-item';

        const authorHtml = feed.authorSrc ?
            `<a href="${feed.authorSrc}" target="_blank">${feed.author}</a>` :
            feed.author;

        // Prevent removal of service.json feed
        let removeBtnHtml = '';
        if (feed.url !== serviceFeed) {
            removeBtnHtml = `<button onclick="removeFeed('${feed.url}')" style="background: transparent; border: none; font-size: 1.2rem;"><img src="data/delete.svg" class="icon-buttons"></button>`;
        }

        item.innerHTML = `
      <div class="feed-left">
        <img src="${feed.icon}" class="feed-icon" alt="Feed Icon" onerror="this.src='https://gathered.tools/icon.png'">
        <div class="feed-info">
          <strong>${feed.name}</strong>
          <span class="feed-meta">by ${authorHtml} &bull; Updated ${feed.updated}</span>
        </div>
      </div>
      ${removeBtnHtml}
    `;
        list.appendChild(item);
    });
}

// --- USER ACTIONS ---
async function addNewFeed() {
    const input = document.getElementById('new-feed-url');
    const url = input.value.trim();

    if (!url) return alert("Please enter a URL");
    if (activeFeedUrls.includes(url)) return alert("Feed already active!");

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data["tooldata-version"] !== "v2" && data["tooldata-version"] !== "v3") throw new Error("Not a v2 or v3 feed");

        activeFeedUrls.push(url);
        localStorage.setItem('gathered_feeds_v2', JSON.stringify(activeFeedUrls));
        input.value = '';

        // Completely re-initialize the app when a new feed is added
        initApp();
    } catch (err) {
        alert("Invalid feed! Make sure it is a valid tool data v2 JSON URL.");
    }
}

function removeFeed(urlToRemove) {
    activeFeedUrls = activeFeedUrls.filter(url => url !== urlToRemove);
    localStorage.setItem('gathered_feeds_v2', JSON.stringify(activeFeedUrls));
    initApp();
}

function toggleModal(show) {
    // Close modal when clicking outside of it
    document.getElementById('settings-modal').addEventListener('click', function (e) {
        if (e.target === this) toggleModal(false);
    });

    const modal = document.getElementById('settings-modal');
    if (show) {
        modal.classList.add('show');
    } else {
        modal.classList.remove('show');
    }
}

// --- BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', initApp);