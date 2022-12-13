import { PreparedPillarsHeadquartersData } from "../../global";
import { hasXPData, ItemType } from "../../types/common";
import { Accommodation } from "../../types/headquarters";
import { PillarsItem } from "../item/item-pillars";
import { PILLARS } from "../system/config";
import { getGame } from "../system/utility";
import { PillarsActor } from "./actor-pillars";
import { BasePillarsActorSheet } from "./base-sheet";


type PillarsHeadquartersSheetData = ActorSheet & {
    system : PreparedPillarsHeadquartersData,
    items: HeadquartersSheetItemData
    accommodations : any
    log : any
}

type SheetAccommodation = {
    size? : number
} & Accommodation

type HeadquartersSheetItemData = {
    library: PillarsItem[]
    spaces: PillarsItem[]
    defenses: PillarsItem[]
}


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsHeadquartersSheet extends BasePillarsActorSheet<ActorSheet.Options, PillarsHeadquartersSheetData> {
    /** @override */
    static get defaultOptions() {
        let data = mergeObject(super.defaultOptions, {
            classes: ["pillars-of-eternity", "sheet", "actor"],
            width: 810,
            height: 830,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }],
        });
        data.classes.push("headquarters")
        data.dragDrop.push({ dragSelector: '.actor-list .actor', dropSelector: null })

        return data
    }

    get template() {
            return "systems/pillars-of-eternity/templates/actor/actor-headquarters-sheet.html"
    }

    async getData()
    {
        let data = await super.getData()
        data.system = data.actor.system
        data.items = this.constructItemLists(data);
        data.accommodations = this.formatAccommodations(data)
        data.log = this.formatLog(data)
        return data

    }


    constructItemLists(sheetData: PillarsHeadquartersSheetData): HeadquartersSheetItemData {
        let items: HeadquartersSheetItemData = <HeadquartersSheetItemData>{};

        items.library = sheetData.actor.getItemTypes(ItemType.equipment).filter(i => ["book", "grimoire"].includes(i.system.category.value))
        items.spaces = sheetData.actor.getItemTypes(ItemType.space)
        items.defenses = sheetData.actor.getItemTypes(ItemType.defense)

        return items;
      }

    formatAccommodations(sheetData: PillarsHeadquartersSheetData) : SheetAccommodation[] {
        return sheetData.system.accommodations.list.map((a : SheetAccommodation)=> {

            //  Attempting to reflect larger sized actors taking up more space : make accommodation element bigger
            let size = Math.max(1, a.occupants!.filter(o => o).reduce((acc : number, actor : PillarsActor) => acc + (actor.system.size.value || 1), 0));
            a.size = Math.max(a.occupants!.length * 60, size * 100);
            return a
        })
    }

    formatLog(sheetData : PillarsHeadquartersSheetData)
    {
        let log : Record<string, Record<string, string[]>> = {}

        let html = `<ul>`

        sheetData.system.log.forEach((entry)=> {
            let yearEntry = log[entry.year] || {}
            if (!log[entry.year])
                log[entry.year] = yearEntry

            if (yearEntry?.[entry.season])
            {
                yearEntry[entry.season]?.push(entry.text)
            }
            else
            {
                yearEntry[entry.season] = [entry.text]
            }
        })

        let years = Object.keys(log)
        let entries = Object.values(log)

        let logArray = entries.map((seasons, index) => {
            return {year : Number(years[index]), seasons}
        }).sort((a, b) => b.year - a.year)



        for(let group of logArray)
        {
            html += `<li class="log-group"><div class="year">${group.year}</div>`
            Object.keys(group.seasons).reverse().forEach(seasonNum => {
                html += `<div class="season">${PILLARS.seasons[Number(seasonNum) as keyof typeof PILLARS.seasons]}</div>`
                group.seasons[seasonNum]?.forEach(entry => {
                    html += `<div class="entry">${entry}</div>`
                })
            })
            html += "</li>"
        }
        html += "</ul>"

        return html
    }

    async _onDrop(ev : DragEvent) {

        let data = JSON.parse(ev.dataTransfer?.getData("text/plain")!);

        if (data.type == "Actor")
        {
            this._onDropResident(data)
        }
        else if (data.type == "Item")
        {
            let item = await fromUuid(data.uuid) as PillarsItem;
            if (item.type != "space" &&
                item.type != "defense" &&
                item.system.category?.value != "grimoire" &&
                item.system.category?.value != "book")
            {
                ui.notifications?.error("Invalid item type for Headquarters")
            }
            else
                this.actor.createEmbeddedDocuments("Item", [{...item.toObject()}])
        }
        else
            super._onDrop(ev)
    }


    activateListeners(html : JQuery<HTMLElement>)
    {
        super.activateListeners(html)
        if (!this.isEditable) return

        const dragDrop = new DragDrop({
            dragSelector: ".actor-drag",
            dropSelector : ".actor-drop",
            permissions : {dragstart : () => true, drop : () => true},
            callbacks : { drop: this._onActorDrop.bind(this), dragstart : this._onActorDrag.bind(this) }
          })

        dragDrop.bind(html[0]!)

        html.find(".resident-remove").on("click", this._onRemoveResident.bind(this))
        html.find(".resident-edit").on("change", this._onEditResident.bind(this))
        html.find(".prepare").on("click", this._onUnpreparedClick.bind(this))
        html.find(".transfer").on("click", this._onTransferClicked.bind(this))
        html.find(".accomm-action").on("click", this._onAccommAction.bind(this))
        html.find(".resident-sheet").on("click", this._onResidentClick.bind(this))

    }

    _onUnpreparedClick(ev : JQuery.ClickEvent) {
        let game = getGame()
        let index = Number($(ev.currentTarget).parents(".accomm-container").attr("data-index"));
        if (game.user!.isGM)
        {
            let current = this.object.system.accommodations.list[index].prepared
            this.object.update({"system.accommodations.list" : this.object.system.accommodations.edit(index, {prepared: !current})})
        }
        else if (game.user!.character) {
            Dialog.confirm({
                title: game.i18n.localize('PILLARS.PrepareAccommodation'),
                content: `<p>${game.i18n.format('PILLARS.PrepareAccommodationPrompt', {name : game.user?.character.name})}</p>`,
                yes: async () => {
                    if (game.pillars.time.currentSeasonDataFor(game.user!.character!))
                    {
                        return ui.notifications!.error("Seasonal Activity already exists for this season")
                    }
                    else if (game.user!.character)
                    {
                        let skill = game.user!.character.getItemTypes(ItemType.skill).find(i => i.name?.includes("Housekeeping"))
                        if (!skill)
                            skill = game.items!.contents.find(i => i.type == "skill" && i.name?.includes("Housekeeping"))
                        let skillObject = skill?.toObject()
                        if (hasXPData(skillObject))
                        {
                            skillObject.data.xp.value += 10
                        }

                        await game.pillars.time.updateSeasonAtYear(
                            game.user?.character!,
                            game.pillars.time.current.year,
                            game.pillars.time.current.key as "spring" | "summer" | "autumn" | "winter",
                            `Practice (Prepared Accommodotation): +10 Housekeeping`)
                        await game.user?.character.update(...[{skillObject}])
                    }
                    else
                    {
                        return ui.notifications!.error("No Assigned Character")
                    }
                    this.object.update({
                            "system.accommodations.list" : this.object.system.accommodations.edit(index, {prepared: true}),
                            "system.log" : this.object.system.addToLog(this.object.system.accommodations.list[index].label + " was prepared")
                        })
                },
                no: () => {},
              });
        }
    }

    _onAccommAction(ev : JQuery.ClickEvent) {
        let action = ev.currentTarget.dataset.action as string;

        if (action == "reset")
        {
            this._onResetAccommodations();
        }

        if (action == "edit")
        {
            this._onEditAccommodation(ev);
        }


    }

    _onResetAccommodations() {
        this.object.update({"system.accommodations.list" : this.object.system.accommodations.reset()});
    }

    _onEditAccommodation(ev : JQuery.ClickEvent)
    {
        let index = $(ev.currentTarget).parents(".accomm-container").attr("data-index")
        if (!Number.isNumeric(index))
            return

        let accomm = this.object.system.accommodations.list[index!]
        let game = getGame()

        let GMcontent = game.user!.isGM ? `
        <div class="form-group">
        <label>Prepared</label>
        <input type="checkbox" ${accomm.prepared ? "checked" : ""}>
        </div>`
        : ""



        let content = `
        <form>
        <div class="form-group">
        <label>Label</label>
        <input type="text" value="${accomm.label}">
        </div>
        ${GMcontent}
        </form>`

        new Dialog({
            title : "Edit Accommodation",
            content,
            buttons : {
                submit : {
                    label : "Submit",
                    callback : (dlg) => {
                        dlg = $(dlg)
                        let labelInput = dlg.find<HTMLInputElement>("input")[0]!
                        let preparedInput = dlg.find<HTMLInputElement>("input")[1]!
                        let update : {label : string, prepared: boolean, occupantIds? : string[]} = {label : labelInput.value, prepared : preparedInput.checked}

                        if (!update.prepared)
                            update.occupantIds = []

                        this.object.update({"system.accommodations.list" : this.object.system.accommodations.edit(index, update)})
                    }
                }
            },
            default: "submit"
        }).render(true)
    }

    async _onActorDrop(ev : DragEvent) {
        let data : {id : string | undefined, from: number} = JSON.parse(ev.dataTransfer?.getData("text/plain") || "");
        let index = ((ev.currentTarget as HTMLElement).dataset.index)
        let fromIndex = data.from
        if (Number(fromIndex) == Number(index))
            return

        if (index && Number.isNumeric(index))
        {
            let to = this.object.system.accommodations.list[index]
            if (to.status == "unprepared")
                return
        }

        // Clear previous accommodation, if any
        if (fromIndex && Number.isNumeric(fromIndex))
        {
            await this.object.update({"system.accommodations.list" : this.object.system.accommodations.removeActorFrom(fromIndex, data.id) })
        }

        if (index)
            this.object.update({"system.accommodations.list" : this.object.system.accommodations.addActorTo(index, data.id)})
    }

    _onActorDrag(ev : DragEvent) {
        ev.dataTransfer?.setData("text/plain", JSON.stringify({id : (<HTMLElement>ev.currentTarget).dataset.id as string, from: $(<HTMLElement>ev.currentTarget).parents(".accomm-container").attr("data-index")}))
    }

    _onRemoveResident(ev : JQuery.ClickEvent)
    {
        let li = $(ev.currentTarget).parents(".item")[0];
        let type = li?.dataset.type as string
        let index = Number(li?.dataset.index);
        let list = this.object.system[type].remove(index)
        this.object.update({[`system.${type}.list`] : list, "system.log" : this.object.system.addToLog(this.object.system[type].list[index].document.name + " Left")})
    }

    _onEditResident(ev : JQuery.ChangeEvent)
    {
        let li = $(ev.currentTarget).parents(".item")[0];
        let type = li?.dataset.type as string;
        let target = ev.currentTarget.dataset.target
        let value = ev.currentTarget.value
        if (Number.isNumeric(value))
        {
            value = Number(value)
        }

        let list = this.object.system[type].edit(Number(li?.dataset.index), {[`${target}`] : value})

        this.object.update({[`system.${type}.list`] : list}, {diff: false})
    }

    _onResidentClick(ev : JQuery.ClickEvent)
    {
        let li= $(ev.currentTarget).parents(".item")
        let type = li.attr("data-type") || "";
        let index = Number(li.attr("data-index"));

        this.object.system[type].list[index].document?.sheet.render(true)

    }

    async _onDropResident(dragData : {uuid : string, type : string})
    {
        let actor = await fromUuid(dragData.uuid) as Actor

        // Return if invalid
        if (this.object.type != "headquarters" || actor?.type == "headquarters") return

        new Dialog({
            title : "Resident or Staff",
            content : "Resident or Staff?",
            buttons : {
                "resident" : {
                    label : "Resident",
                    callback : () => {
                        let list = this.object.system.residents.add(actor)
                        this.object.update({"system.residents.list" : list, "system.log" : this.object.system.addToLog(`${actor.name} Arrived (Resident)`)})
                    }
                },
                "staff" : {
                    label : "Staff",
                    callback : () => {
                        let list = this.object.system.staff.add(actor, "staff")
                        this.object.update({"system.staff.list" : list,  "system.log" : this.object.system.addToLog(`${actor.name} Arrived (Staff)`)})
                    }
                }
            }
        }).render(true)
    }


    async _onTransferClicked(ev : JQuery.ClickEvent) {

        let options = this.object.system.residents.list
        .map((i : {document : PillarsActor}) => i.document)
        .filter((i : PillarsActor) => i.isOwner)
        .map((i : PillarsActor) => {
            return `<option ${getGame().user!.character?.id == i.id ? "selected" : ""} value=${i.id}>${i.name}</option>`
        })


        let content = `
        <form>
            <div class="form-group">
                <label>Actor</label>
                <select>
                    <option></option>
                    ${options.join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" >
            </div>
        </form>
        `


        new Dialog({
            title : "Transfer Money",
            content,
            buttons : {
                deposit : {
                    label : getGame().i18n!.localize("PILLARS.Deposit"),
                    callback: async (dlg) => {
                        dlg = $(dlg)
                        let value = Number(dlg.find<HTMLInputElement>("input")[0]?.value) || 0
                        let id = dlg.find<HTMLInputElement>("select")[0]?.value

                        let actor = this.object.system.residents.list.find ((i : {document: PillarsActor} )=> i.document?.id == id)?.document
                        if (actor)
                        {
                            if (value > actor.system.wealth.cp)
                                return ui.notifications!.error("Not Enough Money")

                            else
                            {
                                await actor.update({"system.wealth.cp" : actor.system.wealth.cp + (-value)})
                            }

                        }
                        else if (!getGame().user!.isGM)
                        {
                            return ui.notifications!.error("No Actor Found")
                        }

                        await this.object.update({"system.treasury.value" : this.object.system.treasury.value + value, "system.log" : this.object.system.addToLog(`Deposited ${value}`)})
                    }
                },
                withdraw : {
                    label : getGame().i18n!.localize("PILLARS.Withdraw"),
                    callback: async (dlg) => {
                        dlg = $(dlg)
                        let value = Number(dlg.find<HTMLInputElement>("input")[0]?.value) || 0
                        let id = dlg.find<HTMLInputElement>("select")[0]?.value

                        let actor = this.object.system.residents.list.find ((i : {document: PillarsActor} )=> i.document?.id == id)?.document
                        if (actor)
                        {
                            if (value > this.object.system.treasury.value)
                                return ui.notifications!.error("Not Enough Money")

                            else
                            {
                                await actor.update({"system.wealth.cp" : actor.system.wealth.cp + value})
                                await this.object.update({"system.treasury.value" : this.object.system.treasury.value + (-value), "system.log" : this.object.system.addToLog(`Withdrew ${value}`)})
                            }

                        }
                        else
                        {
                            return ui.notifications!.error("No Actor Found")
                        }

                    }
                }
            }
        }).render(true)
    }

}

