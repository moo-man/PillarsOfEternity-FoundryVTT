

export default class RollDialog extends Dialog {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id : "roll-dialog",
            resizable : true
        })
    }

    async _render(...args)
    {
        await super._render(...args)
        let automatic = this.runChangeConditionals()
        let select = this.element.find(".effect-select")[0]
        let options = Array.from(select.children)
        options.forEach((opt, i) => {
            if (automatic[i])
            {
                opt.selected = true;
                select.dispatchEvent(new Event("change"))
            }
        })
    }

    static async create(data) {
        let html = await renderTemplate("systems/pillars-of-eternity/templates/apps/roll-dialog.html", data)
        return new Promise((resolve) => {
            return new this({
                title: data.title,
                content: html,
                actor : data.actor,
                targets : data.targets,
                dialogData : data,
                buttons : {
                    roll : {
                        label : "Roll",
                        callback : (html, check) => {
                            let data = {}
                            data.modifier = html.find("input[name='modifier']").val()
                            data.steps = parseInt(html.find("select[name='steps']").val())
                            data.proxy = html.find("input[name='proxy']").is(":checked")
                            data.assister = html.find("select[name='assistance']").val()
                            data.state = html.find("input:radio[name='state']:checked").val()
                            data.rollMode = html.find("select[name='rollMode']").val()
                            resolve(data)
                        }
                    }
                },
                default : "roll"
            }).render(true)
        })

    }

    runChangeConditionals()
    {
        let results = this.data.dialogData.changes.map(c => {
            try {
                let func = new Function("data", c.conditional.script).bind({actor : this.data.actor, targets : this.data.targets, effect : c.document})
                return (func(this.data.dialogData) == true) // Only accept true returns
            }
            catch (e)
            {
                console.error("Something went wrong when processing conditional dialog effect: " + e, c)
                return false
            }
        })
        return results
    }

    activateListeners(html)
    {
        super.activateListeners(html)
        this.dynamicInputs = {
            modifier : null,
            state : null,
            steps : null,
        }

        html.find("input").focus(ev => {
            ev.currentTarget.select()
        })

        html.find("input[name='proxy']").change(ev => {
            let select = html.find("select[name='assistance']")[0]
            if(ev.target.checked)
            {
                select.value = ""
                select.setAttribute("disabled", true)
            }
            else 
                select.removeAttribute("disabled")
        })

        this.dynamicInputs.steps = html.find("select[name='steps']").change(ev => {
            this.userEntry.steps = parseInt(ev.currentTarget.value)
            this._setStepDice()

        })

        this.dynamicInputs.modifier = html.find("[name='modifier']").change(ev => {
            this.userEntry.modifier = $(ev.currentTarget).val()
        })

        this.dynamicInputs.state = html.find("[name='state']").change(ev => {
            this.userEntry.state = $(ev.currentTarget).val()
        })

        html.find(".effect-select").change(this._onEffectSelect.bind(this))

        this.userEntry = {
            modifier : this.dynamicInputs.modifier[0].value ,
            state : Array.from(this.dynamicInputs["state"]).filter(i => i.checked)[0]?.value,
            steps: this.dynamicInputs.steps[0].value 
        }
    }   

    _setStepDice() {
        let stepDice = this._element.find("input[name='step-dice']")[0]
        let steps = parseInt(this._element.find("select[name='steps']")[0].value)
        if (steps == 0)
        {
            stepDice.value = ""
            return 
        }
        let negative = steps < 0
        let dice = `1d${game.pillars.utility.stepsToDice(steps).faces}`
        
        stepDice.value = negative ? `-${dice}` : dice
    }


    _onEffectSelect(ev) 
    {
        let changes = []
        $(ev.currentTarget).val().map(i => {
            let indices = i.split(",");
            indices.forEach(changeIndex => {
                changes.push(this.data.dialogData.changes[parseInt(changeIndex)])
            })
        })

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
                if (change.key == "steps")
                {
                    input.value = parseInt(input.value) + parseInt(change.value)
                }
            }
        })

        let stateChanges = changes.filter(change => change.key == "state")
        let adv = stateChanges.some(change => change.value == "adv") || this.userEntry.state == "adv"
        let dis = stateChanges.some(change => change.value == "dis") || this.userEntry.state == "dis"
        let finalState = ""
        if ((adv && dis) || (!adv && !dis))
            finalState = "normal"
        else if (adv)
            finalState = "adv"
        else if (dis)
            finalState = "dis"

        Array.from(this.dynamicInputs["state"]).find(i => i.id == `state-${finalState}`).checked = true

        this._setStepDice()
    }
}