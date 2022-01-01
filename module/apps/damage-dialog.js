import DamageRoll from "../system/damage-roll.js";

export default class DamageDialog extends Application
{
    constructor(item, check, targets, group)
    {
        super();
        this.item = item.clone();
        this.check = check;
        this.targets = targets.map(i => i.document)
        this.group = group
        this.additionalDamages = 0
        this.damages = this.constructDamages()
        this.assignTargets()
        this.calculateCritDice()
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "damage-dialog",
            classes : ["pillars-of-eternity"],
            title : "Damage",
            height: "auto",
            resizable: true,
            width: 500,
            template : "systems/pillars-of-eternity/templates/apps/damage-dialog.html"
        })
    }
    
    getData() {
        let data = super.getData();
        data.damages = this.damages;
        data.targets = this.targets
        
        return data;
    }

    constructDamages() {
        let damages = []
        if (this.group == undefined)
            damages = foundry.utils.deepClone(this.item.damage.value)
        else 
            damages = this.item.damage.value.filter(i => i.group == this.group)

        damages.forEach((damage, i) => {
            damage.mult = 0
            if (!damage.label) damage.label = this.item.name
        })
        return damages
    }

    addDamage() {
        this.additionalDamages++;
        this.damages.push(duplicate(this.damages[this.damages.length-1]))
        this.render(true)
    }

    calculateCritDice()
    {
        if (!this.check)
            return false

        try {
            for (let damage of this.damages.filter(d => d.target))
            {
                let defense = damage.defense.toLowerCase() || "deflection"
                let target = this.targets.find(i => i.id == damage.target)
                let margin = this.check.result.total - target.actor.defenses[defense].value
                let multiplier = Math.floor(margin / 5)
                damage.mult = multiplier    
            }
        }
        catch(e)
        {
            console.log(`Could not set target data for damage : ${e}`)
        }

    }

    assignTargets() 
    {
        let sizeDiff = this.targets.length - this.damages.length


        for (let i = 0; i < sizeDiff; i++)
        {
            this.damages.push(duplicate(this.damages[this.damages.length-1]))
            this.additionalDamages++;
        }

        this.damages.forEach((damage, i) => {
            damage.target = this.targets[i]?.id
            damage.img = this.targets[i]?.data?.img
        })
    }

    setTargetImages() 
    {
        for(let i = 0; i < this.damages.length; i++)
            this.setTargetImage(i)
    }

    setCritSelections()
    {
        for(let i = 0; i < this.damages.length; i++)
            this.setCritSelection(i)
    }


    setTargetImage(index)
    {
        let damage = this.damages[index]
        let target = this.targets.find(i => i.id == damage.target)
        let parent = this.element.find(`[data-index='${index}']`)
        parent.find("target").find("img").attr("src", target.img)
    }

    setCritSelection(index)
    {
        let damage = this.damages[index]
        let parent = this.element.find(`[data-index='${index}']`)
        parent.find("select.mult")[0].value = damage.mult
    }

    submit() {
        // this.damages.forEach(async (damage, i) => {
        //     let multiplier = damage.mult
        //     let type = game.pillars.config.damageTypes[damage.type]
        //     let rollString = damage.base
        //     if (damage.crit[0])
        //         rollString  += `+ ${parseInt(damage.crit[0]) * parseInt(multiplier) + damage.crit.slice(1)}`
        //     let roll = await new Roll(rollString).evaluate({async : true})
        //     new DamageRoll(damage, this.check)
        //     //await roll.toMessage({flavor : damage.label ? `${damage.label} Damage - ${type}` : `${this.item.name} Damage ${this.damages.length > 1 ? i + 1 : ""} - ${type}`, speaker : this.item.actor.speakerData()});
        // })

        let damages = duplicate(this.damages)
        damages.forEach(d => d.target = this.targets.find(i => i.id == d.target))
        let roll = new DamageRoll(damages, this.check, this.item)
        roll.rollDice()
        game.user.updateTokenTargets([])
        this.close();
    }

    _onKeyDown(ev)
    {
        if (ev.key == "Enter")
        {
            ev.preventDefault();
            ev.stopPropagation();
            this.submit();
        }
    }

    async close(options) {
        $(document).off('keydown.damage');
        return super.close(options);
      }

    activateListeners(html)
    {
        super.activateListeners(html)

        html.find(".add-damage").click(this.addDamage.bind(this))
        html.find("button").click(this.submit.bind(this))

        html.find(".label,.type,.base,.crit,.mult").change(ev => {
            let parent = $(ev.currentTarget).parents(".damage")
            let index = parent.attr("data-index")
            let property = ev.currentTarget.classList[1]
            this.damages[index][property] = ev.target.value
        })

        html.find(".target-select").change(ev => {
            let parent = $(ev.currentTarget).parents(".damage")
            let damageIndex = parent.attr("data-index")
            if (target)
            {
                this.damages[damageIndex].target = ev.target.value
                this.damage[damageIndex].img = this.targets.find(i => i.id == ev.target.value)?.data?.img
                this.calculateCritDice()
                this.setTargetImages(damageIndex)
                this.setCritSelections(damageIndex)
            }
            else {
                $(ev.currentTarget).parents(".target").find("img").attr("src", "")
                critSelect.value = 0
            }
        })


        $(document).on('keydown.damage', this._onKeyDown.bind(this))
    }


}