
// CORE.JS - FIXED BUILD (Perks + First Gen + Unified Rendering)

// NOTE: This is your consolidated fixed core.js

// ---------------- PERK SYSTEM ----------------

import { PERKS } from './data/perks.js';

const PERK_PICK_LEVELS = [1,3,6,9,12,15,18,21,24,27,30];

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
  specialPool: 5
};


// ---------------- PERK HELPERS ----------------

function isPerkPickLevel(level){
  return PERK_PICK_LEVELS.includes(level);
}

function getAllowedPerkPicks(level){
  return PERK_PICK_LEVELS.filter(l => l <= level).length;
}

function getTotalChosenPerks(){
  return Object.values(state.perksChosen||{})
    .reduce((a,b)=>a+(Number(b)||0),0);
}

function getRemainingPerkPicks(){
  return Math.max(0, getAllowedPerkPicks(state.level||1) - getTotalChosenPerks());
}

function getPerkOwned(id){
  return Number(state.perksChosen?.[id]||0);
}

function perkNextRank(perk){
  const owned = getPerkOwned(perk.id);
  const max = perk.ranks?.length||0;

  return {
    owned,
    max,
    nextIndex: owned,
    hasNext: owned < max
  };
}


// ---------------- FIRST GEN ----------------

export function isFirstGen(){
  return state.raceId === 'mutant' && state.subsetId === 'first_gen';
}

export function getFirstGenTag(){
  return isFirstGen() ? state.choices?.firstGenTag || null : null;
}

export function setFirstGenTag(id){
  if(!['science','medicine','speech'].includes(id)) return;

  state.choices ||= {};
  state.choices.firstGenTag = id;

  if(state.choices.tags?.includes(id)){
    state.choices.tags =
      state.choices.tags.filter(t=>t!==id);
  }
}


// ---------------- PERK REQUIREMENTS ----------------

function checkPerkReq(perk){

  const r = perk.req||{};
  const missing = [];

  if(state.level < (r.level||0)){
    missing.push("Level "+r.level);
  }

  if(r.special){
    for(const k in r.special){
      if((state.special[k]||0) < r.special[k]){
        missing.push(k+" "+r.special[k]);
      }
    }
  }

  return {
    ok: missing.length===0,
    missing
  };
}


// ---------------- PERK PICKING ----------------

function canPickPerk(perk){

  if(!isPerkPickLevel(state.level)){
    return {ok:false,reason:"No pick"};
  }

  if(getRemainingPerkPicks()<=0){
    return {ok:false,reason:"No slots"};
  }

  const pr = perkNextRank(perk);

  if(!pr.hasNext){
    return {ok:false,reason:"Max"};
  }

  const req = checkPerkReq(perk);

  if(!req.ok){
    return {ok:false,reason:"Req"};
  }

  return {ok:true};
}


function pickPerk(id){

  const perk = PERKS.find(p=>p.id===id);
  if(!perk) return;

  if(!canPickPerk(perk).ok) return;

  state.perksChosen ||= {};
  state.perksChosen[id] = getPerkOwned(id)+1;

  renderAll();
}


function unpickPerk(id){

  const cur = getPerkOwned(id);
  if(cur<=0) return;

  state.perksChosen[id] = cur-1;

  if(state.perksChosen[id]<=0){
    delete state.perksChosen[id];
  }

  renderAll();
}


// ---------------- PERK TILE ----------------

function renderPerkTile(perk, overspent, canPick){

  const pr = perkNextRank(perk);
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
  desc.textContent =
    perk.ranks?.[pr.nextIndex]||perk.ranks?.[0]||"";

  const ranks = document.createElement("div");
  ranks.className = "perk-ranks";

  if(perk.ranks){
    ranks.innerHTML = perk.ranks.map((t,i)=>{

      const o = i<pr.owned ? " owned":"";
      const n = i===pr.nextIndex && pr.hasNext ? " next":"";

      return `<div class="perk-rank${o}${n}">
        Rank ${i+1}: ${t}</div>`;

    }).join("");
  }

  const controls = document.createElement("div");
  controls.className="perk-controls";

  const pick = document.createElement("button");
  pick.textContent = pr.owned? (pr.hasNext?"Rank":"Maxed"):"Pick";
  pick.disabled = !canPick||overspent;
  pick.onclick = ()=>pickPerk(perk.id);

  const un = document.createElement("button");
  un.textContent="Unpick";
  un.disabled = pr.owned<=0;
  un.onclick = ()=>unpickPerk(perk.id);

  controls.append(pick,un);

  tile.append(title,meta,desc,ranks,controls);

  if(!req.ok) tile.classList.add("locked");
  if(!canPick||overspent) tile.classList.add("disabled");
  if(!pr.hasNext) tile.classList.add("maxed");

  return tile;
}


// ---------------- PERK RENDER ----------------

function renderPerks(){

  const wrap = document.getElementById("perksList");
  if(!wrap) return;

  const lvl = state.level||1;

  const allowed = getAllowedPerkPicks(lvl);
  const chosen = getTotalChosenPerks();
  const rem = getRemainingPerkPicks();
  const isPick = isPerkPickLevel(lvl);

  const overspent = chosen>allowed;

  wrap.innerHTML = `
  <div class="perk-slots-bar ${overspent?"perk-warning":""}">
    Level ${lvl} • Picks ${chosen}/${allowed} • Left ${rem}
  </div>

  <div class="perk-grid">
    <div class="perk-family">
      <h3>Combat</h3>
      <div id="perk-combat" class="perk-family-body"></div>
    </div>

    <div class="perk-family">
      <h3>Stealth / Mobility</h3>
      <div id="perk-stealth" class="perk-family-body"></div>
    </div>

    <div class="perk-family">
      <h3>Crafting</h3>
      <div id="perk-craft" class="perk-family-body"></div>
    </div>
  </div>
  `;

  const map = {
    combat: "perk-combat",
    stealth_mobility: "perk-stealth",
    crafting: "perk-craft"
  };

  for(const cat in map){

    const body = document.getElementById(map[cat]);
    if(!body) continue;

    const list = PERKS.filter(p=>
      (p.category||"").toLowerCase()===cat
    );

    list.forEach(p=>{

      const ok =
        isPick &&
        rem>0 &&
        canPickPerk(p).ok;

      body.appendChild(
        renderPerkTile(p,overspent,ok)
      );
    });
  }
}


// ---------------- MASTER RENDER ----------------

function renderAll(){
  renderPerks();
}

export { renderAll };
