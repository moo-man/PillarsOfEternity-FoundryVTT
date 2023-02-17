import activateSharedListeners from "../shared/listeners";

export class BasePillarsActorSheet extends ActorSheet
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

    get template() 
    {
        return `systems/pillars-of-eternity/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    }

    /**
   * @param {bool} force      used upstream.
   * @param {Object} options  used upstream.
   */
    async _render(force = false, options = {})
    {
        await super._render(force, options);
        this.checkAlerts();
    }
     
    checkAlerts() { }
     
    /** @override */
    async getData()
    {
        const data = await super.getData();
    
        data.system = data.data.system;
    
        this.prepareSheetData(data);
        data.tooltips = this.actor.flags.tooltips?.toStrings();
        
        return data;
    }

    prepareSheetData(sheetData) 
    {
        sheetData.items = this.constructItemLists(sheetData);
        sheetData.effects = this.constructEffectLists(sheetData);

        if (this.actor.type != "headquarters")
        {
            this._createHealthArray(sheetData.system.health);
            this._createEnduranceArray(sheetData.system.endurance);
            this._createSoakArray(sheetData);
        }
    }

    constructInventory(sheetData)
    {
        const inventory = {
            weapons: {
                label: "Weapons",
                type: "weapon",
                items: sheetData.actor.getItemTypes("weapon"),
            },
            armor: {
                label: "Armor",
                type: "armor",
                items: sheetData.actor.getItemTypes("armor"),
            },
            shields: {
                label: "Shields",
                type: "shield",
                items: sheetData.actor.getItemTypes("shield"),
            },
            tools: {
                label: "Tools",
                type: "equipment",
                items: sheetData.actor.getItemTypes("equipment").filter((i) => i.system.category?.value == "tool"),
            },
            gear: {
                label: "Gear",
                type: "equipment",
                items: sheetData.actor.getItemTypes("equipment").filter((i) => i.system.category?.value == "gear"),
            },
            grimoires: {
                label: "Grimoires",
                type: "equipment",
                items: sheetData.actor.getItemTypes("equipment").filter((i) => i.system.category?.value == "grimoire"),
            },
        };
        return inventory;
    }

    
    constructItemLists(sheetData)
    {
        const items = {};

        items.attributes = { benefits: [], hindrances: [] };
        items.attributes.benefits = sheetData.actor.getItemTypes("attribute").filter((i) => i.system.category?.value == "benefit");
        items.attributes.hindrances = sheetData.actor.getItemTypes("attribute").filter((i) => i.system.category?.value == "hindrance");

        items.skills = sheetData.actor.getItemTypes("skill");
        items.traits = sheetData.actor.getItemTypes("trait");
        items.powers = sheetData.actor.getItemTypes("power").filter((i) => !i.system.embedded?.item);
        items.embeddedPowers = sheetData.actor.getActiveEmbeddedPowers();
        items.powerSources = sheetData.actor.getItemTypes("powerSource");

        items.injuries = sheetData.actor.getItemTypes("injury");
        items.backgrounds = sheetData.actor.getItemTypes("background");
        items.settings = sheetData.actor.getItemTypes("setting");
        items.connections = sheetData.actor.getItemTypes("connection");
        items.reputations = sheetData.actor.getItemTypes("reputation");
        items.bonds = sheetData.actor.getItemTypes("bond");

        items.inventory = this.constructInventory(sheetData);

        items.equipped = {
            meleeWeapons: items.inventory.weapons.items.filter((i) => i.system.equipped?.value && i.isMelee),
            rangedWeapons: items.inventory.weapons.items.filter((i) => i.system.equipped?.value && i.isRanged),
            armor: items.inventory.armor.items.filter((i) => i.system.equipped?.value),
            shields: items.inventory.shields.items.filter((i) => i.system.equipped?.value),
        };
        return items;
    }

    constructEffectLists(sheetData)
    {
        const effects = {};

        effects.temporary = sheetData.actor.effects.filter((i) => i.isTemporary && !i.data.disabled);
        effects.disabled = sheetData.actor.effects.filter((i) => i.data.disabled);
        effects.passive = sheetData.actor.effects.filter((i) => !i.isTemporary && !i.data.disabled);

        return effects;
    }


    _createSoakArray(sheetData) 
    {
        const soakValues = sheetData.system.soak;

        sheetData.soaks = {
            physical: {
                total: soakValues.physical + soakValues.base,
                show: soakValues.physical > 0,
                img: "icons/svg/sword.svg",
            },
            burn: {
                total: soakValues.burn + soakValues.base,
                show: soakValues.burn > 0,
                img: "icons/svg/fire.svg",
            },
            freeze: {
                total: soakValues.freeze + soakValues.base,
                show: soakValues.freeze > 0,
                img: "icons/svg/frozen.svg",
            },
            corrode: {
                total: soakValues.corrode + soakValues.base,
                show: soakValues.corrode > 0,
                img: "icons/svg/acid.svg",
            },
            shock: {
                total: soakValues.shock + soakValues.base,
                show: soakValues.shock > 0,
                img: "icons/svg/lightning.svg",
            },
        };
    }

    _createHealthArray(data)
    {
        let healthBonus, healthPenalty;
        if (data.modifier > 0) {healthBonus = data.modifier;}
        else {healthPenalty = Math.abs(data.modifier);}

        // .map is necessary, without it, all elements in the array point to the same object instance
        data.array = new Array(data.max).fill(undefined).map(() => {return {state : 0};});
        if (healthBonus) {data.array = data.array.concat(new Array(healthBonus).fill(undefined).map(() => {return {state : 0, bonus: true};}));}
        else if (healthPenalty) {data.array = data.array.slice(healthPenalty);}

        let deathBonus, deathPenalty;
        if (data.death.modifier > 0) {deathBonus = data.death.modifier;}
        else {deathPenalty = Math.abs(data.death.modifier);}

        if (deathBonus) {data.array = data.array.concat(new Array(data.death.modifier).fill(undefined).map(() => {return {state : 0, bonus: true};}));}
        else if (deathPenalty) 
        {
            let counter = 0;
            for (let i = data.array.length - 1; i >= 0 && counter < deathPenalty; i--) 
            {
                data.array[i].state = -1;
                counter++;
            }
        }

        data.array.forEach((e, i) => 
        {
            if (i < data.value) {e.state = 1;}
        });

        if (data.wounds) 
        {
            data.array.forEach((e, i) => 
            {
                if (i < data.wounds.value) {e.state = 2;}
            });
        }
    }

    _createEnduranceArray(data)
    {
    // .map is necessary, without it, all elements in the array point to the same object instance
        data.array = new Array(data.max).fill(undefined).map(() => {return {state : 0};});
        if (data.bonus) {data.array = data.array.concat(new Array(data.bonus).fill(undefined).map(() => {return { bonus: true, state: 0 };}));}
        if (data.penalty) 
        {
            let penaltyCounter = 0;
            for (let i = data.array.length - 1; i >= 0 && penaltyCounter < data.penalty; i--) 
            {
                data.array[i].state = -1;
                penaltyCounter++;
            }
        }

        data.array.forEach((e, i) => 
        {
            if (i < data.value) {e.state = 1;}
        });
    }

    
    _getSubmitData(updateData = {}) 
    {
        this.actor.overrides = {};
        let data = super._getSubmitData(updateData);
        data = diffObject(flattenObject(this.actor.toObject(false)), data);
        return data;
    }


    /* -------------------------------------------- */
    /** @override */
    activateListeners(html) 
    {
        super.activateListeners(html);
        activateSharedListeners(html, this);
        html.find(".item-dropdown").on("click", this._onDropdown.bind(this));
        html.find(".item-dropdown-rc").on("contextmenu", this._onDropdown.bind(this));
        html.find(".post-hover").on("mouseenter", this._onPostItemEnter.bind(this));
        html.find(".post-hover").on("mouseleave", this._onPostItemLeave.bind(this));
        html.find(".roll-skill").on("click", this._onSkillRoll.bind(this));
        html.find(".roll-untrained").on("click", this._onUntrainedSkillClick.bind(this));
        html.find(".roll-weapon").on("click", this._onWeaponRoll.bind(this));
        html.find(".roll-power").on("click", this._onPowerRoll.bind(this));
        html.find(".roll-initiative").on("click", this._onInitiativeClick.bind(this));
        html.find(".roll-item-skill").on("click", this._onItemSkillClick.bind(this));
    }

    
    _onInitiativeClick() 
    {
        const game = game;
        new Dialog({
            title: "Roll Initiative",
            content: "",
            buttons: {
                adv: {
                    label: "Advantaged",
                    callback: () => 
                    {
                        this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true, initiativeOptions: { formula: `{2d10, 1d20}kh[${game.i18n.localize("PILLARS.Initiative")}] + (1d12[${game.i18n.localize("PILLARS.Tiebreaker")}] / 100) + @initiative.value` } });
                    },
                },
                normal: {
                    label: "Normal",
                    callback: () => 
                    {
                        this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true });
                    },
                },
                dis: {
                    label: "Disadvantaged",
                    callback: () => 
                    {
                        this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true, initiativeOptions: { formula: `{2d10, 1d20}kl[${game.i18n.localize("PILLARS.Initiative")}] + (1d12[${game.i18n.localize("PILLARS.Tiebreaker")}] / 100) + @initiative.value` } });
                    },
                },
            },
            default: "normal",
        }).render(true);
    }

    async _onSkillRoll(event) 
    {
        const itemId = $(event.currentTarget).parents("[data-id]")[0]?.dataset.id;
        const item = this.actor.items.get(itemId);
        if (item) 
        {
            const check = await this.actor.setupSkillCheck(item);
            await check.rollCheck();
            check.sendToChat();
        }
    }

    async _onUntrainedSkillClick() 
    {
        const allSkills = game
            .items.contents.filter((i) => i.type == "skill")
            .sort((a, b) => (a.name > b.name ? 1 : -1));
        let selectElement = `<select name="skill">`;
        for (const s of allSkills) {selectElement += `<option name=${s.name}>${s.name}</option>`;}
        selectElement += "</select>";
        const game = game;
        new Dialog({
            title: game.i18n.localize("PILLARS.UntrainedSkill"),
            //content : `<div style="display:flex; align-items: center"><label style="flex: 1">Name of Skill</label><input style="flex: 1" type='text' name='skill'/></div>`,
            content: `<div style="display:flex; align-items: center"><label style="flex: 1">Skill</label>${selectElement}</div>`,
            buttons: {
                roll: {
                    label: "Roll",
                    callback: async (dlg) => 
                    {
                        const skill = ($(dlg).find("[name='skill']")[0]).value;
                        if (skill) 
                        {
                            const check = await this.actor.setupSkillCheck(skill);
                            await check.rollCheck();
                            check.sendToChat();
                        }
                        else {ui.notifications.error(game.i18n.localize("PILLARS.PromptItemName"));}
                    },
                },
            },
            default: "roll",
            render: (dlg) => 
            {
                $(dlg).find("select")[0]?.focus();
            },
        }).render(true);
    }

    async _onWeaponRoll(event) 
    {
        const itemId = $(event.currentTarget).parents("[data-id]")[0]?.dataset.id;
        const check = await this.actor.setupWeaponCheck(itemId);
        await check.rollCheck();
        check.sendToChat();
    }

    async _onPowerRoll(event) 
    {
        const itemId = $(event.currentTarget).parents("[data-id]")[0]?.dataset.id;
        const check = await this.actor.setupPowerCheck(itemId);
        await check.rollCheck();
        check.sendToChat();
    }

    async _onItemSkillClick(event) 
    {
        const itemId = $(event.currentTarget).parents("[data-id]")[0]?.dataset.id;
        const item = this.actor.items.get(itemId);
        const skill = this.actor.items.getName(item?.system.skill?.value || "");
        if (!skill) {return ui.notifications.warn(game.i18n.format("PILLARS.ErrorSkillNotFound", {name : item?.system.skill?.value}));}
        const check = await this.actor.setupSkillCheck(skill);
        await check.rollCheck();
        check.sendToChat();
    }


    _onPostItemEnter(event )
    {
        const img = $(event.currentTarget).find("img");
        $(event.currentTarget).prepend(`<a class="list-post list-image"><i class="fa-solid fa-comment"></i></a>`);
        img.hide();
    }

    _onPostItemLeave(event )
    {
        $(event.currentTarget).find("img").show();
        $(event.currentTarget).find(".list-post").remove();
    }

    _onDrop(event) 
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

    _onDropdown(event) 
    {
        const itemId = $(event.currentTarget).parents("[data-id]")[0]?.dataset.id;
        const item = this.actor.items.get(itemId);
        if (item) {this._dropdown(event, item.dropdownData());}
    }

    async _dropdown(event, dropdownData) 
    {
        let dropdownHTML = "";
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
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
