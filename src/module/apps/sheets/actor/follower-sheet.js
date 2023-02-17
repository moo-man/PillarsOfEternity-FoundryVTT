import { PillarsCharacterSheet } from "./character-sheet";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsFollowerSheet extends PillarsCharacterSheet 
{
    /** @override */
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.width = 810,
        options.height = 830,
        options.classes.push("follower");
        return options;
    }


    checkAlerts()
    {

        if (!this.actor.system.subtype.value)
        {
            const typeSelect = this.element.find<HTMLSelectElement>(".subtype")[0];
            if (typeSelect)
            {
                typeSelect.classList.add("alert");
                typeSelect.innerHTML = '<a class="alert"><i class="fas fa-exclamation-circle"></i></a>' + typeSelect.innerHTML;
                //typeSelect.insertAdjacentElement("beforebegin", stringToElement('<i class="fas fa-exclamation-circle"></i>')!)
            }
        }
        
    }

    async _onDropItem(event, data)
    {
        if ( !this.actor.isOwner ) {return false;}
        const item = await Item.fromDropData(data);
        if (item?.data.type == "species")
        {
            // Add special handling when followers are given a species
            return super._onDropItem(event, data).then(() =>  
            {
                this.actor.setFollowerSpecies(item);
            });
        }
    }


    activateListeners(html)
    {
        super.activateListeners(html);


        if (!this.isEditable) {return;}


        html.find(".subtype").on("change", (ev)=> 
        {
            this.actor.setFollowerType(ev.target.value);
        });

    }
}
