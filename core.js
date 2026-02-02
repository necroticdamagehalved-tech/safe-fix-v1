
function getPerkSlots(level) {
  if (level < 1) return 0;
  return Math.floor((level + 1) / 2);
}

import { PERKS } from './data/perks.js';

/* === Perk Gating (Phase 3) === */
const PERK_PICK_LEVELS = [1,3,6,9,12,15,18,21,24,27,30];

function isPerkPickLevel(level){
  return PERK_PICK_LEVELS.includes(level);
}

function getAllowedPerkPicks(level){
  return PERK_PICK_LEVELS.filter(l => l <= level).length;
}

function getTotalChosenPerks(){
  const m = state.perksChosen || {};
  return Object.values(m).reduce((a,b)=>a+(Number(b)||0),0);
}

function getRemainingPerkPicks(){
  return getAllowedPerkPicks(state.level||1) - getTotalChosenPerks();
}

function getPerkOwned(perkId){
  return Number((state.perksChosen||{})[perkId]||0);
}

function skillValue(skillId){
  try { return Number(getSkillMod(skillId)) || 0; } catch(e){ return 0; }
}

function perkNextRank(perk){
  const owned = getPerkOwned(perk.id);
  const max = (perk.ranks||[]).length;
  return { owned, max, nextIndex: owned, hasNext: owned < max };
}

function checkPerkReq(perk){
  const r = perk.req || {};
  const missing = [];
  const lvlReq = Number(r.level||0);
  const level = Number(state.level||1);
  if(level < lvlReq) missing.push(`Level ${lvlReq}`);

  const sReq = r.special || {};
  Object.keys(sReq).forEach(k => {
    const need = Number(sReq[k]);
    const have = Number(state.special?.[k]||0);
    if(have < need) missing.push(`${k} ${need}`);
  });

  const skReq = r.skills || {};
  Object.keys(skReq).forEach(id => {
    const need = Number(skReq[id]);
    const have = skillValue(id);
    if(have < need) missing.push(`${id} ${need}`);
  });

  return { ok: missing.length===0, missing };
}

function canPickPerkNow(perk){
  const level = Number(state.level||1);
  if(!isPerkPickLevel(level)) return { ok:false, reason:'No perk pick at this level.' };
  if(getRemainingPerkPicks() <= 0) return { ok:false, reason:'No remaining perk picks.' };
  const pr = perkNextRank(perk);
  if(!pr.hasNext) return { ok:false, reason:'Max rank.' };
  const req = checkPerkReq(perk);
  if(!req.ok) return { ok:false, reason:'Requirements not met.', missing:req.missing };
  return { ok:true, reason:'' };
}

function pickPerk(perkId){
  const perk = PERKS.find(p => p.id === perkId);
  if(!perk) return;
  const gate = canPickPerkNow(perk);
  if(!gate.ok) return;
  if(!state.perksChosen) state.perksChosen = {};
  state.perksChosen[perkId] = getPerkOwned(perkId) + 1;
  renderAll();
}

function unpickPerk(perkId){
  const owned = getPerkOwned(perkId);
  if(owned <= 0) return;
  state.perksChosen[perkId] = owned - 1;
  if(state.perksChosen[perkId] <= 0) delete state.perksChosen[perkId];
  renderAll();
}
export const state = {
  creationBonus: null,
  name: '',
  level: 1,
  perksChosen: {},
  age: '',
  gender: '',
  background: '',
  raceId: '',
  subsetId: '',
  special: { STR:5, PER:5, END:5, CHA:5, INT:5, AGI:5, LCK:5 },
  specialPool: 5,
  perks: []
};

