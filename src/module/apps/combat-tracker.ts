
export default class PillarsCombatTracker extends CombatTracker {
    get template() {
        return "systems/pillars-of-eternity/templates/apps/combat-tracker.html"
    }

    async getData() {
        let data = await super.getData()
        data.turns.forEach(t => {
            let combatant = ui.combat.viewed.combatants.get(t.id)
            t.move = combatant.getMoveData()
        })
        return data
    }

    activateListeners(html)
    {
        super.activateListeners(html)

        html.find(".switch-phase").click(ev => {
            if (game.user.isGM)
            {
                game.combat.setFlag("pillars-of-eternity", "phase", game.combat.phase == 0 ? 1 : 0)
            }
        })

        html.find(".token-move").mouseup(event => {

            event.preventDefault();
            event.stopPropagation();
            const btn = event.currentTarget;
            const li = btn.closest(".combatant");
            const combat = this.viewed;
            const c = combat.combatants.get(li.dataset.combatantId);
            if (c.isOwner)
                c.handleMovement(event.button == 0 ? 1 : -1)
        })

    }
    /** @override */
    async _onCombatantControl(event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        const li = btn.closest(".combatant");
        const combat = this.viewed;
        const c = combat.combatants.get(li.dataset.combatantId);
    
        // Switch control action
        switch (btn.dataset.control) {
          // Roll combatant initiative
          case "rollInitiativeAdv":
            return combat.rollInitiative([c.id], {formula : "{2d10, 1d20}kh + (1d12 / 100) + @initiative.value"});
          case "rollInitiativeDis":
            return combat.rollInitiative([c.id], {formula : "{2d10, 1d20}kl + (1d12 / 100) + @initiative.value"});
           default :   
            return super._onCombatantControl(event)
        }
      }
}