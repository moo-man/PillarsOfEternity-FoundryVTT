
import { getGame } from "../system/utility";
import EffectScriptConfig from "./effect-script"


export default class PillarsEffectConfig extends ActiveEffectConfig<ActiveEffectConfig.Options, ActiveEffectConfig.Data & {showEquip : boolean, modes : Record<number, string>}> {

    get template() {
        return "systems/pillars-of-eternity/templates/apps/active-effect-config.hbs"
    }

    async getData()
    {
        let game = getGame()
        let data = await super.getData();
        data.showEquip = this.object.item?.canEquip || false
        data.modes[6] = game.i18n.localize("PILLARS.RollDialogEffect")
        data.modes[7] = game.i18n.localize("PILLARS.TargetersRollDialogEffect")
        return data
    }   

    activateListeners(html : JQuery<HTMLElement>) {
        super.activateListeners(html)
        html.find(".effect-script-config").on("click", (ev : JQuery.ClickEvent) => {
            let index = parseInt($(ev.currentTarget).parents(".effect-change").attr("data-index")!)
            if (index)
                new EffectScriptConfig({effect : this.object, index}).render(true)
        })
    }
}