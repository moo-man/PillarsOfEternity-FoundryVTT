import { getGame } from "../system/utility";
import PillarsActiveEffect from "../document/effect-pillars";

export default class EffectScriptConfig extends FormApplication<FormApplicationOptions, {script: string, description: string}, {effect : PillarsActiveEffect, index : number}> 
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat("pillars-of-eternity", "effect-script-config"),
        options.title = getGame().i18n.localize("PILLARS.EffectScriptConfig"),
        options.resizable = true;
        return options;
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