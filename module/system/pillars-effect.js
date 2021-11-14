export default class PillarsActiveEffect extends ActiveEffect {
    

    prepareData() {
        if (game.ready && this.requiresEquip && this.item?.canEquip)
            this.data.disabled = !this.item.equipped.value
    }


    get label() {
        return this.data.label
    }

    get description() {
        return getProperty(this.data, "flags.pillars-of-eternity.description")
    }

    get item() {
        if (this.parent && this.parent.documentName == "Item")
            return this.parent
        else if (this.data.origin && this.parent.documentName == "Actor") 
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
        return this.data.changes.some(c => c.mode == 0)
    }

    get sourceName() {
        if (!this.data.origin)
            return super.sourceName

        let data = this.data.origin.split(".")

        if (data.length == 4)
        {
            let item = this.parent.items.get(data[3])
            if (item)
                return item.name
            else
                return super.sourceName;
        }
    }

    get requiresEquip() {
        return getProperty(this.data, "flags.pillars-of-eternity.itemEquip")
    }
}