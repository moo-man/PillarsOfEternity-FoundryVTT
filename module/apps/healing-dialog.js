

export default class HealingDialog extends Application
{
    constructor(item, check, targets)
    {
        super();
        this.item = item.clone();
        this.check = check;
        this.targets = targets//.map(i => i.document)
        this.additionalHealing = 0
        this.healing = this.constructHealing()
        this.assignTargets()
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "healing-dialog",
            classes : ["pillars-of-eternity"],
            title : "Healing",
            height: "auto",
            resizable: true,
            width: 500,
            template : "systems/pillars-of-eternity/templates/apps/healing-dialog.html"
        })
    }


    render(force=false, options) {
        super.render(force, options)
        this.resolve = options.resolve
        this.reject = options.reject
    }
    
    getData() {
        let data = super.getData();
        data.healing = this.healing;
        data.targets = this.targets
        data.disabled = this.disabled
        
        return data;
    }

    constructHealing() {
        let healing = []
        healing = foundry.utils.deepClone(this.item.healing)

        healing.forEach(h => {
            if (!h.label) h.label = this.item.name
        })
        return healing
    }

    addHealing() {
        this.additionalHealing++;
        this.healing.push(duplicate(this.healing[this.healing.length-1]))
        this.render(true)
    }

    assignTargets() 
    {
        let sizeDiff = this.targets.length - this.healing.length

        for (let i = 0; i < sizeDiff; i++)
        {
            this.healing.push(duplicate(this.healing[this.healing.length-1]))
            this.additionalHealing++;
        }

        this.healing.forEach((healing, i) => {
            healing.target = this.targets[Math.min(i, this.targets.length-1)]?.id
            healing.img = this.targets[Math.min(i, this.targets.length-1)]?.data?.img
        })
    }

    setTargetImages() 
    {
        for(let i = 0; i < this.healing.length; i++)
            this.setTargetImage(i)
    }



    setTargetImage(index)
    {
        let healing = this.healing[index]
        let target = this.targets.find(i => i.id == healing.target)
        let parent = this.element.find(`[data-index='${index}']`)
        let img = target ? target.data.img : ""
        parent.find(".target").find("img").attr("src", img)
    }

    submit() {
        let healing = duplicate(this.healing)
        healing.forEach(h => h.target = this.targets.find(i => i.id == h.target))
        healing.forEach(h => h.healing = true)
        this.close()
        return this.resolve(healing)
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

        html.find(".add-damage").click(this.addHealing.bind(this))
        html.find("button").click(this.submit.bind(this))

        html.find(".label,.base").change(ev => {
            let parent = $(ev.currentTarget).parents(".healing")
            let index = parent.attr("data-index")
            let property = ev.currentTarget.classList[1]
            this.healing[index][property] = ev.target.value
        })

        html.find(".target-select").change(ev => {
            let parent = $(ev.currentTarget).parents(".healing")
            let healingIndex = parent.attr("data-index")
 
            this.healing[healingIndex].target = ev.target.value
            this.healing[healingIndex].img = this.targets.find(i => i.id == ev.target.value)?.data?.img
            this.setTargetImages(healingIndex)
        })

        $(document).on('keydown.damage', this._onKeyDown.bind(this))
    }


}