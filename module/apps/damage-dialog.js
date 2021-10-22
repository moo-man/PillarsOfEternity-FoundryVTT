export default class DamageDialog extends Application
{
    constructor(item, check, targets, group)
    {
        super();
        this.item = item.clone();
        this.check = check;
        this.targets = targets
        this.group = group
        this.additionalDamages = 0
        this.damages = this.constructDamages()
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

        damages.forEach(i => i.mult = 0)
        damages.forEach(i => {
            if (!i.label) i.label = this.item.name
        })
        return damages
    }

    addDamage() {
        this.additionalDamages++;
        this.damages.push(this.damages[this.damages.length-1])
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
                let margin = this.check.result.total - damage.target.actor.defenses[defense].value
                let multiplier = Math.floor(margin / 5)
                damage.mult = multiplier    
            }
        }
        catch(e)
        {
            console.log(`Could not set target data for damage : ${e}`)
        }

    }

    submit() {
        this.element.find()
        this.damages.forEach(async (damage, i) => {
            let multiplier = damage.mult
            let type = game.pillars.config.damageTypes[damage.type]
            let rollString = damage.base
            if (damage.crit[0])
                rollString  += `+ ${parseInt(damage.crit[0]) * parseInt(multiplier) + damage.crit.slice(1)}`
            let roll = await new Roll(rollString).evaluate({async : true})
            await roll.toMessage({flavor : damage.label ? `${damage.label} Damage - ${type}` : `${this.item.name} Damage ${this.damages.length > 1 ? i + 1 : ""} - ${type}`, speaker : this.item.actor.speakerData()});
        })
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
            let targetIndex = parseInt(ev.target.value)
            let target = this.targets[targetIndex]
            let parent = $(ev.currentTarget).parents(".damage")
            let critSelect = parent.find("select.mult")[0]
            if (target)
            {
                let img = target.data.img
                $(ev.currentTarget).parents(".target").find("img").attr("src", img)
                let damageIndex = parent.attr("data-index")
                this.damages[damageIndex].target = target
                this.calculateCritDice()
                let mult = this.damages[damageIndex].mult || 0
                critSelect.value = mult
            }
            else {
                $(ev.currentTarget).parents(".target").find("img").attr("src", "")
                critSelect.value = 0
            }
        })


        $(document).on('keydown.damage', this._onKeyDown.bind(this))
    }
}