

export default class DamageDialog extends Application
{
    constructor(item, check, targets)
    {
        super();
        this.item = item.clone();
        this.check = check;
        this.targets = targets//.map(i => i.document)
        this.disabled = [] // unselectable targets due to not exceeding defense
        this.additionalDamages = 0
        this.addedCrits = 0;
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


    render(force=false, options) {
        super.render(force, options)
        this.resolve = options.resolve
        this.reject = options.reject
    }
    
    getData() {
        let data = super.getData();
        data.damages = this.damages;
        data.targets = this.targets
        data.disabled = this.disabled
        
        return data;
    }

    constructDamages() {
        let damages = []
        damages = foundry.utils.deepClone(this.item.damage.value)
        if (this.check && this.check.addedProperties?.damage?.length)
        {
            // Separate 
            this.addedCrits = this.check.addedProperties.damage.filter(d => !d.base && !d.crit && d.defaultCrit).reduce((prev, current) => prev += current.defaultCrit, 0)
            damages = damages.concat(this.check.addedProperties.damage)
        }
        
        damages = damages.filter(d => d.crit || d.base)
        damages.forEach((damage, i) => {
            damage.mult = undefined
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
            for (let damage of this.damages)
            {
                if (!damage.target)
                    damage.mult = this.addedCrits;

                let defense = damage.defense.toLowerCase() || "deflection"
                let target = this.targets.find(i => i.id == damage.target)
                let margin = this.check.result.total - target.actor.defenses[defense].value
                let multiplier = Math.floor(margin / 5)
                damage.mult = this.check.requiresRoll ? multiplier : 0;

                // don't add default crits unless the attack hit
                if (damage.mult >= 0)
                {
                    damage.mult += this.addedCrits
                    damage.mult += damage.defaultCrit || 0
                }

                // Don't try to use a multiplier if no crit dice
                if (!damage.crit || damage.crit == 0) // == is important here
                {
                    damage.mult = 0
                }

                // If the attack didn't hit, disable the target
                if (damage.mult < 0)
                {
                    if (!this.disabled.find(t => t.id == target.id))
                        this.disabled.push(target)
                    let targetIndex = this.targets.findIndex(i => i.id == damage.target)
                    if (targetIndex > -1)
                        this.targets.splice(targetIndex, 1)
                        
                    delete damage.img;
                    delete damage.target;
                }
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
            damage.target = this.targets[Math.min(i, this.targets.length-1)]?.id
            damage.img = this.targets[Math.min(i, this.targets.length-1)]?.data?.img
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
        let img = target ? target.data.img : ""
        parent.find(".target").find("img").attr("src", img)
    }

    setCritSelection(index)
    {
        let damage = this.damages[index]
        let parent = this.element.find(`[data-index='${index}']`)
        parent.find("select.mult")[0].value = damage.mult
    }

    submit() {
        let damages = duplicate(this.damages)
        damages.forEach(d => d.target = this.targets.find(i => i.id == d.target))
        damages.forEach(d => d.misses = this.disabled.map(i => i.toObject()))
        this.close()
        return this.resolve(damages)
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
 
            this.damages[damageIndex].target = ev.target.value
            this.damages[damageIndex].img = this.targets.find(i => i.id == ev.target.value)?.data?.img
            this.calculateCritDice()
            this.setTargetImages(damageIndex)
            this.setCritSelections(damageIndex)
        })


        $(document).on('keydown.damage', this._onKeyDown.bind(this))
    }


}