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

        this.groups = this.preparePowerGroups()
        this.level.value = this.calculatePowerLevel()
        this.level.cost = this.improvised.value ? this.level.value * 2 : this.level.value 
    }

    prepareOwnedSkill() {
        this.xp.rank = PILLARS_UTILITY.getSkillRank(this.xp.value) + this.modifier?.value
    }

    prepareOwnedReputation() {
        this.xp.rank = PILLARS_UTILITY.getSkillRank(this.xp.value) + this.modifier?.value
    }

    prepareOwnedConnection() {
        this.xp.rank = PILLARS_UTILITY.getSkillRank(this.xp.value) + this.modifier?.value
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
        let data = {text : this.description.value}

        if (this.type=="power")
            data.groups = this.groups
        return data
        
        //this[`_${this.type}DropdownData`]()
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


    //#region Power Functions

    preparePowerGroups() {
        try {
            let config = game.pillars.config
            let groupIds = []
            groupIds = groupIds.concat(this.target.map(i => i.group).filter(g => !groupIds.includes(g)))
            groupIds = groupIds.concat(this.range.map(i => i.group).filter(g => !groupIds.includes(g)))
            groupIds = groupIds.concat(this.duration.map(i => i.group).filter(g => !groupIds.includes(g)))
            groupIds = groupIds.concat(this.damage.value.map(i => i.group).filter(g => !groupIds.includes(g)))
            groupIds = groupIds.concat(this.base.effects.map(i => i.group).filter(g => !groupIds.includes(g)))
            groupIds = groupIds.filter(i => i || Number.isNumeric(i))
            groupIds.push("")
            
            let groups = {};
            for(let g of groupIds)
            {
                groups[g] = {}
                groups[g].target = this.target.filter(i => i.group == g)
                groups[g].range = this.range.filter(i => i.group == g)
                groups[g].duration = this.duration.filter(i => i.group == g)
                groups[g].damage = this.damage.value.filter(i => i.group == g)
                groups[g].effects = this.base.effects.filter(i => i.group == g)
                groups[g].healing = this.healing.filter(i => i.group == g)
                groups[g].misc = this.misc.filter(i => i.group == g)

                groups[g].display = {
                    target : [],
                    range : [],
                    duration : [],
                    damage : [],
                    effects : [],
                    healing: [],
                    misc: [],
                }

                groups[g].display.target = groups[g].target.reduce((prev, current, index) => {
                    prev.push(`<a class="power-target" data-group=${g} data-index=${index}>${this.getTargetDisplay(current)}</a>`)
                    return prev
                },[]).join(", ")

                groups[g].display.range = groups[g].range.reduce((prev, current) => {
                    prev.push(config.powerRanges[current.value])
                    return prev
                },[]).join(", ")

                groups[g].display.duration = groups[g].duration.reduce((prev, current) => {
                    prev.push(config.powerDurations[current.value])
                    return prev
                },[]).join(", ")

                groups[g].display.damage = groups[g].damage.reduce((prev, current) => {
                    let text = (`${current.base} ${config.damageTypes[current.type]} @DAMAGES vs. ${config.defenses[current.defense]}` + " ")                
                    if (current.text)
                        text += " " + current.text

                    if (current.damages == "endurance")
                        text = text.replace("@DAMAGES", "(Endurance)")
                    else 
                        text = text.replace("@DAMAGES", "")

                    prev.push(text)
                    return prev
                },[]).join(", ") 
                
                groups[g].display.effects = groups[g].effects.reduce((prev, current) => {
                    let text = "";
                    if (current.defense && current.value)
                        text = (`${CONFIG.statusEffects.find(i => i.id == current.value) ? CONFIG.statusEffects.find(i => i.id == current.value).label : this.effects.get(current.value).label } vs. ${config.defenses[current.defense]}`)
                    else if (current.value)
                        text = (`${CONFIG.statusEffects.find(i => i.id == current.value) ? CONFIG.statusEffects.find(i => i.id == current.value).label : this.effects.get(current.value).label }`)

                    if (current.text)
                        text += " " + current.text
                    
                    prev.push(text)
                    return prev 
                },[]).join(", ")
                
                groups[g].display.healing = groups[g].healing.reduce((prev, current) => {
                    prev.push(`${current.value} ${current.type[0].toUpperCase() + current.type.slice(1)}`)
                    return prev 
                },[]).join(", ")
                
                groups[g].display.misc = groups[g].misc.reduce((prev, current) => {
                    prev.push(current.value)
                    return prev 
                },[]).join(", ")
                
                if (groups[g].display.damage)
                    groups[g].display.damage = `<a class='damage-roll' data-group="${g}">${groups[g].display.damage}</a>`
        }


        // assign any ungrouped value to any group that does not have the corresponding key
        for(let g of groupIds)
        {
            if(g)
            {
                for(let display in groups[g].display)
                {
                    if (!groups[g].display[display] && groups[""])
                    {
                        groups[g].display[display] = groups[""].display[display]
                    }
                }
            }
        }

            if (Object.keys(groups).length == 1 && groups[""])
                groups["Default"] = groups[""]
            delete groups[""]
            return groups
        }
        catch(e)
        {
            console.error(`Something went wrong when organizing power groups for ${this.name}: ` + e)
            console.log(this)
        }
    }

    getTargetDisplay(target)
    {
        let targetSubTypes = game.pillars.config[`power${target.value[0].toUpperCase() + target.value.slice(1)}s`]
        let  targetDisplay = targetSubTypes[target.subtype]
        if (!targetDisplay)
            targetDisplay = game.pillars.config.powerTargetTypes[target.value]
        return targetDisplay
    }


    calculatePowerLevel() {
        let level = 0
        try 
        {
            let pl = 0
            let values = game.pillars.config.powerLevelValues

            for (let range of this.range)
                pl += values.powerRanges[range.value] || 0

            for (let target of this.target)
            {
                let targetSubTypes = values[`power${target.value[0].toUpperCase() + target.value.slice(1)}s`]
                pl += targetSubTypes[target.subtype] || 0
                pl += values.powerExclusions[target.exclusion]
            }
            for (let duration of this.duration)
                pl += values.powerDurations[duration.value]


            for (let misc of this.misc)
                pl += (misc.modifier || 0)

            pl += values.powerSpeeds[this.speed.value]
            pl += this.base.cost || 0
            this.data.data.pl = pl
            level = PillarsItem._abstractToLevel(pl) + (this.level.modifier || 0)
        }
        catch(e) 
        {   
            console.log(`Could not calculate PL for ${this.name}: ${e}`)
        }

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


    get Category() {
        if (this.type == "weapon")
            return game.pillars.config.weaponTypes[this.category.value]
        if (this.type == "skill")
            return game.pillars.config.skillTypes[this.category.value]
    }

    get Type() {return game.i18n.localize(CONFIG.Item.typeLabels[this.type])}

    get Range() {return game.pillars.config.powerRanges[this.range.find(i => i.group == this.displayGroupKey("range"))?.value]}

    get Target() {
        try {

            let targetObj = this.target.find(i => i.group == this.displayGroupKey("target"))
            if (!targetObj)    
            return
            let targetSubTypes = game.pillars.config[`power${targetObj.value[0].toUpperCase() + targetObj.value.slice(1)}s`]
            let target = targetSubTypes[targetObj.subtype]
            if (!target)
            target = game.pillars.config.powerTargetTypes[targetObj.value]
            
            return target
        }
        catch(e)
        {
            console.error("Error when getting target")
        }
    }
    get Duration() {return game.pillars.config.powerDurations[this.duration.find(i => i.group == this.displayGroupKey("duration"))?.value]}
    get Speed() {return game.pillars.config.powerSpeeds[this.speed.value]}
    get Exclusion() {return game.pillars.config.powerExclusions[this.target.find(i => i.group == this.displayGroupKey("target"))?.exclusion]}
    get Skill() {return this.actor.getItemTypes("skill").find(i => i.name == this.skill.value)}

    get SourceItem() {
        if (!this.isOwned)
            return

        return this.actor.items.find(i => i.type == "powerSource" && i.source.value == this.source.value)
    }

    get Specials() {
        let specials = this.specialList
        let notSkilledEnough = this.special.value.filter(i => this.isOwned && specials[i.name]?.skilled && ( !this.Skill || this.Skill?.rank < 5))

        return this.special.value.map(i => {
            let display = this.specialList[i.name]?.label
            if (i.value)
                display += ` (${i.value})`
            if (notSkilledEnough.find(sp => sp.name == i.name))
                display = `<p style="text-decoration: line-through">${display}</p>`
            return display
        })
    }

    displayGroupKey(type) {
        try {
            let groupIndex = this.getFlag("pillars-of-eternity", "displayGroup")
            let group = Object.keys(this.groups)[groupIndex]
            let first =  Object.keys(this.groups).filter(i => i).sort((a, b) => {a - b > 0 ? 1 : -1})[0]
            if (type)
            {
                if (group && this.groups[group] && this.groups[group][type]?.length)
                    return group
                else if (this.groups[first] && this.groups[first][type]?.length)
                    return first
                else
                    return ""
            }
            else
            {

                if (group && this.groups[group]?.length)
                    return group
                else
                    return first
            }
        }
        catch (e)
        {
            console.error("Error getting power group display key: " + e)
            return ""
        }
    }

    get currentDisplayGroup()
    {
        try {
            let groupIndex = this.getFlag("pillars-of-eternity", "displayGroup")
            let group = Object.keys(this.groups)[groupIndex]
            return group
        }
        catch(e)
        {
            console.error("Error when trying to get current display group")
        }
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
    get healing() {return this.data.data.healing}
    get toughness() {return this.data.data.toughness}
    get stride() {return this.data.data.stride}
    get run() {return this.data.data.run}
    get improvised() {return this.data.data.improvised}
    get roll() {return this.data.data.roll}

    // Processed data getters
    get rank() {return this.xp.rank}
    get attack() {return this.data.data.attack}

    //#endregion

    static baseData = {
        target : {group: "", value: "target", subtype: "self", targeted: false, exclusion : "none"},
        range : {group: "", value : "none"},
        duration : {group: "", value : "momentary"},
        healing : {group: "", value : "", type:"health"},
        misc : {group : "", value : "", modifier : 0},
        "damage.value" : {text : "", group: "",base : "",crit : "",defense : "deflection",type : "physical", damages: "health"},
        "base.effects" : {text: "", group: "", value : "", defense : ""}
      }
}
