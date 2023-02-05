import { getGame } from "../system/utility"
import { PillarsEffectChangeDataProperties } from "../../types/effects"
import { PillarsItem } from "./item-pillars"
import { PillarsActor } from "./actor-pillars";

declare global {
    interface DocumentClassConfig {
      ActiveEffect: typeof PillarsActiveEffect;
    }
  }

export default class PillarsActiveEffect extends ActiveEffect {
    changes : typeof this["data"]["changes"] = [] // V10 shim
    

    prepareData() {
        if (getGame().ready && this.requiresEquip && this.item?.canEquip)
            this.data.disabled = !this.item.system.equipped?.value
    }

    getDialogChanges({target = undefined, condense = false, indexOffset = 0} : {target? : PillarsActor | null, condense? : boolean, indexOffset? : number} ={}) {
        let allChanges = this.changes.map(c => duplicate(c)) as PillarsEffectChangeDataProperties[]
        allChanges.forEach((c, i) => {
            c.conditional = this.changeConditionals[i] || {}
            c.document = this
        })
        let dialogChanges = allChanges.filter((c) => c.mode == (target ? 7 : 6)) // Targeter dialog is 7, self dialog is 6
        dialogChanges.forEach((c, i) => {
            c.target = !!target
            c.index = [i + indexOffset]
        })
        // changes with the same description as under the same condition (use the first ones' script)
        if (condense)
        {
            let uniqueChanges :  PillarsEffectChangeDataProperties[] = []
            dialogChanges.forEach(c => {
                let existing = uniqueChanges.find(unique => unique.conditional.description == c.conditional.description)
                if (existing)
                    existing.index = existing.index.concat(c.index)
                else
                    uniqueChanges.push(c)
            })
            dialogChanges = uniqueChanges
        }
        return dialogChanges
    }
    get changeConditionals() {
        return (getProperty(this.data, "flags.pillars-of-eternity.changeCondition") || {})
    }

    get description() {
        return getProperty(this.data, "flags.pillars-of-eternity.description")
    }

    get item() {
        if (this.parent && this.parent.documentName == "Item")
            return this.parent
        else if (this.data.origin && this.parent?.documentName == "Actor") 
        {
            let origin = this.data.origin.split(".")
            if (origin[1] == this.parent.id) // If origin ID is same as parent ID
            {
                if (origin[3])
                {
                    return this.parent.items.get(origin[3])
                }
            }
        }
    }

    get hasRollEffect() {
        return this.changes.some(c => c.mode == 0)
    }

    get sourceName() {
        if (!this.data.origin)
            return super.sourceName

        let data = this.data.origin.split(".")

        if (data.length == 4)
        {
            
            let item : PillarsItem | undefined;
            let parent = this.parent;
            if (parent && parent instanceof PillarsActor)
            {
                item = parent.items.get(data[3] || "")
            }
            if (item)
                return item.name!
            else 
                return super.sourceName;
        }
        return ""
    }

    get conditionId() {
        return this.getFlag("core", "statusId")
    }

    get requiresEquip() {
        return getProperty(this.data, "flags.pillars-of-eternity.itemEquip")
    }
}