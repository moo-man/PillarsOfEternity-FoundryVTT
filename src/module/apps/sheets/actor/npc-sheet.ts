import { PillarsCharacterSheet } from "./character-sheet";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsNPCSheet extends PillarsCharacterSheet 
{
    /** @override */
    static get defaultOptions() 
    {

        const options = super.defaultOptions;
        options.width = 810,
        options.height = 830,
        options.classes.push("npc");
        return options;
    }

    activateListeners(html : JQuery<HTMLElement>)
    {
        super.activateListeners(html);


        if (!this.isEditable) {return;}

        html.find(".defense-input").on("change", ((ev : JQuery.ChangeEvent) => 
        {
            const defense = ev.currentTarget.dataset.defense;
            const value = Number(ev.currentTarget.value);

            return this.actor.update({[`data.defenses.${defense}.base`] : value});
        }));
    }
}
