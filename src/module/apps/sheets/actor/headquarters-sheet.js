import { PILLARS } from "../../../system/config";
import { BasePillarsActorSheet } from "./base-sheet";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsHeadquartersSheet extends BasePillarsActorSheet
{
    /** @override */
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.width = 810,
        options.height = 830,
        options.classes.push("headquarters");
        options.dragDrop.push({ dragSelector: ".actor-list .actor", dropSelector: null });
        return options;
    }

    async getData()
    {
        const data = await super.getData();
        data.system = data.actor.system;
        data.items = this.constructItemLists(data);
        data.accommodations = this.formatAccommodations(data);
        data.log = this.formatLog(data);
        return data;

    }


    constructItemLists(sheetData) 
    {
        const items = {};

        items.library = sheetData.actor.getItemTypes("equipment").filter(i => ["book", "grimoire"].includes(i.system.category.value));
        items.spaces = sheetData.actor.getItemTypes("space");
        items.defenses = sheetData.actor.getItemTypes("defense");

        return items;
    }

    formatAccommodations(sheetData)
    {
        return sheetData.system.accommodations.list.map((a)=> 
        {

            //  Attempting to reflect larger sized actors taking up more space : make accommodation element bigger
            const size = Math.max(1, a.occupants.filter(o => o).reduce((acc, actor) => acc + (actor.system.size.value || 1), 0));
            a.size = Math.max(a.occupants.length * 60, size * 100);
            return a;
        });
    }

    formatLog(sheetData)
    {
        const log = {};

        let html = `<ul>`;

        sheetData.system.log.forEach((entry)=> 
        {
            const yearEntry = log[entry.year] || {};
            if (!log[entry.year])
            {log[entry.year] = yearEntry;}

            if (yearEntry?.[entry.season])
            {
                yearEntry[entry.season]?.push(entry.text);
            }
            else
            {
                yearEntry[entry.season] = [entry.text];
            }
        });

        const years = Object.keys(log);
        const entries = Object.values(log);

        const logArray = entries.map((seasons, index) => 
        {
            return {year : Number(years[index]), seasons};
        }).sort((a, b) => b.year - a.year);



        for(const group of logArray)
        {
            html += `<li class="log-group"><div class="year">${group.year}</div>`;
            Object.keys(group.seasons).reverse().forEach(seasonNum => 
            {
                html += `<div class="season">${PILLARS.seasons[Number(seasonNum)]}</div>`;
                group.seasons[seasonNum]?.forEach(entry => 
                {
                    html += `<div class="entry">${entry}</div>`;
                });
            });
            html += "</li>";
        }
        html += "</ul>";

        return html;
    }

    async _onDrop(ev) 
    {

        const data = JSON.parse(ev.dataTransfer?.getData("text/plain"));

        if (data.type == "Actor")
        {
            this._onDropResident(data);
        }
        else if (data.type == "Item")
        {
            const item = await fromUuid(data.uuid);
            if (item.type != "space" &&
                item.type != "defense" &&
                item.system.category?.value != "grimoire" &&
                item.system.category?.value != "book")
            {
                ui.notifications?.error("Invalid item type for Headquarters");
            }
            else
            {this.actor.createEmbeddedDocuments("Item", [{...item.toObject()}]);}
        }
        else
        {super._onDrop(ev);}
    }


    activateListeners(html)
    {
        super.activateListeners(html);
        if (!this.isEditable) {return;}

        const dragDrop = new DragDrop({
            dragSelector: ".actor-drag",
            dropSelector : ".actor-drop",
            permissions : {dragstart : () => true, drop : () => true},
            callbacks : { drop: this._onActorDrop.bind(this), dragstart : this._onActorDrag.bind(this) }
        });

        dragDrop.bind(html[0]);

        html.find(".resident-remove").on("click", this._onRemoveResident.bind(this));
        html.find(".resident-edit").on("change", this._onEditResident.bind(this));
        html.find(".prepare").on("click", this._onUnpreparedClick.bind(this));
        html.find(".transfer").on("click", this._onTransferClicked.bind(this));
        html.find(".accomm-action").on("click", this._onAccommAction.bind(this));
        html.find(".resident-sheet").on("click", this._onResidentClick.bind(this));

    }

    _onUnpreparedClick(ev) 
    {
        const index = Number($(ev.currentTarget).parents(".accomm-container").attr("data-index"));
        if (game.user.isGM)
        {
            const current = this.object.system.accommodations.list[index].prepared;
            this.object.update({"system.accommodations.list" : this.object.system.accommodations.edit(index, {prepared: !current})});
        }
        else if (game.user.character) 
        {
            Dialog.confirm({
                title: game.i18n.localize("PILLARS.PrepareAccommodation"),
                content: `<p>${game.i18n.format("PILLARS.PrepareAccommodationPrompt", {name : game.user?.character.name})}</p>`,
                yes: async () => 
                {
                    if (game.pillars.time.currentSeasonDataFor(game.user.character))
                    {
                        return ui.notifications.error("Seasonal Activity already exists for this season");
                    }
                    else if (game.user.character)
                    {
                        let skill = game.user.character.getItemTypes("skill").find(i => i.name?.includes("Housekeeping"));
                        if (!skill)
                        {skill = game.items.contents.find(i => i.type == "skill" && i.name?.includes("Housekeeping"));}
                        const skillObject = skill?.toObject();
                        if (hasXPData(skillObject))
                        {
                            skillObject.data.xp.value += 10;
                        }

                        await game.pillars.time.updateSeasonAtYear(
                            game.user?.character,
                            game.pillars.time.current.year,
                            game.pillars.time.current.key,
                            `Practice (Prepared Accommodotation): +10 Housekeeping`);
                        await game.user?.character.update(...[{skillObject}]);
                    }
                    else
                    {
                        return ui.notifications.error("No Assigned Character");
                    }
                    this.object.update({
                        "system.accommodations.list" : this.object.system.accommodations.edit(index, {prepared: true}),
                        "system.log" : this.object.system.addToLog(this.object.system.accommodations.list[index].label + " was prepared")
                    });
                },
                no: () => {},
            });
        }
    }

    _onAccommAction(ev) 
    {
        const action = ev.currentTarget.dataset.action;

        if (action == "reset")
        {
            this._onResetAccommodations();
        }

        if (action == "edit")
        {
            this._onEditAccommodation(ev);
        }


    }

    _onResetAccommodations() 
    {
        this.object.update({"system.accommodations.list" : this.object.system.accommodations.reset()});
    }

    _onEditAccommodation(ev)
    {
        const index = $(ev.currentTarget).parents(".accomm-container").attr("data-index");
        if (!Number.isNumeric(index))
        {return;}

        const accomm = this.object.system.accommodations.list[index];

        const GMcontent = game.user.isGM ? `
        <div class="form-group">
        <label>Prepared</label>
        <input type="checkbox" ${accomm.prepared ? "checked" : ""}>
        </div>`
            : "";



        const content = `
        <form>
        <div class="form-group">
        <label>Label</label>
        <input type="text" value="${accomm.label}">
        </div>
        ${GMcontent}
        </form>`;

        new Dialog({
            title : "Edit Accommodation",
            content,
            buttons : {
                submit : {
                    label : "Submit",
                    callback : (dlg) => 
                    {
                        dlg = $(dlg);
                        const labelInput = dlg.find<HTMLInputElement>("input")[0];
                        const preparedInput = dlg.find<HTMLInputElement>("input")[1];
                        const update = {label : labelInput.value, prepared : preparedInput.checked};

                        if (!update.prepared)
                        {update.occupantIds = [];}

                        this.object.update({"system.accommodations.list" : this.object.system.accommodations.edit(index, update)});
                    }
                }
            },
            default: "submit"
        }).render(true);
    }

    async _onActorDrop(ev) 
    {
        const data = JSON.parse(ev.dataTransfer?.getData("text/plain") || "");
        const index = (ev.currentTarget.dataset.index);
        const fromIndex = data.from;
        if (Number(fromIndex) == Number(index))
        {return;}

        if (index && Number.isNumeric(index))
        {
            const to = this.object.system.accommodations.list[index];
            if (to.status == "unprepared")
            {return;}
        }

        // Clear previous accommodation, if any
        if (fromIndex && Number.isNumeric(fromIndex))
        {
            await this.object.update({"system.accommodations.list" : this.object.system.accommodations.removeActorFrom(fromIndex, data.id) });
        }

        if (index)
        {this.object.update({"system.accommodations.list" : this.object.system.accommodations.addActorTo(index, data.id)});}
    }

    _onActorDrag(ev) 
    {
        ev.dataTransfer?.setData("text/plain", JSON.stringify({id : ev.currentTarget.dataset.id, from: $(ev.currentTarget).parents(".accomm-container").attr("data-index")}));
    }

    _onRemoveResident(ev)
    {
        const li = $(ev.currentTarget).parents(".item")[0];
        const type = li?.dataset.type;
        const index = Number(li?.dataset.index);
        const list = this.object.system[type].remove(index);
        this.object.update({[`system.${type}.list`] : list, "system.log" : this.object.system.addToLog(this.object.system[type].list[index].document.name + " Left")});
    }

    _onEditResident(ev)
    {
        const li = $(ev.currentTarget).parents(".item")[0];
        const type = li?.dataset.type;
        const target = ev.currentTarget.dataset.target;
        let value = ev.currentTarget.value;
        if (Number.isNumeric(value))
        {
            value = Number(value);
        }

        const list = this.object.system[type].edit(Number(li?.dataset.index), {[`${target}`] : value});

        this.object.update({[`system.${type}.list`] : list}, {diff: false});
    }

    _onResidentClick(ev)
    {
        const li= $(ev.currentTarget).parents(".item");
        const type = li.attr("data-type") || "";
        const index = Number(li.attr("data-index"));

        this.object.system[type].list[index].document?.sheet.render(true);

    }

    async _onDropResident(dragData)
    {
        const actor = await fromUuid(dragData.uuid);

        // Return if invalid
        if (this.object.type != "headquarters" || actor?.type == "headquarters") {return;}

        new Dialog({
            title : "Resident or Staff",
            content : "Resident or Staff?",
            buttons : {
                "resident" : {
                    label : "Resident",
                    callback : () => 
                    {
                        const list = this.object.system.residents.add(actor);
                        this.object.update({"system.residents.list" : list, "system.log" : this.object.system.addToLog(`${actor.name} Arrived (Resident)`)});
                    }
                },
                "staff" : {
                    label : "Staff",
                    callback : () => 
                    {
                        const list = this.object.system.staff.add(actor, "staff");
                        this.object.update({"system.staff.list" : list,  "system.log" : this.object.system.addToLog(`${actor.name} Arrived (Staff)`)});
                    }
                }
            }
        }).render(true);
    }


    async _onTransferClicked() 
    {

        const options = this.object.system.residents.list
            .map(i => i.document)
            .filter(i => i.isOwner)
            .map(i => 
            {
                return `<option ${game.user.character?.id == i.id ? "selected" : ""} value=${i.id}>${i.name}</option>`;
            });


        const content = `
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
        `;


        new Dialog({
            title : "Transfer Money",
            content,
            buttons : {
                deposit : {
                    label : game.i18n.localize("PILLARS.Deposit"),
                    callback: async (dlg) => 
                    {
                        dlg = $(dlg);
                        const value = Number(dlg.find<HTMLInputElement>("input")[0]?.value) || 0;
                        const id = dlg.find<HTMLInputElement>("select")[0]?.value;

                        const actor = this.object.system.residents.list.find (i=> i.document?.id == id)?.document;
                        if (actor)
                        {
                            if (value > actor.system.wealth.cp)
                            {return ui.notifications.error("Not Enough Money");}

                            else
                            {
                                await actor.update({"system.wealth.cp" : actor.system.wealth.cp + (-value)});
                            }

                        }
                        else if (!game.user.isGM)
                        {
                            return ui.notifications.error("No Actor Found");
                        }

                        await this.object.update({"system.treasury.value" : this.object.system.treasury.value + value, "system.log" : this.object.system.addToLog(`Deposited ${value}`)});
                    }
                },
                withdraw : {
                    label : game.i18n.localize("PILLARS.Withdraw"),
                    callback: async (dlg) => 
                    {
                        dlg = $(dlg);
                        const value = Number(dlg.find<HTMLInputElement>("input")[0]?.value) || 0;
                        const id = dlg.find<HTMLInputElement>("select")[0]?.value;

                        const actor = this.object.system.residents.list.find (i => i.document?.id == id)?.document;
                        if (actor)
                        {
                            if (value > this.object.system.treasury.value)
                            {return ui.notifications.error("Not Enough Money");}

                            else
                            {
                                await actor.update({"system.wealth.cp" : actor.system.wealth.cp + value});
                                await this.object.update({"system.treasury.value" : this.object.system.treasury.value + (-value), "system.log" : this.object.system.addToLog(`Withdrew ${value}`)});
                            }

                        }
                        else
                        {
                            return ui.notifications.error("No Actor Found");
                        }

                    }
                }
            }
        }).render(true);
    }

}

