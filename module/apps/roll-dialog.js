

export default class RollDialog extends Dialog {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id : "roll-dialog",
            resizable : true
        })
    }

    static async create({title, assisters, state={normal : true}, modifier, steps, hasRank, effects}) {
        let html = await renderTemplate("systems/pillars-of-eternity/templates/apps/roll-dialog.html", {title, assisters, state, modifier, steps, hasRank, effects})
        return new Promise((resolve) => {
            return new this({
                title: title,
                content: html,
                effects,
                buttons : {
                    roll : {
                        label : "Roll",
                        callback : (html, test) => {
                            let data = {}
                            data.modifier = html.find("input[name='modifier']").val()
                            data.steps = parseInt(html.find("input[name='steps']").val())
                            data.proxy = html.find("input[name='proxy']").is(":checked")
                            data.assister = html.find("select[name='assistance']").val()
                            data.state = html.find("input:radio[name='state']:checked").val()
                            console.log(data)
                            resolve(data)
                        }
                    }
                },
                default : "roll"
            }).render(true)
        })

    }

    submit(button)
    {   
        let difficulty = this.element.find("input[name='difficulty']").val()
        let secondary = this.element.find(".secondary-select").val()

        if (secondary && !difficulty)
            return ui.notifications.error(game.i18n.localize("DGNS.SecondaryNeedsDifficulty"))

        super.submit(button)
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

        this.dynamicInputs.steps = html.find("input[name='steps']").change(ev => {
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
            state : Array.from(this.dynamicInputs["state"]).filter(i => i.checked)[0].value,
            steps: this.dynamicInputs.steps[0].value 
        }
    }   

    _setStepDice() {
        let stepDice = this._element.find("input[name='step-dice']")[0]
        let steps = parseInt(this._element.find("input[name='steps']")[0].value)
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