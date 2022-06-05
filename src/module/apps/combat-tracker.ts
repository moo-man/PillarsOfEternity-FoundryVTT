import { getGame } from '../../pillars';
import { PillarsTurn } from '../../types/combat';
import { PillarsCombat } from '../system/combat';
import { PillarsCombatant } from '../system/combatant';

export default class PillarsCombatTracker extends CombatTracker {
  get template() {
    return 'systems/pillars-of-eternity/templates/apps/combat-tracker.html';
  }

  async getData() {
    let data = await super.getData();
    data.turns.forEach((t: PillarsTurn) => {
      let combatant: PillarsCombatant | undefined = ui.combat?.viewed?.combatants.get(t.id) as PillarsCombatant;
      t.move = combatant?.getMoveData();
    });
    return data;
  }

  activateListeners(html : JQuery<HTMLElement>) {
    super.activateListeners(html);

    html.find('.switch-phase').on('click', (ev: JQuery.ClickEvent) => {
      let game = getGame();
      if (game && game.user!.isGM) {
        game.combat!.setFlag('pillars-of-eternity', 'phase', (game.combat as PillarsCombat)!.phase == 0 ? 1 : 0);
      }
    });

    html.find('.token-move').on("mouseup", (event : JQuery.MouseUpEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const btn = event.currentTarget;
      const li = btn.closest('.combatant');
      const combat = this.viewed;
      const c: PillarsCombatant | undefined = combat?.combatants.get(li.dataset.combatantId) as PillarsCombatant;
      if (c?.isOwner) c.handleMovement(event.button == 0 ? 1 : -1);
    });
  }
  /** @override */
  async _onCombatantControl(event : JQuery.ClickEvent) {
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