export const RACES = {"human":{"id":"human","name":"Human","hpBase":10,"drBase":2,"notes":[{"name":"+1 Luck","desc":"LCK +1."},{"name":"+1 Tagged Skill","desc":"Gain +1 Tagged Skill at creation (applied in Skills step)."},{"name":"Versatile","desc":"Once between rests, choose one roll to attempt again."},{"name":"Meat & Bone","desc":"Takes full damage from radiation, disease, and poison (no immunities)."}],"subsets":{"vault_dweller":{"id":"vault_dweller","name":"Vault-Dweller","notes":[{"name":"VATS Protocol","desc":"Once per encounter, spend 2 AP: roll 3 attacks, choose 2 to apply damage (includes crits if rolled)."},{"name":"Pre-War Conditioning","desc":"Gain +1 to INT or PER (player choice; obey 1–10 cap)."},{"name":"Soft Hands (+1 dmg taken, -1 dmg dealt melee/unarmed)","desc":"Take +1 damage from melee and unarmed attacks."},{"name":"Naive Outlook","desc":"-2 on your first peaceful interaction with any new settlement or faction."}]},"raider":{"id":"raider","name":"Raider","notes":[{"name":"Fight Dirty","desc":"Gain +1 to all Guns and Survival rolls."},{"name":"Adrenaline Surge (Gain +2 AP)","desc":"When reduced below half HP, gain +1 AP immediately (once per encounter)."},{"name":"Social Pariah","desc":"-2 to Speech and Barter with non-raider NPCs. Double penalty (-4) in protected towns or NCR/Brotherhood territory."},{"name":"Chem Ghosts","desc":"When you take any chem, roll TN 15 at session end. Fail = disadvantage on all rolls next scene (withdrawal)."}]},"scavver":{"id":"scavver","name":"Scavver","notes":[{"name":"Junk Whisperer","desc":"Once per day when looting a site, roll twice and choose the better result (loot/parts/discoveries)."},{"name":"Light Footed","desc":"+1 on Sneak and Lockpick checks in ruined or urban environments."},{"name":"Exposure Magnet","desc":"Radaway is only Half as effective"},{"name":"Patchwork Gear","desc":"Start with 1 Repair Kit, 1 additional Scrap Armor piece, and advantage on your first Scavenging roll in new locations."}]}}},"ghoul":{"id":"ghoul","name":"Ghoul","hpBase":12,"drBase":2,"notes":[{"name":"SPECIAL Modifiers","desc":"END +1, CHA -1."},{"name":"Radiation Sustenance (1 HP per 50 RAD gained)","desc":"Radiation heals you instead of killing you. Gain +5 HP for every 2 RAD gained (round down). RAD damage never kills you, even at 1000."},{"name":"Wasteland Diet","desc":"Can safely eat irradiated food, contaminated water, rotten or glowing meat. No sickness, no penalties, no checks required."},{"name":"Feral Edge","desc":"At 700+ RAD, roll TN 15 after each long rest. Failure: -1 AP for the next encounter."},{"name":"Tainted Stims","desc":"Stimpaks heal half their normal value. RadAway harms you, dealing 1d10 HP damage."}],"subsets":{"settled":{"id":"settled","name":"Settled Ghoul","notes":[{"name":"Dust-Walker","desc":"Immune to environmental hazards that rely on skin contact: sandstorms, irritant spores, mild chem clouds."},{"name":"Veteran Perspective","desc":"Once per session, after seeing a bad outcome, reroll a failed Perception, Speech, or Barter check."},{"name":"Brittle Remains","desc":"Take +1 damage from critical hits."}]},"glowing":{"id":"glowing","name":"Glowing Ghoul","notes":[{"name":"Fallout Aura","desc":"Once per encounter, spend 2 AP to release a rad pulse: all creatures within Close range take 1d100 RAD."},{"name":"Glimmering Instincts","desc":"Gain +1 to Sneak and Survival in irradiated zones."},{"name":"Visible Mutant","desc":"Automatic disadvantage on stealth in completely dark areas — you faintly glow."}]},"feral_tethered":{"id":"feral_tethered","name":"Feral-Tethered","notes":[{"name":"Feral Strength","desc":"When below half HP, gain +1 damage to Melee & Unarmed and +1 STR (temporary; does not exceed cap)."},{"name":"Predator Sense","desc":"+2 to Perception sight/scent checks against living creatures at Close/Near range."},{"name":"Mind Slips","desc":"At 600+ RAD, roll TN 15 after every encounter. Fail: lose 1 AP next encounter. Fail twice in a row: attack nearest target at start of next round (friend or foe)."},{"name":"Unnatural Mannerisms","desc":"-2 to all Speech rolls. Humans fear you; mutants mistrust you."}]}}},"robot":{"id":"robot","name":"Robot","hpBase":15,"drBase":4,"notes":[{"name":"SPECIAL Modifiers","desc":"CHA -1."},{"name":"Luck Cap","desc":"Cannot increase LUCK above 8."},{"name":"Built-In Armor Plating","desc":"Robots cannot wear armor. Gain DR 4 against all physical damage. Upgrades possible later via crafting."},{"name":"Mechanical Condition","desc":"Immune to radiation, poison, disease, suffocation, and drowning. Does not eat, drink, or sleep."},{"name":"EMP Vulnerability","desc":"Energy surge or EMP attacks deal double damage to robots."},{"name":"Programmed Personality","desc":"-2 to Speech and Barter rolls with organics unless imitating/spoofing emotion."},{"name":"Shutdown / Reboot","desc":"When reduced to 0 HP, roll 1d10: 1–3 Shutdown (reboot after rest); 4–10 System reboot after 10 minutes at 1 HP."},{"name":"Repair & Recovery","desc":"Robots cannot heal naturally. Rest does nothing without repair. Repair/Science: 10 minutes restore 1d6 HP; 1 hour + parts restore 2d6 HP."},{"name":"Med-X Glitch Chance","desc":"Med-X gives DR +1 (stacking) for 1 encounter; 1-in-10 glitch: on a 10, lose 1 AP that round due to lag."}],"subsets":{"handy":{"id":"handy","name":"Mr. Handy / Miss Nanny","notes":[{"name":"Multitasking Arms","desc":"Take two Interact actions per round for 1 AP total (e.g., reload + use item)."},{"name":"Utility Programming","desc":"Gain +1 to Medicine and Repair checks."},{"name":"Lightweight Frame (Reduces base DR from 4 to 3)","desc":"Built-in DR is reduced from 4 to 3."},{"name":"Obedience Ghosts","desc":"Once per session, GM may call TN 15 INT check. Fail = spend next turn helping an ally against your tactical judgment."}]},"protectron":{"id":"protectron","name":"Protectron","notes":[{"name":"Hardened Chassis (Increases base DR from 4 to 5)","desc":"Built-in DR increases from 4 to 5."},{"name":"Duty Protocol","desc":"Gain +2 to Speech, Barter, or Intimidation, but only when enforcing a rule, law, or agreement (real or imagined)."},{"name":"Limited Mobility","desc":"Move one range band for 2 AP. Cannot Sprint without upgrades or power mods."},{"name":"Literal Mind","desc":"Automatically fail checks requiring sarcasm, slang, or subtle humor."}]},"robobrain":{"id":"robobrain","name":"Robobrain","notes":[{"name":"Tactical Processor","desc":"Once per encounter, treat a failed roll as a success (does not work on critical failures)."},{"name":"Analytical Mind","desc":"Gain +1 to Science and Perception checks."},{"name":"Organic Dependency","desc":"Each long rest consumes 1 chem, RadAway, purified water, or equivalent. Failure: start next day with -2 INT and PER until fed."},{"name":"Vulnerable Core","desc":"Headshots ignore your built-in DR. The jar is a weak point."}]}}},"mutant":{"id":"mutant","name":"Super Mutant","hpBase":20,"drBase":5,"notes":[{"name":"SPECIAL","desc":"STR base 9 (pool unchanged). CHA roll modifier -2. INT roll modifier -4."},{"name":"Too Dumb to Die","desc":"When reduced to 0 HP, roll 1d10: 1–2 collapse; 3–10 stay standing at 1 HP (once per encounter). If you would die again in same fight, collapse normally."},{"name":"Meat Mountain","desc":"Always count as lightly armored: gain DR 1 baseline on top of any armor/DR effects."},{"name":"Big, Loud, and Obvious","desc":"Cannot hide easily: stealth in open terrain auto-fails; enemies gain +2 on Awareness to detect you; you always count as obvious for ambush rules."},{"name":"Thick-Skulled","desc":"-1 to Science, Medicine, and Repair rolls. Complex logic/speech checks may require GM approval."},{"name":"Radiation & Immunities","desc":"Do not gain RADs. Immune to disease and poison."},{"name":"Healing Rules","desc":"Stimpaks heal HALF. Eating raw mutant meat or animal flesh heals 1d6 HP. Mutant-specific chems heal full."}],"subsets":{"nightkin":{"id":"nightkin","name":"Nightkin","notes":[{"name":"Cloaking Instinct","desc":"Spend 2 AP to activate invisibility for one full round. Attacks from invisibility gain +2 to hit. Breaking stealth ends invisibility early."},{"name":"Ghost in the Wastes","desc":"Ignore inherent Super Mutant stealth penalties. Gain +1 to Sneak and Perception."},{"name":"Stealth Boy Dependency","desc":"At end of each session, roll TN 15. Fail: disadvantage on Perception checks next session."},{"name":"Skin-Crawl Paranoia","desc":"-2 to Speech during tense negotiations."}]},"first_gen":{"id":"first_gen","name":"First Generation","notes":[{"name":"Vestiges of Genius","desc":"Choose one at character creation: Science, Medicine, or Speech. Treated as tagged even if not chosen normally."},{"name":"Pre-War Memory Echo","desc":"Once per long rest, reroll a failed INT-based check."},{"name":"Aging Conversion","desc":"Regeneration no longer activates. Healing from food/chems reduced by 1 HP per die (minimum 1)."},{"name":"Heavier Burden","desc":"Carry capacity bonus from mutation is reduced by 5."}]},"hound_master":{"id":"hound_master","name":"Hound Master","notes":[{"name":"Bonded Hound","desc":"Begin play with a Mutant Hound companion. Acts on your initiative. Costs 2 AP to command. Gets one free attack per round when commanded."},{"name":"Pack Tactics","desc":"If you and your hound attack the same target in a round, both attacks deal +1 damage."},{"name":"Pack Responsibility","desc":"If your hound drops to 0 HP: take 1d6 emotional stress damage instantly; all attacks suffer -1 to hit for rest of combat."},{"name":"Distracted Protector","desc":"-2 to ranged attacks at Near range or further."}]}}}};


