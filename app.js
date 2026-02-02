import { PERKS } from './data/perks.js';
import { initTabs, initBuildSubTabs, initState, initRaces, writeBuildId, initSpecial } from './core.js?v=phase6_2_7';
initTabs();
initBuildSubTabs();
initState();
initRaces();
initSpecial();
writeBuildId('phase6.2.7');


document.addEventListener('click', (e) => {
  const btn = e.target.closest('.subtab');
  if(!btn) return;
  if(btn.dataset.subtab === 'special') {
    setTimeout(() => initSpecial(), 0);
  }
});