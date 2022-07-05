import { stringToElement } from "../system/utility";
import { PillarsActorSheet } from "./actor-sheet";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsFollowerSheet extends PillarsActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["pillars-of-eternity", "sheet", "actor"],
            template: "systems/pillars-of-eternity/templates/actor/actor-sheet.html",
            width: 810,
            height: 830,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }],
            scrollY: [".details", ".inventory-lists", ".items", ".powers" , ".general"]
        });
    }

    get template() {
            return "systems/pillars-of-eternity/templates/actor/actor-follower-sheet.html"
    }

    checkAlerts(): void {

        if (this.actor.data.type == "follower" && !this.actor.subtype!.value)
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
