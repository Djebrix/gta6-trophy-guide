// roadmap.js — the road to the platinum, in three stages, built from the
// official trophy descriptions and the PowerPyx roadmap (see Sources).
// Stage 1 is the story playthrough, stage 2 the 100% checklist cleanup,
// stage 3 the stranger strands and the five still-unconfirmed trophies.
export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story, start everything early',
    time: '60–80 hours',
    intro:
      'Finish the 5 chapters and enjoy the game. The 100% checklist is not viewable until after the story, but progress made during the story already counts toward it. There are no mission gold medals and no mission replay, so you never need to chase hidden objectives inside a mission — just keep a manual save at the start and end of each chapter (15 manual slots, 1 autosave).',
    steps: [
      'Play the story through Chapters 1–5. All 12 chapter and mission trophies pop as you go: Gone Fishing, the four chapter completions, the final mission, and Breakfast Run, The Cartel Heist, Child’s Play, Headliners, VCIA Takedown and Operation Savage Glory.',
      'Do the one thing that can be missed: the Chapter 1 balcony meditation for Positive Mental Attitude (see the Missable tab). Everything else story-related stays available afterwards.',
      'Start the side questlines as they are marked: Kenton in Chapter 1, Billy and Bret after Coffee Break in Chapter 2, Andy, Randy and Tyrone in Chapter 3. Their final missions each carry a trophy, and none of them is missable.',
      'Scan vehicles with the WAiNK app (hold Up, then R1) and study animals through the binoculars whenever you meet new ones — the 100% checklist needs 200 of 277 vehicles and 100 of 255 animals, and early scanning finishes most of it for free.',
      'Do optional missions as they appear (purple icons, and black icons with pink letters). Any 100 count toward the checklist, and there are far more than 100 in the game.',
    ],
  },
  {
    stage: 2,
    title: 'Stage 2 — The 100% checklist and the grind trophies',
    time: 'about 100 hours',
    intro:
      'After the credits you return to free-roam and the checklist unlocks under Progress, then Stats, then 100% Completion. It is lenient — closer to 60% true completion — and the gold trophy A Long Road pops when it hits 100%.',
    steps: [
      'Work the checklist in any order: 100 optional missions, 200 vehicles scanned, 100 animals studied, 70 of 80 challenges, 300 stunts, all robberies, all underwater discoveries, all shooting ranges, all drone races, all of Bret’s Target Decks.',
      'Robberies are the backbone of this stage: all 8 large bank vaults (Maximum Withdrawal, and the money for Dime on the Dollar), all 39 illegal gang operations (Pest Control), the armored trucks, and the jewelry stores. They also fund the $160,000 of garages and the $100,000 of shopping.',
      'Clear the counted grinds: 250 stunts (Cunning Stunts), gold in all 42 shooting-range challenges (The Shootist), a drone-race win at all 14 locations (Top Fun), 20 different race wins (Earn Cash, Not Kudos), 3 card sets, 100 WAiNK scans, 100 vehicles discovered, the whole map unfogged.',
      'Finish the money and property trophies together: launder $250,000 of marked bills (needs the Dye Pack Jammer from Credit Check in Chapter 3), spend $100,000 across shops, buy all 8 garages, register 10 vehicles in the Scooter Bros app.',
      'Let the passive trophies land: 500 criminal-profile actions (Actions Speak Louder) and 50 challenges (One Last Thing) should both be close to done by now.',
    ],
  },
  {
    stage: 3,
    title: 'Stage 3 — Strangers, cleanup, and the last unknowns',
    time: 'about 10 hours',
    intro:
      'Strangers & Freaks strands are not needed for 100%, so this stage is for whatever is left — and for the five trophies whose unlock method was still unconfirmed at launch.',
    steps: [
      'Complete 8 stranger mission strands. Only certain questlines count — Kirk, Kyle, Yago and Pilot Pete are confirmed; Moses, Tyrone, Yasmani, Andy, Billy and Eddie do not count. The trophy tracker in the trophy list shows your count.',
      'Check the five unconfirmed trophies (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin) against the Sources tab for the latest community findings — their guides here carry the best current lead, not a guess presented as fact.',
      'Sweep the stragglers: any missed meditation spots (15 of 18 are enough for 100%, but the trophy needs every spot), any unrobbed gang operation, any unraced location.',
      'When the last trophy before the platinum pops, Vice Got a Price! follows immediately. Total: around 200 hours, difficulty about 4/10 — long, not hard.',
    ],
  },
];

