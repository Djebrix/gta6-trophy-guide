// app.js — boots the Leonida Legend guide: loads the trophy data, renders the
// checklist with its filters and spoiler setting, and wires the tabs,
// export/import and the roadmap + missable views (see roadmap.js, tracker.js).
import { loadEarned, saveEarned, exportProgress, parseImportedProgress, countByGrade } from './tracker.js';
import { renderRoadmap, renderMissable } from './roadmap.js';

const listEl = document.getElementById('trophyList');
const emptyEl = document.getElementById('emptyState');
const resultEl = document.getElementById('resultCount');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const earnedOnlyEl = document.getElementById('earnedOnly');
const spoilersEl = document.getElementById('spoilers');
const ioNote = document.getElementById('ioNote');
const progressFill = document.getElementById('progressFill');
const progressCount = document.getElementById('progressCount');
const progressByGrade = document.getElementById('progressByGrade');

const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

let trophies = [];
let earned = loadEarned();
let activeKind = 'all';
let openGuideId = null;

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;

// Spoiler masking: a hidden trophy that is not yet earned shows a masked
// name and description until it is ticked off (or spoilers are switched off).
function isMasked(t) {
  return spoilersEl.checked && t.hidden && !earned.has(t.id);
}

function visibleName(t) {
  return isMasked(t) ? 'Hidden trophy — earn it to reveal' : t.name;
}

function visibleDesc(t) {
  return isMasked(t)
    ? 'This trophy is hidden on PlayStation until earned. Tick it off once you have it to reveal its name and description.'
    : t.description;
}

