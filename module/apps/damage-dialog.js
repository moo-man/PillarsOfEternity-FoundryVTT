export default class DamageDialog extends Application
{
    constructor(item, test, targets)
    {
        super();
        this.item = item;
        this.test = test;
        this.targets = targets
        this.additionalDamages = 0
        this.damages = this.constructDamages()
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "damage-dialog",
            classes : ["pillars-of-eternity"],
            title : "Damage",
            height: "auto",
            width: 500,
            template : "systems/pillars-of-eternity/templates/apps/damage-dialog.html"
        })
    }
    
    getData() {
        let data = super.getData();
        data.damages = this.damages;
        data.targets = this.targets
        //this.setTargetData(data);
        
        return data;
    }

    constructDamages() {
        let damages = []
        if (this.item.type == "weapon")
        {
            damages.push({
                type : "physical",
                defense : "deflection",
                base : this.item.damage.value,
                crit : this.item.crit.value,
                mult : 0
            })

            for (let i = 0; i < this.additionalDamages; i++)
            {
                damages.push({
                    type : "physical",
                    base : this.item.damage.value,
                    crit : this.item.crit.value,
                    defense : "deflection",
                    mult : 0
                })
            }
        }
        else if (this.item.type == "power")
        {
            damages = foundry.utils.deepClone(this.item.damage.value)
            damages.forEach(i => i.mult = 0)
        }

        return damages
    }

    addDamage() {
        this.additionalDamages++;
        this.damages.push(this.damages[this.damages.length-1])
        this.render(true)
    }

    calculateCritDice()
    {
        if (!this.test)
            return false

        try {
            for (let damage of this.damages.filter(d => d.target))
            {
                let defense = damage.defense || "deflection"
                let margin = this.test.result.total - damage.target.actor.defenses[defense].value
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
            let select = this.element.find(`select[name='${i}']`)
            let multiplier = select.val()
            let critTotal = parseInt(damage.crit[0]) * parseInt(multiplier) + damage.crit.slice(1)
            let roll = await new Roll(`${damage.base} + ${critTotal}`).evaluate({async : true})
            await roll.toMessage({flavor : damage.label ? `${this.item.name} Damage - ${damage.label}` : `${this.item.name} Damage ${this.damages.length > 1 ? i + 1 : ""}`, speaker : this.item.actor.speakerData()});
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

    activateListeners(html)
    {
        super.activateListeners(html)

        html.find(".add-damage").click(this.addDamage.bind(this))
        html.find("button").click(this.submit.bind(this))

        html.find(".target-select").change(ev => {
            let targetIndex = parseInt(ev.target.value)
            let target = this.targets[targetIndex]
            let parent = $(ev.currentTarget).parents(".damage")
            let critSelect = parent.find("select.crit")[0]
            if (target)
            {
                let img = target.data.img
                $(ev.currentTarget).parents(".target").find("img").attr("src", img)
                let damageIndex = parent.attr("data-index")
                this.damages[damageIndex].target = target
                this.calculateCritDice()
                let critDice = this.damages[damageIndex].mult || 0
                critSelect.value = critDice
            }
            else {
                $(ev.currentTarget).parents(".target").find("img").attr("src", "")
                critSelect.value = 0
            }
        })


        $(document).on('keydown', this._onKeyDown.bind(this))
    }
}