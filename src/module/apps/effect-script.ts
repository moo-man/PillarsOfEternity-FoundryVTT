import { getGame } from "../system/utility";
import PillarsActiveEffect from "../document/effect-pillars";

export default class EffectScriptConfig extends FormApplication<FormApplicationOptions, {script: string, description: string}, {effect : PillarsActiveEffect, index : number}> 
{
    static get defaultOptions() 
    {
        return mergeObject(super.defaultOptions, {
            id: "effect-script-config",
            template: "systems/pillars-of-eternity/templates/apps/effect-script.hbs",
            height: 400,
            width: 500,
            title: getGame().i18n.localize("PILLARS.EffectScriptConfig"),
            resizable: true
        });
    }
    async getData() 
    {
        const data = await super.getData();
        data.script = this.object.effect.changeConditionals[this.object.index]?.script;
        data.description = this.object.effect.changeConditionals[this.object.index]?.description;
        return data;
    }
    _updateObject(event :Event, formData : Record<string, unknown>) 
    {
        const script = formData.script;
        const description = formData.description;
        return this.object.effect.update({[`flags.pillars-of-eternity.changeCondition.${this.object.index}`] : {script, description}});
    }
} 