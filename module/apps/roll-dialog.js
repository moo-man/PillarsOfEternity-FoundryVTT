

export default class RollDialog extends Dialog {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id : "roll-dialog"
        })
    }

    static async create({title, assisters, state={normal : true}, modifier, hasRank}) {
        let html = await renderTemplate("systems/pillars-of-eternity/templates/apps/roll-dialog.html", {title, assisters, state, modifier, hasRank})
        return new Promise((resolve) => {
            return new this({
                title: title,
                content: html,
                buttons : {
                    roll : {
                        label : "Roll",
                        callback : (html, test) => {
                            console.log(html, test)
                            let data = {}
                            data.modifier = html.find("input[name='modifier']").val()
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
    }   
}