import { getGame } from '../system/utility';
import { PillarsTurn } from '../../types/combat';
import { PillarsCombat } from '../system/combat';
import { PillarsCombatant } from '../system/combatant';

export default class PillarsCombatTracker extends CombatTracker {
  async _render(...args: Parameters<CombatTracker['_render']>) {
    await super._render(...args);
  }

  activateListeners(html: JQuery<HTMLElement>) {
    this.addPillarsHTML(html);

    super.activateListeners(html);

    html.find('.switch-phase').on('click', (ev: JQuery.ClickEvent) => {
      let game = getGame();
      if (game && game.user!.isGM) {
        game.combat!.setFlag('pillars-of-eternity', 'phase', (game.combat as PillarsCombat)!.phase == 0 ? 1 : 0);
      }
    });

    html.find('.token-move').on('mouseup', (event: JQuery.MouseUpEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const btn = event.currentTarget;
      const li = btn.closest('.combatant');
      const combat = this.viewed;
      const c: PillarsCombatant | undefined = combat?.combatants.get(li.dataset.combatantId) as PillarsCombatant;
      if (c?.isOwner) c.handleMovement(event.button == 0 ? 1 : -1);
    });
  }

  addPillarsHTML(html: JQuery<HTMLElement>) {
    let combat = this.viewed as PillarsCombat;

    if (combat?.round && combat.round > 0) 
    {
      // Add Phase Label
      html.find('.encounter-title').append(` - <a class="switch-phase">${(this.viewed as PillarsCombat).Phase}</a>`);
      // Add combatant movement tracking
      html.find('.combatant').each((index, element) => {
        let combatant = combat.combatants.get(element.dataset.combatantId as string) as PillarsCombatant;
        let move = combatant.getMoveData();
        if (!move) return;
        // Stride Counter element
      let a = document.createElement('a');
      a.classList.add('token-move');
      if (move.running) a.classList.add('running');
      a.innerHTML = `<i class="fas fa-running"></i>`;

      let resource = element.querySelector('.token-resource')

      // If no resource, add one to place counter in
      if (!resource)
      {
        resource = document.createElement("div")
        resource.classList.add("token-resource");
        resource.innerHTML = `<span class="resource"></span>`
        element.insertBefore(resource, element.querySelector(".token-initiative"))
      }
      
      if (combat.phase == 0) // move phase
      {
        element.querySelector('.resource')!.textContent = `${move.counter}/${move.stride}`;
        a.dataset.tooltip = 'Stride Counter - Left/Right click to manually increase/decrease';
        resource.append(a);
      } 
      else //action phase
      {
        resource.append(a);
      }
    });
  }
  // Add Initiative buttons
  html.find(".combatant-control.roll").each((index, element) => {
    let init = $(element)
    init.replaceWith(`<div class="initiative-buttons">
      <a class="combatant-control roll" data-tooltip="${getGame().i18n.localize('RollInitiativeAdv')}" data-control="rollInitiativeAdv"></a>
      <a class="combatant-control roll" data-tooltip="${getGame().i18n.localize('RollInitiativeDis')}" data-control="rollInitiativeDis"></a>
      <a class="combatant-control roll" data-tooltip="${getGame().i18n.localize('COMBAT.InitiativeRoll')}}" data-control="rollInitiative"></a>
      </div>`)
    })
  }
  /** @override */
  async _onCombatantControl(event: JQuery.ClickEvent) {
    event.preventDefault();
    event.stopPropagation();
    const btn = event.currentTarget;
    const li = btn.closest('.combatant');
    const combat = this.viewed;
    const c = combat?.combatants.get(li.dataset.combatantId);

    if (c && combat) {
      // Switch control action
      switch (btn.dataset.control) {
        // Roll combatant initiative
        case 'rollInitiativeAdv':
          combat.rollInitiative([c.id!], { formula: '{2d10, 1d20}kh + (1d12 / 100) + @initiative.value' });
        case 'rollInitiativeDis':
          combat.rollInitiative([c.id!], { formula: '{2d10, 1d20}kl + (1d12 / 100) + @initiative.value' });
        default:
          super._onCombatantControl(event);
      }
    }
  }
}