export function initTabs(){
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach(p => p.classList.toggle('active', p.id === target));
    });
  });
}

export function initBuildSubTabs(){
  const subTabs = document.querySelectorAll('.subtab');
  const subPanels = {
    identity: document.getElementById('build-identity'),
    race: document.getElementById('build-race'),
    special: document.getElementById('build-special'),
    skills: document.getElementById('build-skills'),
    perks: document.getElementById('build-perks')
  };

  subTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.subtab;

      subTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.keys(subPanels).forEach(k => {
        subPanels[k].classList.toggle('active', k === target);
      });
    });
  });
}

export function initState(){
  const nameI = document.getElementById('nameInput');
  const levelI = document.getElementById('levelInput');
  const ageI = document.getElementById('ageInput');
  const genderI = document.getElementById('genderInput');
  const bgI = document.getElementById('bgInput');

  nameI.addEventListener('input', e => { state.name = e.target.value; renderAll(); });
  levelI.addEventListener('input', e => { state.level = Math.min(30, Math.max(1, parseInt(e.target.value) || 1)); renderAll(); });
  ageI.addEventListener('input', e => { state.age = e.target.value; renderAll(); });
  genderI.addEventListener('input', e => { state.gender = e.target.value; renderAll(); });
  bgI.addEventListener('input', e => { state.background = e.target.value; renderAll(); });

  renderAll();
}

