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
        return mergeObject(super.defaultOptions, {
            width: 810,
            height: 830
        });
    }

    get template() 
    {
        return "systems/pillars-of-eternity/templates/actor/actor-npc-sheet.hbs";
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
