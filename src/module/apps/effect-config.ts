
import EffectScriptConfig from "./effect-script.js"


export default class PillarsEffectConfig extends ActiveEffectConfig<ActiveEffectConfig.Options, ActiveEffectConfig.Data & {showEquip : boolean, modes : Record<number, string>}> {

    get template() {
        return "systems/pillars-of-eternity/templates/apps/active-effect-config.html"
    }

    async getData()
    {
        let data = await super.getData();
        data.showEquip = this.object.item?.canEquip || false
        data.modes[6] = "Roll Dialog"
        data.modes[7] = "Targeter's Roll Dialog"
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