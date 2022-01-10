
import EffectScriptConfig from "./effect-script.js"


export default class PillarsEffectConfig extends ActiveEffectConfig {

    get template() {
        return "systems/pillars-of-eternity/templates/apps/active-effect-config.html"
    }

    getData()
    {
        let data = super.getData();
        data.showEquip = this.object.item?.canEquip
        data.modes[6] = "Roll Dialog"
        data.modes[7] = "Targeter's Roll Dialog"
        return data
    }   

    activateListeners(html) {
        super.activateListeners(html)
        html.find(".effect-script-config").click(ev => {
            let index = parseInt($(ev.currentTarget).parents(".effect-change").attr("data-index"))
            new EffectScriptConfig({effect : this.object, index}).render(true)
        })
    }
}