export function initRaces(){
  const list = document.getElementById('raceList');
  if(!list) return;

  list.innerHTML = '';

  Object.values(RACES).forEach(r => {
    const card = document.createElement('button');
    card.className = 'race-card';
    card.type = 'button';
    card.dataset.raceId = r.id;

    card.innerHTML = `
      <div class="race-card-name">${r.name}</div>
      <div class="race-card-stats">HP Base ${r.hpBase} • DR ${r.drBase}</div>
    `;

    card.addEventListener('click', () => {
      state.raceId = r.id;
      state.subsetId = '';
      resetSpecial();
      if(document.getElementById('specialGrid')){ initSpecial(); }

      document.querySelectorAll('.race-card').forEach(el => {
        el.classList.toggle('active', el.dataset.raceId === r.id);
      });

      renderAll();
    });

    list.appendChild(card);
  });

  renderAll();
}

function getRace(){
  return state.raceId ? RACES[state.raceId] : null;
}

function getSubset(race){
  if(!race) return null;
  return state.subsetId ? (race.subsets?.[state.subsetId] || null) : null;
}

function computeDrBase(race, subset){
  const base = race ? race.drBase : null;
  if(base == null) return null;
  const mod = subset && typeof subset.drMod === 'number' ? subset.drMod : 0;
  return base + mod;
}

function renderTraits(el, notes){
  if(!el) return;
  if(!notes || notes.length === 0){
    el.innerHTML = '<span class="muted">—</span>';
    return;
  }
  el.innerHTML = notes.map(n => `
    <div class="trait">
      <strong>${n.name}</strong>
      <div class="muted">${n.desc}</div>
    </div>
  `).join('');
}

function renderSubsetList(race){
  const list = document.getElementById('subsetList');
  if(!list) return;

  list.innerHTML = '';

  if(!race) return;

  const subsets = race.subsets ? Object.values(race.subsets) : [];

  subsets.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'subset-card';
    btn.type = 'button';
    btn.dataset.subsetId = s.id;
    btn.innerHTML = `<div class="subset-name">${s.name}</div>`;

    btn.addEventListener('click', () => {
      state.subsetId = s.id;
      resetSpecial();
      if(document.getElementById('specialGrid')){ initSpecial(); }
      document.querySelectorAll('.subset-card').forEach(el => {
        el.classList.toggle('active', el.dataset.subsetId === s.id);
      });
      renderAll();
    });

    list.appendChild(btn);
  });

  if(state.subsetId){
    document.querySelectorAll('.subset-card').forEach(el => {
      el.classList.toggle('active', el.dataset.subsetId === state.subsetId);
    });
  }
}

function renderRacePanel(){
  const race = getRace();
  const subset = getSubset(race);

  document.getElementById('raceName').textContent = race ? race.name : 'None';
  document.getElementById('raceHpBase').textContent = race ? race.hpBase : '—';

  const dr = race ? computeDrBase(race, subset) : null;
  document.getElementById('raceDrBase').textContent = dr == null ? '—' : dr;

  renderTraits(document.getElementById('raceTraits'), race ? race.notes : []);
  renderSubsetList(race);
  renderTraits(document.getElementById('subsetTraits'), subset ? subset.notes : []);
}

function renderSheet(){
  document.getElementById('sName').textContent = state.name;
  document.getElementById('sLevel').textContent = state.level;
  document.getElementById('sAge').textContent = state.age;
  document.getElementById('sGender').textContent = state.gender;
  document.getElementById('sBg').textContent = state.background;

  const race = getRace();
  const subset = getSubset(race);

  document.getElementById('sRace').textContent = race ? race.name : '—';
  document.getElementById('sSubset').textContent = subset ? subset.name : '—';

  document.getElementById('sHpBase').textContent = race ? race.hpBase : '—';

  const dr = race ? computeDrBase(race, subset) : null;
  document.getElementById('sDrBase').textContent = dr == null ? '—' : dr;
}

function renderAll(){
  renderSkills();
  renderSheet();
  renderPerks();
  if(document.getElementById('raceName')) renderRacePanel();
}

export function writeBuildId(tag){
  const el = document.getElementById('buildId');
  if(!el) return;
  const stamp = new Date().toISOString();
  el.textContent = `${tag} • ${stamp}`;
}



