
export const PERKS = [

{
  id:"gunslinger",
  name:"Gunslinger",
  category:"Combat",
  ranks:[
    "+2 Guns, Pistols -1 AP",
    "+3 Guns, Pistols -1 AP",
    "+4 Guns, Pistols -2 AP"
  ],
  req:{ level:3, skills:{ guns:3 } }
},


{
  id:"commando",
  name:"Commando",
  category:"Combat",
  ranks:[
    "+2 Guns (Rifles), Ignore 1 DR",
    "+3 Guns (Rifles), Ignore 2 DR",
    "+4 Guns (Rifles), Ignore 3 DR"
  ],
  req:{ level:3, skills:{ guns:3 } }
},


{
  id:"shotgun_surgeon",
  name:"Shotgun Surgeon",
  category:"Combat",
  ranks:[
    "Shotguns ignore 2 DR",
    "Shotguns ignore 3 DR",
    "Shotguns ignore 4 DR"
  ],
  req:{ level:6, skills:{ guns:4 } }
},


{
  id:"laser_commander",
  name:"Laser Commander",
  category:"Combat",
  ranks:[
    "+1 hit/dmg (Energy)",
    "+2 hit/dmg (Energy)",
    "+3 hit/dmg (Energy)"
  ],
  req:{ level:6, skills:{ energy:4 } }
},


{
  id:"demolition_expert",
  name:"Demolition Expert",
  category:"Combat",
  ranks:[
    "+1 die on explosive crit",
    "+2 dice on explosive crit",
    "Explosives always crit on 19–20"
  ],
  req:{ level:6, skills:{ explosives:4 } }
},


{
  id:"sniper",
  name:"Sniper",
  category:"Combat",
  ranks:[
    "Ignore half-cover (Near/Far)",
    "Ignore all cover (Near/Far)",
    "Crit on 18–20 at range"
  ],
  req:{ level:6, special:{ PER:2 } }
},


{
  id:"slayer",
  name:"Slayer",
  category:"Combat",
  ranks:[
    "+1 melee dmg, +1 init AGI",
    "+2 melee dmg, +2 init AGI",
    "+3 melee dmg, advantage on crits"
  ],
  req:{ level:9, special:{ STR:2 } }
},


{
  id:"ninja",
  name:"Ninja",
  category:"stealth_mobility",
  ranks:[
    "+2 Sneak, +1d6 stealth dmg",
    "+3 Sneak, +2d6 stealth dmg",
    "+4 Sneak, auto-crit from stealth"
  ],
  req:{ level:6, tags:["sneak"] }
},

{
  id:"silent_running",
  name:"Silent Running",
  category:"stealth_mobility",
  ranks:[
    "No move penalty to Sneak",
    "No sprint penalty to Sneak",
    "Invisible while still"
  ],
  req:{ level:3, skills:{ sneak:3 } }
},

{
  id:"thief",
  name:"Thief",
  category:"stealth_mobility",
  ranks:[
    "+1 Sneak/Lockpick",
    "+2 Sneak/Lockpick",
    "+3 Sneak/Lockpick"
  ],
  req:{ level:3, skills:{ lockpick:3 } }
},

{
  id:"ghostwalker",
  name:"Ghostwalker",
  category:"stealth_mobility",
  ranks:[
    "+2 AGI rolls undetected",
    "+3 AGI rolls undetected",
    "Advantage while undetected"
  ],
  req:{ level:9, skills:{ sneak:5 } }
},

{
  id:"action_boy",
  name:"Action Boy",
  category:"stealth_mobility",
  ranks:[
    "Once/encounter: restore AP",
    "Twice/encounter: restore AP",
    "Restore AP every fight"
  ],
  req:{ level:9, special:{ AGI:2 } }
},

{
  id:"strong_back",
  name:"Strong Back",
  category:"Survival",
  ranks:[
    "+30 carry weight",
    "+60 carry weight",
    "+90 carry weight"
  ],
  req:{ level:6, special:{ STR:2 } }
},

{
  id:"survivalist",
  name:"Survivalist",
  category:"Survival",
  ranks:[
    "+2 Survival, +1 water find",
    "+3 Survival, immune minor hazards",
    "+4 Survival, ignore terrain penalties"
  ],
  req:{ level:3, skills:{ survival:3 } }
},

{
  id:"medic",
  name:"Medic",
  category:"Utility",
  ranks:[
    "+2 Medicine, chems +25%",
    "+3 Medicine, chems +50%",
    "+4 Medicine, chems +75%"
  ],
  req:{ level:3, skills:{ medicine:3 } }
},

{
  id:"repairman",
  name:"Repairman",
  category:"Utility",
  ranks:[
    "+2 Repair",
    "+3 Repair",
    "+4 Repair, free fix/scene"
  ],
  req:{ level:3, skills:{ repair:3 } }
},

{
  id:"scientist",
  name:"Scientist",
  category:"Utility",
  ranks:[
    "+2 Science",
    "+3 Science",
    "+4 Science, bypass systems"
  ],
  req:{ level:6, skills:{ science:4 } }
},

{
  id:"smooth_talker",
  name:"Smooth Talker",
  category:"Social",
  ranks:[
    "+2 Speech",
    "+3 Speech",
    "+4 Speech, reroll fails"
  ],
  req:{ level:3, skills:{ speech:3 } }
},

{
  id:"master_trader",
  name:"Master Trader",
  category:"Social",
  ranks:[
    "+10% better prices",
    "+20% better prices",
    "+30% better prices"
  ],
  req:{ level:6, skills:{ barter:4 } }
},

{
  id:"super_slam",
  name:"Super Slam",
  category:"Combat",
  ranks:[
    "Crits with Melee/Unarmed force END TN 15 or target is knocked prone."
  ],
  req:{ level:1 }
},

];