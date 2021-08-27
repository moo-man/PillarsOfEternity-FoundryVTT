
export default class PillarsCombatTracker extends CombatTracker {
    get template() {
        return "systems/pillars-of-eternity/templates/apps/combat-tracker.html"
    }

    async getData() {
        let data = await super.getData()
        return data
    }

    activateListeners(html)
    {
        super.activateListeners(html)

        html.find(".switch-phase").click(ev => {
            game.combat.setFlag("pillars-of-eternity", "phase", game.combat.phase == 0 ? 1 : 0)
        })
    }
}