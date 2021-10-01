export default class DamageDialog extends Application
{
    constructor(item, test, target)
    {
        super();
        this.item = item;
        this.test = test;
        this.target = target ?? test?.target
        this.additionalDamages = 0
        this.damages = this.constructDamages()
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "damage-dialog",
            title : "Damage",
            height: "auto",
            template : "systems/pillars-of-eternity/templates/apps/damage-dialog.html"
        })
    }
    
    getData() {
        let data = super.getData();
        data.damages = this.damages;
        this.setTargetData(data);
        
        return data;
    }

    constructDamages() {
        let damages = [{
            base : this.item.damage.value,
            crit : this.item.crit.value,
            mult : 0
        }]
        for (let i = 0; i < this.additionalDamages; i++)
        {
            damages.push({
                base : this.item.damage.value,
                crit : this.item.crit.value,
                mult : 0
        })
        }
        return damages
    }

    addDamage() {
        this.additionalDamages++;
        this.damages.push(this.damages[this.damages.length-1])
        this.render(true)
    }

    setTargetData(data)
    {
        if (!this.target || !this.test)
            return 

        let defense = "deflection"
        let margin = this.test.result.total - this.target.defenses[defense].value
        let multiplier = Math.floor(margin / 5)
        data.damages[0].mult = multiplier

        data.targetName = this.target.token ? this.target.token.name : this.target.data.token.name

    }

    submit() {
        this.element.find()
        this.damages.forEach(async (damage, i) => {
            let select = this.element.find(`select[name='${i}']`)
            let multiplier = select.val()
            let critTotal = parseInt(damage.crit[0]) * parseInt(multiplier) + damage.crit.slice(1)
            let roll = await new Roll(`${damage.base} + ${critTotal}`).evaluate({async : true})
            await roll.toMessage({flavor : `${this.item.name} Damage ${this.damages.length > 1 ? i + 1 : ""}`, speaker : this.item.actor.speakerData()});
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

        $(document).on('keydown', this._onKeyDown.bind(this))
    }
}