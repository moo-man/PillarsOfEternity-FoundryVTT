import PILLARS_UTILITY  from "../system/utility.js"
/**
 * Extend the FVTT Item class for Pillars functionality
 * @extends {ItemSheet}
 */
export class PillarsItem extends Item {

    async _preUpdate(updateData, options, user)
    {
        await super._preUpdate(updateData, options, user)
        if (this.type == "shield" && hasProperty(updateData, "data.health.current"))
            updateData.data.health.current = Math.clamped(updateData.data.health.current, 0, this.health.max)

        if (this.type=="powerSource" && hasProperty(updateData, "data.source.value"))
            updateData.name = game.pillars.config.powerSources[updateData.data.source.value]
    }

    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user)
        if ((this.type == "species" || this.type == "culture" || this.type == "stock" || this.type == "godlike") && this.isOwned)
        {
            let item = this.actor.items.find(i => i.type == this.type && i.id != this.id)
            if (item)
                await item.delete()
            
            this.actor.update({[`data.details.${this.type}`] : this.name})
        }
    }

    //#region Data Preparation 
    prepareData() {
        super.prepareData();
        if (this[`prepare${this.type[0].toUpperCase() + this.type.slice(1)}`])
            this[`prepare${this.type[0].toUpperCase() + this.type.slice(1)}`]()
    }

    prepareOwnedData() 
    {
        if (this[`prepareOwned${this.type[0].toUpperCase() + this.type.slice(1)}`])
            this[`prepareOwned${this.type[0].toUpperCase() + this.type.slice(1)}`]()

        if (this.weight)
        {
            this.weight.value *= this.quantity.value
        }
    }

    prepareWeapon() {
      
    }

    prepareSkill() {

    }

    preparePower() {
        try 
        {
            let pl = 0
            let values = game.pillars.config.powerLevelValues
            pl += values.powerRanges[this.range.value] || 0

            let targetSubTypes = values[`power${this.target.value[0].toUpperCase() + this.target.value.slice(1)}s`]
            pl += targetSubTypes[this.target.subtype] || 0
            pl += values.powerDurations[this.duration.value]
            pl += values.powerSpeeds[this.speed.value]
            pl += values.powerExclusions[this.exclusion.value]
            pl += this.base.cost || 0
            this.data.data.pl = pl
            this.level.value = PillarsItem._abstractToLevel(pl)
        }
        catch(e) 
        {   
            console.log(`Could not calculate PL for ${this.name}: ${e}`)
        }
    }

    prepareOwnedSkill() {
        this.xp.rank = PILLARS_UTILITY.getSkillRank(this.xp.value) + this.modifier.value
    }

    prepareOwnedPowerSource() {
        this.xp.level = PILLARS_UTILITY.getPowerSourceLevel(this.xp.value)
        this.data.data.attack = PILLARS_UTILITY.getPowerSourceAttackBonus(this.xp.level)
        this.pool.max = PILLARS_UTILITY.getPowerSourcePool(this.xp.level)
    }


    //#endregion

    //#region General Functions

    async postToChat()
    {
        let chatData = this.dropdownData();

        chatData.item = this;

        chatData.showGeneral = this.isWeapon

        let html = await renderTemplate("systems/pillars-of-eternity/templates/chat/post-item.html", chatData)
        let cardData = {content : html}
        if (this.actor)
            cardData.speaker = this.actor.speakerData()
            
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

    static _abstractToLevel(abstract)
    {
        let level = 0
        if (abstract >= 26)
            level = 10
        else if (abstract >= 24)
            level = 9
        else if (abstract >= 22)
            level = 8
        else if (abstract >= 20)
            level = 7
        else if (abstract >= 18)
            level = 6
        else if (abstract >= 16)
            level = 5
        else if (abstract >= 14)
            level = 4
        else if (abstract >= 12)
            level = 3
        else if (abstract >= 10)
            level = 2
        else if (abstract >= 8)
            level = 1
        else 
            level = 0

        return level
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

    get specialList() {
        if (this.isMelee)
            return game.pillars.config.meleeSpecials
        else if (this.isRanged)
            return game.pillars.config.rangedSpecials
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
    get Skill() {return this.actor.items.getName(this.skill.value)}

    get SourceItem() {
        if (!this.isOwned)
            return

        return this.actor.items.find(i => i.type == "powerSource" && i.source.value == this.source.value)
    }

    get Specials() {
        let specials = this.specialList
        let notSkilledEnough = this.special.value.filter(i => this.isOwned && specials[i.name].skilled && ( !this.Skill || this.Skill?.rank < 5))

        return this.special.value.map(i => {
            let display = this.specialList[i.name].label
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
            specials[sp.name] = this.specialList[sp.name] || {}
            specials[sp.name].value = sp.value
        })
        return specials
    }

    // @@@@@@@@ DATA GETTERS @@@@@@@@@@;    
    get category() {return this.data.data.category}
    get target() {return this.data.data.target}
    get xp() {return this.data.data.xp}
    get used() {return this.data.data.used}
    get equipped() {return this.data.data.equipped}
    get wearable() {return this.data.data.wearable}
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
    get source() {return this.data.data.source}
    get base() {return this.data.data.base}
    get level() {return this.data.data.level}

    // Processed data getters
    get rank() {return this.xp.rank}
    get attack() {return this.data.data.attack}

    //#endregion

}
