import { AgingCheckDataFlattened, AgingDialogData } from "../../types/checks"
import { PillarsEffectChangeDataProperties } from "../../types/effects"


export default class AgingDialog extends Dialog {

    dynamicInputs : {modifier : JQuery<HTMLInputElement> | null} = {
        modifier: null
    }

    data :  AgingDialogData


    userEntry : {
        modifier: string
    } = {modifier : ""}


    constructor(data: AgingDialogData) {
        super(data);
        this.data = data
        this.data.dialogData = data.dialogData 
      }
    

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id : "roll-dialog",
            resizable : true
        })
    }

    static async create({modifier, changeList, changes, years, defaultYear} : AgingDialogData["dialogData"]) {


        let html = await renderTemplate("systems/pillars-of-eternity/templates/apps/aging-dialog.html", {modifier, changeList, changes, years, defaultYear: defaultYear || years[0]})
        return new Promise((resolve) => {
            return new this({
                title: "Aging Roll",
                content: html,
                dialogData : {changes, changeList, modifier, years},
                buttons : {
                    roll : {
                        label : "Roll",
                        callback : (dlg) : void => {
                            let data : AgingCheckDataFlattened = <AgingCheckDataFlattened>{}
                            let html = $(dlg)
                            data.modifier = html.find("input[name='modifier']").val()?.toString() || ""
                            data.lifestyle = html.find("select[name='lifestyle']").val()?.toString() || ""
                            data.year = parseInt(html.find("select[name='year']").val()?.toString() || "")
                            resolve(data)
                        }
                    }
                },
                default : "roll"
            }).render(true)
        })

    }

    activateListeners(html : JQuery<HTMLElement>)
    {
        super.activateListeners(html)
        this.dynamicInputs = {
            modifier : null
        }

        html.find("input").on("focus", (ev : JQuery.FocusEvent) => {
            ev.currentTarget.select()
        })

        this.dynamicInputs.modifier = html.find<HTMLInputElement>("[name='modifier']").on("change", (ev : JQuery.ChangeEvent) => {
            this.userEntry.modifier = $(ev.currentTarget).val()?.toString() || ""
        })

        html.find(".effect-select").on("change", this._onEffectSelect.bind(this))

        this.userEntry = {
            modifier : this.dynamicInputs.modifier[0]?.value.toString() || ""
        }
    }   


    _onEffectSelect(ev : JQuery.ChangeEvent) 
    {
        let changes : PillarsEffectChangeDataProperties[] = [];
        let selected =  $(ev.currentTarget).val() as string[]
          selected.map((i) => {
            let indices = i.split(',');
            indices.forEach((changeIndex) => {
              changes.push(this.data.dialogData.changes[parseInt(changeIndex)]!);
            });
          });


        for(let type in this.dynamicInputs)
        {
                this.dynamicInputs[type as keyof typeof this.dynamicInputs]![0]!.value = this.userEntry[type as keyof typeof this.dynamicInputs]
        }

        changes.forEach((change) => {
            let input = this.dynamicInputs[change.key as keyof typeof this.dynamicInputs]?.[0] as HTMLInputElement
            if (input) {
              if (change.key == 'modifier') {
                if (input.value == '') input.value = change.value;
                else if (isNaN(Number(input.value)) || isNaN(Number(change.value))) {
                  input.value = input.value + ' + ' + change.value;
                } else {
                  input.value = (parseInt(input.value) + parseInt(change.value)).toString();
                }
              }
              if (change.key == 'steps') {
                input.value = (parseInt(input.value) + parseInt(change.value)).toString();
              }
            }
          });
    }
}