// Render the roadmap stages into a container, marking each trophy chip
// earned when it is in the earned set.
export function renderRoadmap(root, trophies, earned) {
  root.replaceChildren();
  for (const s of ROADMAP_STAGES) {
    const section = document.createElement('section');
    section.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = s.title + ' ';
    const time = document.createElement('span');
    time.className = 'stage-time';
    time.textContent = '· ' + s.time;
    h.append(time);
    section.append(h);

    const intro = document.createElement('p');
    intro.textContent = s.intro;
    section.append(intro);

    const list = document.createElement('ul');
    for (const step of s.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      list.append(li);
    }
    section.append(list);

    const chips = document.createElement('div');
    chips.className = 'chip-list';
    for (const t of trophies.filter((t) => t.stage === s.stage)) {
      const chip = document.createElement('span');
      chip.className = 'mini-chip' + (earned.has(t.id) ? ' done' : '') + (t.missable ? ' miss' : '');
      chip.textContent = (earned.has(t.id) ? '✓ ' : '') + t.name + (t.missable ? ' ⚠ missable' : '');
      chips.append(chip);
    }
    section.append(chips);
    root.append(section);
  }
}

// Render the missable-and-warnings tab.
export function renderMissable(root, trophies, earned) {
  root.replaceChildren();

  const warn = document.createElement('div');
  warn.className = 'callout danger';
  const wh = document.createElement('h3');
  wh.textContent = '⚠ One potentially missable trophy';
  warn.append(wh);
  const wp = document.createElement('p');
  wp.textContent =
    'Positive Mental Attitude is the only trophy reported as possibly missable. There is no mission replay and no New Game+, so a missed Chapter 1 meditation may mean a second playthrough. Every other trophy stays available in free-roam after the story.';
  warn.append(wp);
  root.append(warn);

  const missable = trophies.filter((t) => t.missable);
  for (const t of missable) {
    const card = document.createElement('article');
    card.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
    const h = document.createElement('h3');
    h.textContent = t.name + ' — ' + t.description;
    card.append(h);
    const g = document.createElement('p');
    g.textContent = t.guide;
    card.append(g);
    const src = document.createElement('p');
    src.className = 'source-line';
    src.innerHTML = '';
    const strong = document.createElement('strong');
    strong.textContent = 'Source: ';
    src.append(strong, document.createTextNode(t.source + ' — '));
    const a = document.createElement('a');
    a.href = t.source_url;
    a.rel = 'noopener';
    a.textContent = t.source_url;
    src.append(a);
    card.append(src);
    root.append(card);
  }

  const save = document.createElement('div');
  save.className = 'callout';
  const sh = document.createElement('h3');
  sh.textContent = 'Save discipline (no mission replay)';
  save.append(sh);
  const sp = document.createElement('p');
  sp.textContent =
    'GTA 6 has 15 manual save slots and 1 autosave slot, and no mission replay. Keep a save at the start and end of each chapter (10 saves), then rotate the remaining 5 for free-roam cleanup. Keep a manual save before the final mission. Never use cheats on your trophy save: cheats disable trophies and saving. Source: PowerPyx roadmap.';
  save.append(sp);
  root.append(save);

  const other = document.createElement('div');
  other.className = 'callout';
  const oh = document.createElement('h3');
  oh.textContent = 'What cannot lock you out';
  other.append(oh);
  const op = document.createElement('p');
  op.textContent =
    'Optional missions that disappear, quest givers who go temporarily unavailable (Kenton returns in Chapters 2–3), fences that close, and time-sensitive quests with an hourglass icon do not affect trophies or 100% completion — there are always more optional missions than the 100 needed. The relationship status of Jason and Lucia does not matter for trophies. Source: PowerPyx roadmap.';
  other.append(op);
  root.append(other);
}