export function initSpecial(){
  const grid = document.getElementById('specialGrid');
  const poolEl = document.getElementById('specialPool');
  if(!grid || !poolEl) return;

  recalcSpecialForCurrentSelections();

  const STATS = ['STR','PER','END','CHA','INT','AGI','LCK'];

  

  // Pre-War Conditioning UI
  const prewarWrap = document.getElementById('prewarChoice');
  if(prewarWrap){
    prewarWrap.remove();
  }

  if(state.raceId === 'human' && state.subsetId === 'vault_dweller'){
    const wrap = document.createElement('div');
    wrap.id = 'prewarChoice';
    wrap.className = 'prewar-box';

    const title = document.createElement('div');
    title.textContent = 'Pre-War Conditioning (+1 INT or +1 PER)';
    wrap.appendChild(title);

    ['INT','PER'].forEach(stat=>{
      const btn = document.createElement('button');
      btn.textContent = '+1 ' + stat;

      const blocked = state.special[stat] + getCreationBonus(stat) >= getStatCap(stat);
      btn.disabled = blocked;

      if(state.creationBonus === stat){
        btn.classList.add('active');
      }

      btn.onclick = ()=>{
        setCreationBonus(stat);
        initSpecial();
      };

      wrap.appendChild(btn);
    });

    grid.parentElement.insertBefore(wrap, grid);
  }


  function render(){
    poolEl.textContent = String(state.specialPool);
    grid.innerHTML = '';

    STATS.forEach(stat => {
      const row = document.createElement('div');
      row.className = 'special-row';

      const minus = document.createElement('button');
      minus.type = 'button';
      minus.textContent = '−';
      minus.disabled = !canDecrease(stat);
      minus.addEventListener('click', () => change(stat, -1));

      const label = document.createElement('div');
      label.className = 'stat';
      label.textContent = stat;

      const val = document.createElement('div');
      val.className = 'val';
      const score = state.special[stat] + getCreationBonus(stat);
      const scoreDerived = scoreToMod(score);
      const hard = getHardOverrideMod(stat, scoreDerived);
      const mod = hard + getRacialModDelta(stat);
      val.textContent = `${score} [${fmtMod(mod)}]`;

      const plus = document.createElement('button');
      plus.type = 'button';
      plus.textContent = '+';
      plus.disabled = !canIncrease(stat);
      plus.addEventListener('click', () => change(stat, +1));

      row.appendChild(minus);
      row.appendChild(label);
      row.appendChild(val);
      row.appendChild(plus);
      grid.appendChild(row);
    });
  }

  function change(stat, delta){
    if(delta > 0 && !canIncrease(stat)) return;
    if(delta < 0 && !canDecrease(stat)) return;

    if(delta > 0){
      state.special[stat] += 1;
      state.specialPool -= 1;
    } else {
      state.special[stat] -= 1;
      state.specialPool += 1;
    }

    render();
  }

  render();
}



/* ===== PHASE 2: ALLOCATION RULES ===== */

export function getStatCap(stat){
  if(state.raceId === 'robot' && stat === 'LCK'){
    return 8;
  }
  return 10;
}

export function canIncrease(stat){
  if(state.specialPool <= 0) return false;
  if(state.special[stat] >= getStatCap(stat)) return false;
  return true;
}

export function canDecrease(stat){
  if(state.special[stat] <= 1) return false;
  return true;
}

export function resetSpecial(){
  if(state.raceId !== 'human' || state.subsetId !== 'vault_dweller'){ state.creationBonus = null; }
  state.special = {
    STR:5, PER:5, END:5, CHA:5, INT:5, AGI:5, LCK:5
  };
  state.specialPool = 5;
}


/* ===== PHASE 3: MODIFIER DISPLAY ===== */
function scoreToMod(score){
  return score - 5;
}
function fmtMod(mod){
  if(mod >= 0) return `+${mod}`;
  return `${mod}`;
}


/* Phase 6.2.2: export stat modifier for Skills and other tabs */
export function getModifier(stat){
  const score = state.special[stat] + getCreationBonus(stat);
  const scoreDerived = scoreToMod(score);
  const hard = getHardOverrideMod(stat, scoreDerived);
  return hard + getRacialModDelta(stat);
}


/* ===== PHASE 4: RACE/SUBTYPE INTEGRATION ===== */

function isMutantFamily(){
  // In this app's current data model, Super Mutant race id is "mutant"
  return state.raceId === 'mutant';
}

function isFirstGenMutant(){
  return isMutantFamily() && state.subsetId === 'first_gen';
}

function isMutantSubtype(){
  // Nightkin + Hound Master are subsets under mutant
  return isMutantFamily() && (state.subsetId === 'nightkin' || state.subsetId === 'hound_master' || state.subsetId === '');
}

function getRacialBaseOverride(stat){
  // Only mutant STR base overrides in Phase 4
  if(stat === 'STR' && isMutantFamily()){
    return isFirstGenMutant() ? 7 : 9;
  }
  return null;
}

function getRacialModDelta(stat){
  // Additive deltas (applied after scoreToMod), except mutant INT which is a hard override.
  let d = 0;

  if(state.raceId === 'human'){
    if(stat === 'LCK') d += 1;
  }

  if(state.raceId === 'ghoul'){
    if(stat === 'END') d += 1;
    if(stat === 'CHA') d -= 1;
    if(state.subsetId === 'feral_tethered' && stat === 'CHA') d -= 2;
  }

  if(state.raceId === 'robot'){
    if(stat === 'CHA') d -= 1;
  }


  // Mutant INT buy-out penalty (additive)
  if(isMutantFamily() && stat === 'INT'){
    d -= (isFirstGenMutant() ? 2 : 4);
  }

  // Raider/Scavver skill mods handled in Skills phase, not here.

  return d;
}

function getHardOverrideMod(stat, scoreDerived){
  // Phase 4.1: no hard overrides, return base score-derived mod
  return scoreDerived;
}
function applyBaseOverrides(){
  // Apply base overrides to current SPECIAL without touching pool.
  // If current STR is below the override, lift it up. If above, leave it (spent points).
  // If switching to First Gen (base 7) from base 9, do not auto-refund points; keep current score unless below 7.
  const strBase = getRacialBaseOverride('STR');
  if(strBase !== null){
    if(state.special.STR < strBase){
      state.special.STR = strBase;
    }
  }
}


