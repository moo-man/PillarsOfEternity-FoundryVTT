import { PowerGroups } from "../../../../types/powers";
import { getGame } from "../../../system/utility";
import activateSharedListeners from "../shared/listeners";

export class BasePillarsActorSheet<Options extends ActorSheet.Options = ActorSheet.Options, Data extends object = ActorSheet.Data<Options>> extends ActorSheet<Options, Data> 
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["pillars-of-eternity", "actor"]);
        options.width = 1200;
        options.height = 700;
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        options.scrollY = options.scrollY.concat([".tab-content", ".tab"]);
        return options;
    }

    get template(): string 
    {
        return `systems/pillars-of-eternity/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    }

    /* -------------------------------------------- */
    /** @override */
    activateListeners(html: JQuery<HTMLElement>): void 
    {
        super.activateListeners(html);
        activateSharedListeners(html, this as BasePillarsActorSheet);
        html.find(".item-dropdown").on("click", this._onDropdown.bind(this));
        html.find(".item-dropdown-rc").on("contextmenu", this._onDropdown.bind(this));
        html.find(".post-hover").on("mouseenter", this._onPostItemEnter.bind(this));
        html.find(".post-hover").on("mouseleave", this._onPostItemLeave.bind(this));
    }

    _onPostItemEnter(event : JQuery.MouseEnterEvent)
    {
        const img = $(event.currentTarget).find("img");
        $(event.currentTarget).prepend(`<a class="list-post list-image"><i class="fa-solid fa-comment"></i></a>`);
        img.hide();
    }

    _onPostItemLeave(event : JQuery.MouseLeaveEvent)
    {
        $(event.currentTarget).find("img").show();
        $(event.currentTarget).find(".list-post").remove();
    }

    _onDrop(event: DragEvent) 
    {
        try 
        {
            const dragData = JSON.parse(event.dataTransfer?.getData("text/plain") || "");
            if (dragData.type == "item") {this.actor.createEmbeddedDocuments("Item", [dragData.payload]);}
            else {super._onDrop(event);}
        }
        catch (e) 
        {
            super._onDrop(event);
        }
    }

    _onDropdown(event: JQuery.UIEventBase) 
    {
        const itemId = $(event.currentTarget).parents("[data-id]")[0]?.dataset.id;
        const item = this.actor.items.get(itemId!);
        if (item) {this._dropdown(event, item.dropdownData());}
    }

    async _dropdown(event: JQuery.UIEventBase, dropdownData : {text: string, groups? : PowerGroups}) 
    {
        let dropdownHTML = "";
        event.preventDefault();
        const li = $(event.currentTarget!).parents(".item");
        // Toggle expansion for an item
        if (li.hasClass("expanded")) 
        {
            // If expansion already shown - remove
            const summary = li.children(".item-summary");
            summary.slideUp(200, () => summary.remove());
        }
        else 
        {
            // Add a div with the item summary belowe the item
            if (!dropdownData) 
            {
                return;
            }
            else 
            {
                dropdownHTML = `<div class="item-summary">${TextEditor.enrichHTML(dropdownData.text)}`;
            }
            if (dropdownData.groups) 
            {
                let groups = `<div class='power-groups'>`;
                for (const g in dropdownData.groups) 
                {
                    const html = await renderTemplate("systems/pillars-of-eternity/templates/partials/power-group.hbs", { group: dropdownData.groups[g], groupId: g });
                    groups = groups.concat(html);
                }
                dropdownHTML = dropdownHTML.concat(groups);
            }
            dropdownHTML += "</div>";
            const div = $(dropdownHTML);
            li.append(div.hide());
            div.slideDown(200);
        }
        li.toggleClass("expanded");
    }

}
