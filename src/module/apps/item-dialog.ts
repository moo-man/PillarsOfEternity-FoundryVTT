import { getGame } from "../system/utility";
import { ItemDialogData } from "../../types/common";
import { PillarsItem } from "../item/item-pillars";

export default class ItemDialog extends Dialog {

    filterData :  ItemDialogData
    items : PillarsItem[]
    chosen : number = 0;


    constructor(dialogData : Dialog.Data, filterData: ItemDialogData,  items : PillarsItem[]) {
        super(dialogData);
        this.filterData = filterData 
        this.items = items;
      } 
    

    static get defaultOptions() {
        let options =  super.defaultOptions
        options.classes.push("item-dialog")
        options.resizable = true;
        return options

    }

    static async create(data : ItemDialogData) : Promise<PillarsItem[]>{

        let items = await ItemDialog.applyFilters(data)

        ItemDialog.applyDiff(items, data.diff);

        let html = await renderTemplate("systems/pillars-of-eternity/templates/apps/item-dialog.html", {items, text : data.text})
        return new Promise((resolve) => {
            return new this({
                title: "Item Dialog",
                content: html,
                buttons : {
                    confirm : {
                        label : getGame().i18n.localize("Confirm"),
                        callback : (dlg) : void => {
                          dlg = $(dlg);
                          let selected = Array.from(dlg.find(".active").map((i, e) => {
                            return Number(e.dataset.index);
                          }))
                          let itemsSelected = selected.map(i => items[i]).filter(i => i) as PillarsItem[]
                          resolve(itemsSelected)
                        }
                    }
                },
            }, data, items).render(true)
        })

    }

    activateListeners(html : JQuery<HTMLElement>)
    {
      super.activateListeners(html);
      html.find(".directory-item").on("click", (ev : JQuery.ClickEvent) => {
        if (ev.currentTarget.classList.contains("active"))
        {
          this.chosen--;
          ev.currentTarget.classList.remove("active");
        }
        else if (this.chosen < this.filterData.choices)
        {
          this.chosen++;
          ev.currentTarget.classList.add("active")
        }
      })
    } 
    
    
    static async applyDiff(items : PillarsItem[], diff : Record<string, unknown>)
    {
      items.forEach(i => {
        //@ts-ignore
        i.updateSource(diff)
      })
      return items;
    }
  
  
    static async applyFilters(filterData : ItemDialogData) {
  
      let items = filterData.collection?.contents || await this.getAllItems();
  
      for(let filter of filterData.filters)
      {
        if (filter.type == "comparison")
        {
          items = items.filter(i => {
            let propertyValue = getProperty(i.data, filter.target)
            return (0, eval)(`"${propertyValue}" ${filter.test} "${filter.value}"`)
          })
        }
        else if (filter.type == "regex")
        {
          items = items.filter(i => {
            let propertyValue = getProperty(i.data, filter.target) as string
            let regex = new RegExp(filter.test)
            let matches = Array.from(propertyValue.matchAll(regex));
            return matches.length > 0
          })
        }
      }
      return foundry.utils.deepClone(items).sort((a, b) => a.name! > b.name! ? 1 : -1)
    }
  
    static async getAllItems() {
      let game = getGame();
      let items = game.items!.contents as PillarsItem[]
      for (let pack of game.packs)
      {
        if (pack.documentName == "Item")
        {
          let packDocuments = (await pack.getDocuments()) as unknown as PillarsItem[]
          items = items.concat(packDocuments);
        }
      }
      return items
    }
  
}