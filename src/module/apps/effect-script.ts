import { getGame } from "../system/utility"
import PillarsActiveEffect from "../system/pillars-effect"

export default class EffectScriptConfig extends FormApplication<FormApplicationOptions, {script: string, description: string}, {effect : PillarsActiveEffect, index : number}> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "effect-script-config",
            template: "systems/pillars-of-eternity/templates/apps/effect-script.html",
            height: 400,
            width: 500,
            title: getGame().i18n.localize("PILLARS.EffectScriptConfig"),
            resizable: true
        })
    }
    async getData() {
        let data = await super.getData()
        data.script = this.object.effect.changeConditionals[this.object.index]?.script
        data.description = this.object.effect.changeConditionals[this.object.index]?.description
        return data
    }
    _updateObject(event :Event, formData : Record<string, unknown>) {
        let script = formData.script
        let description = formData.description;
        return this.object.effect.update({[`flags.pillars-of-eternity.changeCondition.${this.object.index}`] : {script, description}})
    }
} 