import { stringToElement } from "../../../system/utility";
import { PillarsCharacterSheet } from "./character-sheet";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsFollowerSheet extends PillarsCharacterSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 810,
            height: 830,
        });
    }

    get template() {
            return "systems/pillars-of-eternity/templates/actor/actor-follower-sheet.hbs"
    }

    checkAlerts(): void {

        if (this.actor.data.type == "follower" && !this.actor.system.subtype!.value)
        {
            let typeSelect = this.element.find<HTMLSelectElement>(".subtype")[0]
            if (typeSelect)
            {
                typeSelect.classList.add("alert")
                typeSelect.innerHTML = '<a class="alert"><i class="fas fa-exclamation-circle"></i></a>' + typeSelect.innerHTML
                //typeSelect.insertAdjacentElement("beforebegin", stringToElement('<i class="fas fa-exclamation-circle"></i>')!)
            }
        }
        
    }

    protected async _onDropItem(event: DragEvent, data: ActorSheet.DropData.Item): Promise<unknown> {
        if ( !this.actor.isOwner ) return false;
        const item = await Item.fromDropData(data);
        if (item?.data.type == "species")
        {
            // Add special handling when followers are given a species
            return super._onDropItem(event, data).then(items => {
                this.actor.setFollowerSpecies(item);
            })
        }
    }


    activateListeners(html : JQuery<HTMLElement>)
    {
        super.activateListeners(html)


        if (!this.isEditable) return


        html.find(".subtype").on("change", (ev : JQuery.ChangeEvent)=> {
            this.actor.setFollowerType(ev.target.value)
        })

    }
}