function normalizeCapsOnRaceChange(){
  // If robot and LCK > 8, clamp to 8 and refund pool by the removed amount.
  if(state.raceId === 'robot'){
    const over = state.special.LCK - 8;
    if(over > 0){
      state.special.LCK = 8;
      state.specialPool += over;
    }
  }
}


/* ===== PHASE 5: STATE INTEGRITY ===== */

export function recalcSpecialForCurrentSelections(){
  // Apply base floors (mutant STR bases) without touching pool.
  applyBaseOverrides();

  // Enforce allocation caps that can become invalid after selection changes.
  normalizeCapsOnRaceChange();
}


/* ===== PHASE 5.5: PRE-WAR CONDITIONING ===== */

export function getCreationBonus(stat){
  if(state.creationBonus === stat) return 1;
  return 0;
}

export function setCreationBonus(stat){
  if(stat !== 'INT' && stat !== 'PER') return;

  // Prevent overflow
  const base = state.special[stat];
  if(base + 1 > getStatCap(stat)) return;

  state.creationBonus = stat;
}



/* ===== PHASE 6.2 — SKILLS (LIST + TAGS + GOVERNING SPECIAL) ===== */

export const SKILLS = [
  { id:'guns', name:'Guns', stat:'AGI' },
  { id:'energy_weapons', name:'Energy Weapons', stat:'INT' },
  { id:'explosives', name:'Explosives', stat:'PER' },
  { id:'melee_weapons', name:'Melee Weapons', stat:'STR' },
  { id:'unarmed', name:'Unarmed', stat:'END' },
  { id:'sneak', name:'Sneak', stat:'AGI' },
  { id:'lockpick', name:'Lockpick', stat:'PER' },
  { id:'speech', name:'Speech', stat:'CHA' },
  { id:'barter', name:'Barter', stat:'CHA' },
  { id:'survival', name:'Survival', stat:'END' },
  { id:'medicine', name:'Medicine', stat:'INT' },
  { id:'repair', name:'Repair', stat:'INT' },
  { id:'science', name:'Science', stat:'INT' }
];

export function getTagBonus(){
  const lvl = Number(state.level) || 1;
  if(lvl >= 30) return 6;
  if(lvl >= 20) return 5;
  if(lvl >= 10) return 4;
  return 3;
}

function ensureTags(){
  state.choices ||= {};
  state.choices.tags ||= [];
}

export function isTagged(skillId){
  ensureTags();
  // First Gen free tag is treated as tagged even if not chosen normally
  if(state.subsetId === 'first_gen' && state.choices.firstGenTag === skillId) return true;
  return state.choices.tags.includes(skillId);
}

export function getMaxTags(){
  // Base 3 tags; Human +1 tag.
  let n = 3;
  if(state.raceId === 'human') n += 1;
  return n;
}

export function toggleTag(skillId){
  ensureTags();
  const tags = state.choices.tags;

  if(tags.includes(skillId)){
    state.choices.tags = tags.filter(t => t !== skillId);
    return;
  }

  if(tags.length >= getMaxTags()) return;
  tags.push(skillId);
}

export function getSkillMod(skillId){
  const skill = SKILLS.find(s => s.id === skillId);
  if(!skill) return 0;

  const statMod = getModifier(skill.stat);
  const tag = isTagged(skillId) ? getTagBonus() : 0;

  // Phase 6.2: racial/subset skill modifiers come in 6.3.
  return statMod + tag;
}

