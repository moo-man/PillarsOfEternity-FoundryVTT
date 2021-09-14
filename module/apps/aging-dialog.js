

export default class AgingDialog extends Dialog {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id : "roll-dialog",
            resizable : true
        })
    }

    static async create({modifier, effects}) {
        let html = await renderTemplate("systems/pillars-of-eternity/templates/apps/aging-dialog.html", {modifier, effects})
        return new Promise((resolve) => {
            return new this({
                title: "Aging Roll",
                content: html,
                effects,
                buttons : {
                    roll : {
                        label : "Roll",
                        callback : (html, test) => {
                            let data = {}
                            data.modifier = html.find("input[name='modifier']").val()
                            data.lifestyle = html.find("select[name='lifestyle']").val()
                            resolve(data)
                        }
                    }
                },
                default : "roll"
            }).render(true)
        })

    }

    activateListeners(html)
    {
        super.activateListeners(html)
        this.dynamicInputs = {
            modifier : null
        }

        html.find("input").focus(ev => {
            ev.currentTarget.select()
        })

        this.dynamicInputs.modifier = html.find("[name='modifier']").change(ev => {
            this.userEntry.modifier = $(ev.currentTarget).val()
        })

        html.find(".effect-select").change(this._onEffectSelect.bind(this))

        this.userEntry = {
            modifier : this.dynamicInputs.modifier[0].value
        }
    }   


    _onEffectSelect(ev) 
    {
        let selectedEffects = $(ev.currentTarget).val().map(i => this.data.effects[parseInt(i)])
        let changes = selectedEffects.reduce((prev, current) => prev = prev.concat(current.data.changes), [])

        for(let type in this.dynamicInputs)
        {
            if (type != "state")
                this.dynamicInputs[type][0].value = this.userEntry[type]
        }

        changes.forEach(change => {
            let input = this.dynamicInputs[change.key][0]
            if (input)
            {
                if (change.key == "modifier")
                {
                    if (input.value == "")
                        input.value = change.value

                    else if(isNaN(input.value) || isNaN(change.value))
                    {
                        input.value = input.value + " + " + change.value
                    }
                    else 
                    {
                        input.value = parseInt(input.value) + parseInt(change.value)
                    }
                }
            }
        })
    }
}