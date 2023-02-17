import { BasePillarsActorSheet } from "./base-sheet";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsNPCSheet extends BasePillarsActorSheet 
{
    /** @override */
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.width = 520,
        options.height = 670,
        options.classes.push("npc");
        return options;
    }

    activateListeners(html)
    {
        super.activateListeners(html);


        if (!this.isEditable) {return;}

        html.find(".defense-input").on("change", (ev) => 
        {
            const defense = ev.currentTarget.dataset.defense;
            const value = Number(ev.currentTarget.value);

            return this.actor.update({[`data.defenses.${defense}.base`] : value});
        });
    }
}