export function renderSkills(){
  const wrap = document.getElementById('skillsList');
  if(!wrap) return;

  ensureTags();

  wrap.innerHTML = '';

  const maxTags = getMaxTags();
  const tagBonus = getTagBonus();
  const used = state.choices.tags.length;

  const header = document.createElement('div');
  header.className = 'muted';
  header.style.marginBottom = '6px';
  header.textContent = `Tagged skills: ${used}/${maxTags} • Tag bonus: +${tagBonus}`;
  wrap.appendChild(header);

  
  // First Gen free tag selection (Science/Medicine/Speech) — SINGLE CHOICE
  if(state.subsetId === 'first_gen'){
    const box = document.createElement('div');
    box.style.margin = '8px 0 10px 0';
    box.style.padding = '10px';
    box.style.border = '1px solid rgba(255,255,255,0.12)';
    box.style.borderRadius = '10px';
    box.style.background = 'rgba(0,0,0,0.20)';

    const title = document.createElement('div');
    title.className = 'muted';
    title.style.marginBottom = '6px';
    title.textContent = 'First Generation — Vestiges of Genius: choose ONE free tagged skill (does not use tag slots)';
    box.appendChild(title);

    const cur = state.choices.firstGenTag || '';

    const opts = [
      {id:'science', label:'Science'},
      {id:'medicine', label:'Medicine'},
      {id:'speech', label:'Speech'},
    ];

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '6px';

    opts.forEach(o => {
      const row = document.createElement('label');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '10px';
      row.style.cursor = 'pointer';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'firstGenTag';
      radio.value = o.id;
      radio.checked = (cur === o.id);
      radio.onchange = () => { setFirstGenTag(o.id); renderAll(); };

      const pill = document.createElement('span');
      pill.className = 'skill-tag' + ((cur === o.id) ? ' on' : '');
      pill.textContent = o.label + ((cur === o.id) ? ' ✓' : '');

      row.appendChild(radio);
      row.appendChild(pill);
      list.appendChild(row);
    });

    if(!cur){
      const warn = document.createElement('div');
      warn.className = 'muted';
      warn.style.marginTop = '8px';
      warn.textContent = 'Choose one to gain your free tagged skill.';
      box.appendChild(warn);
    }

    box.appendChild(list);
    wrap.appendChild(box);
  }
/* FIRST GEN SELECTOR UI */
  if(isFirstGen()){
    const fgWrap = document.createElement('div');
    fgWrap.className = 'muted';
    fgWrap.style.marginBottom = '10px';
    fgWrap.innerHTML = '<b>Vestiges of Genius:</b> Choose one free tagged skill:';

    ['science','medicine','speech'].forEach(id=>{
      const btn = document.createElement('button');
      btn.className = 'skill-tag' + (getFirstGenTag()===id ? ' on':'');
      btn.style.marginRight = '6px';
      btn.textContent = id.charAt(0).toUpperCase()+id.slice(1);

      btn.onclick = ()=>{
        setFirstGenTag(id);
        renderAll();
      };

      fgWrap.appendChild(btn);
    });

    wrap.appendChild(fgWrap);
  }


  SKILLS.forEach(s => {
    const row = document.createElement('div');
    row.className = 'skill-row';

    const left = document.createElement('div');
    left.innerHTML = `<div class="skill-name">${s.name}</div><div class="skill-gov">Governing: ${s.stat}</div>`;

    const mod = document.createElement('div');
    const m = getSkillMod(s.id);
    mod.className = 'skill-mod';
    mod.textContent = (m >= 0 ? `+${m}` : `${m}`);

    const tag = document.createElement('button');
    tag.type = 'button';
    tag.className = 'skill-tag' + (isTagged(s.id) ? ' on' : '');
    tag.textContent = isTagged(s.id) ? 'Tagged' : 'Tag';
    tag.onclick = () => { toggleTag(s.id); renderAll(); };

    row.appendChild(left);
    row.appendChild(mod);
    row.appendChild(tag);
    wrap.appendChild(row);
  });
}


/* ===== PHASE 6.2.5 — FIRST GEN TAG CHOICE ===== */

export function isFirstGen(){
  return state.raceId === 'super_mutant' && state.subsetId === 'first_generation';
}

export function setFirstGenTag(skillId){
  if(!['science','medicine','speech'].includes(skillId)) return;

  state.choices ||= {};
  state.choices.firstGenTag = skillId;

  // Free tag: ensure it does NOT consume normal tag slots
  ensureTags();
  if(state.choices.tags.includes(skillId)){
    state.choices.tags = state.choices.tags.filter(t => t !== skillId);
  }
}

export function getFirstGenTag(){
  return (state.subsetId === 'first_gen') ? (state.choices?.firstGenTag || null) : null;
}







function renderPerkTile(perk, overspent, isPickLevel, remaining){

  const pr = perkNextRank(perk);
  const gate = canPickPerkNow(perk);
  const req = checkPerkReq(perk);

  const tile = document.createElement("div");
  tile.className = "perk-tile";

  const title = document.createElement("div");
  title.className = "perk-title";
  title.textContent = perk.name;

  const meta = document.createElement("div");
  meta.className = "perk-meta";
  meta.textContent = `Rank: ${pr.owned}/${pr.max}`;

  const desc = document.createElement("div");
  desc.className = "perk-desc";
  const nextText = (perk.ranks && perk.ranks[pr.nextIndex]) ? perk.ranks[pr.nextIndex] : (perk.ranks && perk.ranks[0] || "");
  desc.textContent = nextText;

  const controls = document.createElement("div");
  controls.className = "perk-controls";

  const pickBtn = document.createElement("button");
  pickBtn.textContent = pr.owned > 0 ? (pr.hasNext ? "Rank Up" : "Maxed") : "Pick";
  pickBtn.disabled = !gate.ok || overspent;
  pickBtn.onclick = () => pickPerk(perk.id);

  const unpickBtn = document.createElement("button");
  unpickBtn.textContent = "Unpick";
  unpickBtn.disabled = pr.owned <= 0;
  unpickBtn.onclick = () => unpickPerk(perk.id);

  controls.appendChild(pickBtn);
  controls.appendChild(unpickBtn);

  tile.appendChild(title);
  tile.appendChild(meta);
  tile.appendChild(desc);

  const rankList = document.createElement("div");
  rankList.className = "perk-ranks";

  if(Array.isArray(perk.ranks)){
    rankList.innerHTML = perk.ranks.map((t,i)=>{
      const owned = i < pr.owned ? " owned" : "";
      const next = (i===pr.nextIndex && pr.hasNext) ? " next":"";
      return `<div class="perk-rank${owned}${next}">Rank ${i+1}: ${t}</div>`;
    }).join("");
  }

  tile.appendChild(rankList);
  tile.appendChild(controls);

  if(!req.ok) tile.classList.add("locked");
  if(!isPickLevel || remaining<=0 || overspent) tile.classList.add("disabled");
  if(!pr.hasNext) tile.classList.add("maxed");

  return tile;
}



