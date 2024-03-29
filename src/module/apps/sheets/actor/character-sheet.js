import PowerTemplate from "../../../system/power-template";
import ActorConfigure from "../../actor-configure";
import { PILLARS_UTILITY } from "../../../system/utility";
import { BasePillarsActorSheet } from "./base-sheet";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsCharacterSheet extends BasePillarsActorSheet
{

    /** @override */
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["character"]);
        options.width = 1200;
        options.height = 700;
        options.scrollY = options.scrollY.concat([".attributes", ".skills"]);
        return options;
    }

    checkAlerts() 
    {
        this.checkSeasonAlerts();
    }

    checkSeasonAlerts()
    {
    // Change the seasons button color if seasons need updating
        const buttons = this.element.find(".header-button.seasons")[0];
        if (buttons)
        {
            const icon = buttons.firstElementChild;
            if(game.pillars.time.seasonsNeedUpdating(this.actor))
            {
                buttons.classList.add("alert");
                if (icon)
                {icon.classList.replace("fa-book", "fa-exclamation-circle");}
            }
            else
            {
                buttons.classList.remove("alert");
                if (icon)
                {icon.classList.replace("fa-exclamation-circle", "fa-book");}
            }
        }
    }

    /**
   * Override header buttons to add custom ones.
   */
    _getHeaderButtons() 
    {
        const buttons = super._getHeaderButtons();
        if (this.actor.type == "character") 
        {
            buttons.unshift({
                class: "seasons",
                label: game.i18n.localize("PILLARS.Seasons"),
                icon: "fas fa-book",
                onclick: () => 
                {
                    this.actor.book.render(true);
                },
            });
        }
        buttons.unshift({
            class: "configure",
            label: "",
            icon: "fas fa-wrench",
            onclick: async () => new ActorConfigure(this.actor).render(true),
        });
        return buttons;
    }

    prepareSheetData(sheetData) 
    {
        super.prepareSheetData(sheetData);
        this._enrichConnections(sheetData);
        this._createDeathMarchArray(sheetData);
    }


    constructPowerDisplay(sheetData) 
    {
        const game = game;

        sheetData.items.powers.forEach((p) => 
        {
            if (p.data.type == "power")
            {
                const lowestKey = Object.keys(p.data.groups || {})
                    .filter((i) => i)
                    .sort((a, b) => a > b ? 1 : -1)[0] || game.i18n.localize("Default");
                p.data.display = p.data.groups?.[lowestKey];
            }
        });
    }

    _enrichConnections(sheetData) 
    {
        if (sheetData.actor.data.type == "character") 
        {
            const connections = sheetData.actor.system.connections;
            sheetData.Connections = connections.map(i => 
            {
                const actor = game.actors.getName(i.name);
                return {
                    name: i.name,
                    img: actor ? actor.prototypeToken.texture.src || "" : "",
                    id: actor ? actor.id : "",
                };
            });
        }
    }


    _createDeathMarchArray(sheetData)
    {
        if (this.actor.type == "character") 
        {
            const marchVal = (sheetData.system).life.march;
            sheetData.deathMarch = [];

            for (let i = 0; i < 7; i++) 
            {
                if (i + 1 <= marchVal) {sheetData.deathMarch.push(`<i class="far fa-check-square"></i>`);}
                else {sheetData.deathMarch.push(`<i class="far fa-square"></i>`);}
            }

            if (marchVal != 7) {sheetData.deathMarch[6] = `<i style="opacity:0.2" class="fas fa-skull"></i>`;}
            else {sheetData.deathMarch[6] = `<i class="fas fa-skull"></i>`;}
        }
    }

    /* -------------------------------------------- */
    /** @override */
    activateListeners(html)
    {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) {return;}

        $("input").on("focusin", (ev => 
        {
            $(ev.target).trigger("select");
        }));

        html.find(".create-connection").on("click", this._onCreateConnection.bind(this));
        html.find(".edit-connection").on("click", this._onEditConnection.bind(this));
        html.find(".delete-connection").on("click", this._onDeleteConnection.bind(this));
        html.find(".connection-name").on("click", this._onConnectionClick.bind(this));
        html.on("click", ".power-target", this._onPowerTargetClick.bind(this));
        html.find(".age-roll").on("click", this._onAgeRoll.bind(this));
        html.find(".displayGroup").on("click", this._onDisplayGroupClick.bind(this));
    }




    _onCounterClick(event) 
    {
        let multiplier = event.button == 0 ? 1 : -1;
        multiplier = event.ctrlKey ? multiplier * 10 : multiplier;

        let target = $(event.currentTarget).attr("data-target");
        if (target == "item") 
        {
            target = $(event.currentTarget).attr("data-item-target");
            const item = this.actor.items.get($(event.currentTarget).parents(".item").attr("data-id"));
            if (item && target) {return item.update({ [`${target}`]: getProperty(item.data, target) + multiplier });}
        }
        if (target) {return this.actor.update({ [`${target}`]: getProperty(this.actor.data, target) + multiplier });}
    }


    _onCreateConnection() 
    {
        if (this.actor.data.type != "character")
        {return;}
        const connections = duplicate(this.actor.system.connections || []);
        if (connections) 
        {
            connections.push({ name: game.i18n.format("PILLARS.NewConnection")});
            this.actor.update({ "system.connections": connections });
        }
    }

    _onEditConnection(event) 
    {
        if (this.actor.data.type != "character")
        {return;}
        const index = parseInt($(event.currentTarget).parents(".item").attr("data-index") || "");
        const connections = duplicate(this.actor.system.connections || []);
        const game = game;
        new Dialog({
            title: game.i18n.localize("PILLARS.ChangeConnection"),
            content: `
            ${game.i18n.localize("PILLARS.PromptConnectionName")}</p>
            <div class="form-group">
            <input type="text" name="connection" value=${connections[index].name}>
            </div>
            `,
            buttons: {
                submit: {
                    label: "Submit",
                    callback: (dlg) => 
                    {
                        const newName = ($(dlg).find("[name='connection']")[0]).value || "";
                        connections[index].name = newName;
                        this.actor.update({ "system.connections": connections });
                    },
                },
            },
            default: "submit",
        }).render(true);
    }

    _onDeleteConnection(event) 
    {
        if (this.actor.data.type != "character")
        {return;}
        const index = parseInt($(event.currentTarget).parents(".item").attr("data-index") || "");
        const connections = duplicate(this.actor.system.connections || []);
        connections.splice(index, 1);
        this.actor.update({ "system.connections": connections });
    }

    _onConnectionClick(event) 
    {
        const id = $(event.currentTarget).parents(".item").attr("data-actor-id");
        if (id) {game.actors.get(id)?.sheet?.render(true);}
    }

    _onPowerTargetClick(event) 
    {
        const itemId = $(event.currentTarget).parents("[data-id]")[0]?.dataset.id;
        const index = parseInt($(event.currentTarget).attr("data-index") || "0");
        const item = this.actor.items.get(itemId);
        if (item)
        {
            const groupId = item.displayGroupKey(); //$(event.currentTarget).attr("data-group")
            PowerTemplate.fromItem(item, groupId, index)?.drawPreview();
        }
    }

    async _onAgeRoll() 
    {
        const check = await this.actor.setupAgingRoll();
        await check?.rollCheck();
        check?.sendToChat();
    }

    _onDisplayGroupClick(event) 
    {
        const itemId = $(event.currentTarget).parents("[data-id]")[0]?.dataset.id;
        const item = this.actor.items.get(itemId);
        let groupIndex = item?.getFlag("pillars-of-eternity", "displayGroup");
        if (item?.data.type == "power")
        {
            if (!Number.isNumeric(groupIndex)) {groupIndex = 0;}
            else if (typeof groupIndex == "number") {groupIndex++;}
            if (groupIndex >= Object.keys(item.data.groups || {}).length) {groupIndex = game.i18n.localize("Default");}
        }

        return item?.setFlag("pillars-of-eternity", "displayGroup", groupIndex);
    }


    _onEmbeddedValueClick(event) 
    {
        const itemId = $(event.currentTarget).parents("[data-id]")[0]?.dataset.id;
        const item = this.actor.items.get(itemId);
        if (item) 
        {
            const embedded = duplicate(item.system.embedded);

            if (event.button == 0) {embedded.uses.value++;}
            else {embedded.uses.value--;}

            embedded.uses.value = Math.clamped(embedded.uses.value, 0, embedded.uses.max);

            item.update({ "system.embedded": embedded });
        }
    }


}
