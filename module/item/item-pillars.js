import PILLARS_UTILITY  from "../system/utility.js"
/**
 * Extend the FVTT Item class for Pillars functionality
 * @extends {ItemSheet}
 */
export class PillarsItem extends Item {

    _preUpdate(updateData, options, user)
    {
        if (this.type == "shield" && hasProperty(updateData, "data.health.current"))
            updateData.data.health.current = Math.clamped(updateData.data.health.current, 0, this.health.max)

        if (this.type=="powerSource" && hasProperty(updateData, "data.source.value"))
            updateData.name = game.pillars.config.powerSources[updateData.data.source.value]
    }

    //#region Data Preparation 
    prepareData() {
        super.prepareData();
    }

    prepareOwnedData() 
    {
        if (this[`prepareOwned${this.type[0].toUpperCase() + this.type.slice(1)}`])
            this[`prepareOwned${this.type[0].toUpperCase() + this.type.slice(1)}`]()
    }

    prepareWeapon() {
      
    }

    prepareSkill() {

    }

    prepareOwnedSkill() {
        this.xp.rank = PILLARS_UTILITY.getSkillRank(this.xp.value) + this.modifier.value
    }

    prepareOwnedPowerSource() {
        this.xp.level = PILLARS_UTILITY.getPowerSourceLevel(this.xp.value)
    }


    //#endregion

    //#region General Functions

    async postToChat()
    {
        let chatData = this.dropdownData();

        chatData.item = this;

        chatData.showGeneral = this.isWeapon

        let html = await renderTemplate("systems/pillars-of-eternity/templates/chat/post-item.html", chatData)
        let cardData = PILLARS_UTILITY.chatDataSetup(html)
        cardData.flags = {
            "pillars-of-eternity" : {
                transfer : this.toObject()
            }
        }
        ChatMessage.create(cardData);
    }

    dropdownData() {
        return {text : this.description.value}//this[`_${this.type}DropdownData`]()
    }

    //#endregion

    //#region Getters
    // @@@@@@@@ CALCULATION GETTERS @@@@@@@
    get isMelee() {
        return this.category.value == "smallMelee" 
            || this.category.value == "mediumMelee" 
            || this.category.value == "largeMelee"
    }

    get isRanged() {
        return this.category.value == "mediumRanged" 
            || this.category.value == "largeRanged" 
            || this.category.value == "grenade"
    }

    get canEquip() {
        return (this.type == "equipment" && this.wearable.value) || this.type == "weapon" || this.type == "armor" || this.type == "shield"
    }

    // @@@@@@@@ FORMATTED GETTERS @@@@@@@@

    get Type() {return game.i18n.localize(CONFIG.Item.typeLabels[this.type])}

    get Range() {return game.pillars.config.powerRanges[this.data.data.range.value]}

    get Target() {

        let targetSubTypes = game.pillars.config[`power${this.target.value[0].toUpperCase() + this.target.value.slice(1)}s`]
        let target = targetSubTypes[this.target.subtype]
        if (!target)
            target = game.pillars.config.powerTargetTypes[this.data.data.target.value]

        return target
    }
    get Duration() {return game.pillars.config.powerDurations[this.data.data.duration.value]}
    get Speed() {return game.pillars.config.powerSpeeds[this.data.data.speed.value]}
    get Exclusion() {return game.pillars.config.powerExclusions[this.data.data.exclusion.value]}
    get Skill() {return this.actor.items.get(this.skill.value)}


    get Specials() {
        let specials = game.pillars.config.itemSpecials
        let notSkilledEnough = this.special.value.filter(i => this.isOwned && specials[i.name].skilled && ( !this.Skill || this.Skill?.rank < 5))

        return this.special.value.map(i => {
            let display = game.pillars.config.itemSpecials[i.name].label
            if (i.value)
                display += ` (${i.value})`
            if (notSkilledEnough.find(sp => sp.name == i.name))
                display = `<p style="text-decoration: line-through">${display}</p>`
            return display
        })
    }
    

    get specials() {
        let specials = {}
        this.special.value.forEach(sp => {
            specials[sp.name] = game.pillars.config.itemSpecials[sp.name]
            specials[sp.name].value = sp.value
        })
        return specials
    }

    // @@@@@@@@ DATA GETTERS @@@@@@@@@@
    get category() {return this.data.data.category}
    get target() {return this.data.data.target}
    get xp() {return this.data.data.xp}
    get used() {return this.data.data.used}
    get equipped() {return this.data.data.equipped}
    get wearable() {return this.data.data.wearable}
    get skill() {return this.data.data.skill}
    get weight() {return this.data.data.weight}
    get cost() {return this.data.data.cost}
    get quantity() {return this.data.data.quantity}
    get cost() {return this.data.data.cost}
    get range() {return this.data.data.range}
    get target() {return this.data.data.target}
    get duration() {return this.data.data.duration}
    get speed() {return this.data.data.speed}
    get exclusion() {return this.data.data.exclusion}
    get pool() {return this.data.data.pool}
    get description() {return this.data.data.description}
    get soak() {return this.data.data.soak}
    get winded() {return this.data.data.winded}
    get initiative() {return this.data.data.initiative}
    get health() {return this.data.data.health}
    get deflection() {return this.data.data.deflection}
    get skill() {return this.data.data.skill}
    get misc() {return this.data.data.misc}
    get accuracy() {return this.data.data.accuracy}
    get damage() {return this.data.data.damage}
    get crit() {return this.data.data.crit}
    get special() {return this.data.data.special}
    get modifier() {return this.data.data.modifier}
    get setting() {return this.data.data.setting}
    get years() {return this.data.data.years}
    get group() {return this.data.data.group}
    get stride() {return this.data.data.stride}
    get size() {return this.data.data.size}
    get species() {return this.data.data.species}
    get stock() {return this.data.data.stock}

    // Processed data getters
    get rank() {return this.xp.rank}

    //#endregion

}