function trophyMatches(t) {
  if (activeKind !== 'all') {
    if (activeKind === 'online') return false; // no online trophies: all 55 are single-player
    if (activeKind === 'missable') {
      if (!t.missable) return false;
    } else if (t.kind !== activeKind) {
      return false;
    }
  }
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (earnedOnlyEl.checked && !earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  progressFill.style.width = total ? `${Math.round((n / total) * 100)}%` : '0%';
  progressCount.textContent = `${n} of ${total} earned`;
  const byGrade = countByGrade(trophies, earned);
  progressByGrade.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${byGrade[g][0]}/${byGrade[g][1]} ${g}`)
    .join(' · ');
}

function renderCounts() {
  const counts = { all: trophies.length, story: 0, missable: 0, collectibles: 0, activities: 0, online: 0 };
  for (const t of trophies) {
    // The one missable trophy carries kind 'missable', so the kind count
    // alone is the missable count — do not add the flag a second time.
    if (counts[t.kind] !== undefined) counts[t.kind] += 1;
  }
  for (const [k, v] of Object.entries(counts)) {
    const el = document.getElementById('n-' + k);
    if (el) el.textContent = `(${v})`;
  }
}

function renderList() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren();
  emptyEl.hidden = shown.length !== 0;
  resultEl.textContent = shown.length === trophies.length
    ? `Showing all ${trophies.length} trophies`
    : `Showing ${shown.length} of ${trophies.length} trophies`;

  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
    li.id = 'trophy-' + t.id;

    const head = document.createElement('div');
    head.className = 'trophy-head';

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveEarned(earned);
      renderProgress();
      renderList();
      renderRoadmap(document.getElementById('roadmapRoot'), trophies, earned);
      renderMissable(document.getElementById('missableRoot'), trophies, earned);
    });
    head.append(box);

    const title = document.createElement('div');
    title.className = 'trophy-title';
    const h = document.createElement('h3');
    h.textContent = visibleName(t);
    title.append(h);
    const desc = document.createElement('p');
    desc.className = 'desc' + (isMasked(t) ? ' masked' : '');
    desc.textContent = visibleDesc(t);
    title.append(desc);
    head.append(title);

    const badge = document.createElement('span');
    badge.className = 'grade-badge grade-' + t.grade;
    badge.textContent = t.grade;
    head.append(badge);
    li.append(head);

    const tags = document.createElement('div');
    tags.className = 'tag-row';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag kind-' + t.kind;
    kindTag.textContent = KIND_LABELS[t.kind] ?? t.kind;
    // The missable kind already reads "Missable"; the ⚠ flag tag below
    // carries the warning, so skip the kind tag there to avoid doubling it.
    if (t.kind !== 'missable') tags.append(kindTag);
    if (t.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag hidden-flag';
      hiddenTag.textContent = 'Hidden on PS5';
      tags.append(hiddenTag);
    }
    if (t.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = '⚠ Missable';
      tags.append(missTag);
    }
    if (t.count) {
      const countTag = document.createElement('span');
      countTag.className = 'tag';
      countTag.textContent = 'Count: ' + t.count.toLocaleString('en-US');
      tags.append(countTag);
    }
    const stageTag = document.createElement('span');
    stageTag.className = 'tag';
    stageTag.textContent = 'Roadmap stage ' + t.stage;
    tags.append(stageTag);
    li.append(tags);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = openGuideId === t.id ? 'Hide guide ▲' : 'Show guide ▼';
    toggle.setAttribute('aria-expanded', String(openGuideId === t.id));
    toggle.addEventListener('click', () => {
      openGuideId = openGuideId === t.id ? null : t.id;
      renderList();
    });
    li.append(toggle);

    if (openGuideId === t.id) {
      const panel = document.createElement('div');
      panel.className = 'guide-panel';
      if (isMasked(t)) {
        const p = document.createElement('p');
        p.textContent = 'The guide for this trophy is hidden until you earn it — turn off “Hide story spoilers” or tick the trophy to read it.';
        panel.append(p);
      } else {
        const p = document.createElement('p');
        p.textContent = t.guide;
        panel.append(p);
        const src = document.createElement('p');
        src.className = 'source-line';
        const strong = document.createElement('strong');
        strong.textContent = 'Source: ';
        src.append(strong, document.createTextNode(t.source + ' — '));
        const a = document.createElement('a');
        a.href = t.source_url;
        a.rel = 'noopener';
        a.textContent = t.source_url;
        src.append(a);
        const listSrc = document.createElement('span');
        listSrc.textContent = ' · Official list: ' + t.list_source;
        src.append(listSrc);
        panel.append(src);
      }
      li.append(panel);
    }

    listEl.append(li);
  }
}

function renderAll() {
  renderProgress();
  renderCounts();
  renderList();
  renderRoadmap(document.getElementById('roadmapRoot'), trophies, earned);
  renderMissable(document.getElementById('missableRoot'), trophies, earned);
}

// Tabs.
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('view-' + tab.dataset.view).classList.add('active');
  });
});

function showView(name) {
  const tab = document.querySelector(`.tab[data-view="${name}"]`);
  if (tab) tab.click();
}

// Kind filter chips.
document.querySelectorAll('.chip[data-kind]').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip[data-kind]').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    activeKind = chip.dataset.kind;
    renderList();
  });
});

searchEl.addEventListener('input', renderList);
gradeEl.addEventListener('change', renderList);
earnedOnlyEl.addEventListener('change', renderList);
spoilersEl.addEventListener('change', renderList);

// Export / import / reset.
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([exportProgress(earned)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  ioNote.textContent = `Exported ${earned.size} earned trophies.`;
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = parseImportedProgress(await file.text());
    saveEarned(earned);
    renderAll();
    ioNote.textContent = `Imported ${earned.size} earned trophies from ${file.name}.`;
  } catch {
    ioNote.textContent = 'That file is not a valid progress export.';
  }
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies? This cannot be undone.')) return;
  earned = new Set();
  saveEarned(earned);
  renderAll();
  ioNote.textContent = 'Progress cleared.';
});

// Deep links: #trophy=<id> opens that trophy's guide; #view=roadmap (or
// missable / sources) switches tab. Used by the roadmap chips and by links.
function applyHash() {
  const hash = new URLSearchParams(location.hash.slice(1));
  const view = hash.get('view');
  if (view) showView(view);
  const tid = Number(hash.get('trophy'));
  if (Number.isInteger(tid) && trophies.some((t) => t.id === tid)) {
    openGuideId = tid;
    showView('checklist');
    renderList();
    document.getElementById('trophy-' + tid)?.scrollIntoView({ block: 'center' });
  }
}
window.addEventListener('hashchange', applyHash);

renderAll();
applyHash();