function renderPerks(){
  const container = document.getElementById("perksList");
  if (!container) return;

  const level = state.level || 1;
  const slots = getPerkSlots(level);
  const allowed = getAllowedPerkPicks(level);
  const chosen = getTotalChosenPerks();
  const remaining = getRemainingPerkPicks();
  const isPickLevel = isPerkPickLevel(level);

  let statusText = "";
  if(!isPickLevel){
    statusText = "No perk pick at this level.";
  } else if(remaining <= 0){
    statusText = "No remaining perk picks.";
  } else {
    statusText = "Perk pick available.";
  }

  const overspent = chosen > allowed;

  container.innerHTML = `
    <div class="perk-slots-bar ${overspent ? "perk-warning" : ""}">
      <div><strong>Level:</strong> ${level}</div>
      <div><strong>Perk Slots:</strong> ${slots}</div>
      <div><strong>Picks:</strong> ${chosen} / ${allowed} • <strong>Remaining:</strong> ${remaining}</div>
      <div class="perk-status">${overspent ? "Too many perks selected for current level. Unpick perks." : statusText}</div>
    </div>

    <div class="perk-grid">
      <div class="perk-family" id="perk-combat">
        <h3>Combat</h3>
        <div class="perk-family-body" id="perk-combat-body"></div>
      </div>

      <div class="perk-family" id="perk-stealth">
        <h3>Stealth</h3>
        <div class="perk-family-body empty">Pending</div>
      </div>

      <div class="perk-family" id="perk-mobility">
        <h3>Mobility</h3>
        <div class="perk-family-body empty">Pending</div>
      </div>

      <div class="perk-family" id="perk-crafting">
        <h3>Crafting & Survival</h3>
        <div class="perk-family-body empty">Pending</div>
      </div>
    </div>
  `;

  const combatBody = document.getElementById("perk-combat-body");
  if(!combatBody) return;

  const combatPerks = PERKS.filter(p => String(p.category||"").toLowerCase() === "combat");

  if(combatPerks.length === 0){
    combatBody.classList.add("empty");
    combatBody.textContent = "No combat perks loaded";
    return;
  }

  combatPerks.forEach(perk => {
    const pr = perkNextRank(perk);
    const gate = canPickPerkNow(perk);
    const req = checkPerkReq(perk);

    const tile = document.createElement("div");
    tile.className = "perk-tile";

    const title = document.createElement("div");
    title.className = "perk-title";
    title.textContent = perk.name;

    const meta = document.createElement("div");
    meta.className = "perk-meta";
    meta.textContent = `Rank: ${pr.owned}/${pr.max}`;

    const desc = document.createElement("div");
    desc.className = "perk-desc";
    const nextText = (perk.ranks && perk.ranks[pr.nextIndex]) ? perk.ranks[pr.nextIndex] : (perk.ranks && perk.ranks[0] ? perk.ranks[0] : "");
    desc.textContent = nextText;

    const controls = document.createElement("div");
    controls.className = "perk-controls";

    const pickBtn = document.createElement("button");
    pickBtn.className = "perk-pick-btn";
    pickBtn.textContent = pr.owned > 0 ? (pr.hasNext ? "Rank Up" : "Maxed") : "Pick";
    pickBtn.disabled = !gate.ok || overspent;
    pickBtn.onclick = () => { pickPerk(perk.id); };

    const unpickBtn = document.createElement("button");
    unpickBtn.className = "perk-unpick-btn";
    unpickBtn.textContent = "Unpick";
    unpickBtn.disabled = pr.owned <= 0;
    unpickBtn.onclick = () => { unpickPerk(perk.id); };

    controls.appendChild(pickBtn);
    controls.appendChild(unpickBtn);

    let tipParts = [];
    if(overspent) tipParts.push("Too many perks selected for current level.");
    if(!gate.ok && gate.reason) tipParts.push(gate.reason);
    if(!req.ok && req.missing && req.missing.length) tipParts.push(req.missing.join(", "));
    if(tipParts.length) tile.title = tipParts.join(" ");

    tile.appendChild(title);
    tile.appendChild(meta);
    tile.appendChild(desc);

    const rankList = document.createElement("div");
    rankList.className = "perk-ranks";
    if(Array.isArray(perk.ranks) && perk.ranks.length){
      rankList.innerHTML = perk.ranks.map((t,i)=>{
        const ownedMark = (i < pr.owned) ? " owned" : "";
        const nextMark = (i === pr.nextIndex && pr.hasNext) ? " next" : "";
        return `<div class="perk-rank${ownedMark}${nextMark}">Rank ${i+1}: ${t}</div>`;
      }).join("");
    }
    tile.appendChild(rankList);

    tile.appendChild(controls);

    if(!req.ok) tile.classList.add("locked");
    if(!isPickLevel || remaining <= 0 || overspent) tile.classList.add("disabled");
    if(!pr.hasNext) tile.classList.add("maxed");

    combatBody.appendChild(tile);
  });


  // ---- Stealth Perks ----
  const stealthBody = document.getElementById("perk-stealth")?.querySelector(".perk-family-body");
  if(stealthBody){
        const smPerks = PERKS.filter(p=>String(p.category||"").toLowerCase()==="stealth_mobility");

    if(smPerks.length){
      stealthBody.classList.remove("empty");
      stealthBody.innerHTML="";
      smPerks.forEach(perk=>{
        const tile = renderPerkTile(perk, overspent, isPickLevel, remaining);
        stealthBody.appendChild(tile);
      });
   
