import { AgingCheckDataFlattened, AgingDialogData } from "../../types/checks"


export default class AgingDialog extends Dialog {

    dynamicInputs : Record<string, JQuery<HTMLInputElement> | null> = {
        modifier: null
    }

    userEntry : {
        modifier: string
    } = {modifier : ""}

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id : "roll-dialog",
            resizable : true
        })
    }

    static async create({modifier, changeList, changes} : AgingDialogData) {
        let html = await renderTemplate("systems/pillars-of-eternity/templates/apps/aging-dialog.html", {modifier, effects})
        return new Promise((resolve) => {
            return new this({
                title: "Aging Roll",
                content: html,
                dialogData : {changes, changeList},
                buttons : {
                    roll : {
                        label : "Roll",
                        callback : (dlg) : void => {
                            let data : AgingCheckDataFlattened = <AgingCheckDataFlattened>{}
                            let html = $(dlg)
                            data.modifier = html.find("input[name='modifier']").val()?.toString() || ""
                            data.lifestyle = html.find("select[name='lifestyle']").val()?.toString() || ""
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

        html.find("input").on("focus", (ev : JQuery.FocusEvent) => {
            ev.currentTarget.select()
        })

        this.dynamicInputs.modifier = html.find("[name='modifier']").on("change", (ev : JQuery.ChangeEvent) => {
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
        let changes = selectedEffects.reduce((prev, current) => prev = prev.concat(current.data.changes), []).filter(i => i.mode == 0)

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