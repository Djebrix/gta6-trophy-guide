// tracker.js — earned-trophy state for the Leonida Legend guide.
// Progress lives only in this browser's localStorage and in files the user
// exports; nothing is sent anywhere.
export const STORAGE_KEY = 'leonida-legend-progress-v1';

// Load the set of earned trophy ids (numbers). Corrupt data is ignored.
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

// Persist the earned set.
export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

// Serialise progress for export: ids plus a small header so imports can be checked.
export function exportProgress(earned) {
  return JSON.stringify(
    { app: 'leonida-legend-gta6', version: 1, earned: [...earned].sort((a, b) => a - b) },
    null,
    2,
  );
}

// Parse an imported file. Accepts our own export shape, or a bare array of ids.
export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  const out = new Set();
  for (const n of ids) {
    if (Number.isInteger(n) && n >= 1 && n <= 55) out.add(n);
  }
  return out;
}

// Count earned trophies per grade for the progress line.
export function countByGrade(trophies, earned) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    if (!counts[t.grade]) continue;
    counts[t.grade][1] += 1;
    if (earned.has(t.id)) counts[t.grade][0] += 1;
  }
  return counts;
}
