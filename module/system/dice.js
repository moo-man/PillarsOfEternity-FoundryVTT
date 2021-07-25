import RollDialog from "../apps/roll-dialog.js"

export class PillarsDice
{
    static async showRollDialog({dialogData, rollData, cardData})
    {
        let html = await renderTemplate("systems/pillars-of-eternity/templates/apps/roll-dialog.html", dialogData)
        return new Promise((resolve, reject) => {
            new RollDialog({
                content : html,
                title : dialogData.title,
                buttons : {
                    "roll" : {
                        label : "Roll",
                        callback : async (dlg) => {
                            rollData.difficulty = parseInt(dlg.find('[name="difficulty"]').val() || 0)
                            rollData.diceModifier = parseInt(dlg.find('[name="diceModifier"]').val() || 0)
                            rollData.successModifier = parseInt(dlg.find('[name="successModifier"]').val() || 0)
                            rollData.triggerModifier = parseInt(dlg.find('[name="triggerModifier"]').val() || 0)
                            rollData.secondary = dlg.find(".secondary-select").val()
                            resolve(rollData)
                        }
                    }
                },
                default: "roll",
                dialogData
            }, {classes : ["roll-dialog"]}).render(true)
        })
    }
}
