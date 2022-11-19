

export class HeadquartersDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            residents: new foundry.data.fields.EmbeddedDataField(EmbeddedActorDataModel),
            staff: new foundry.data.fields.EmbeddedDataField(EmbeddedActorDataModel),
            accommodations: new foundry.data.fields.EmbeddedDataField(AccommodationsDataModel),
            size: new foundry.data.fields.NumberField(),
            treasury: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.NumberField({ default: 0, min: 0 }),
            }),
            disrepair: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.NumberField({ default: 0, min: 0}),
            }),
        }
    }

    getPreCreateData(data) {
        let preCreateData = {}
        if (!data.prototypeToken) {
            mergeObject(preCreateData, {
                'prototypeToken.disposition': CONST.TOKEN_DISPOSITIONS.NEUTRAL, // Default disposition to neutral
                'prototypeToken.name': data.name, // Set token name to actor name
                'prototypeToken.actorLink': true
            });
        }

        if (!data.img)
            preCreateData.img = "icons/svg/castle.svg";

        if (!getProperty(data, "system.accommodations.list"))
        {
            setProperty(preCreateData, "system.accommodations.list", this._createAccommodations(15))
        }

        return preCreateData
    }


    handlePreUpdate(data)  
    {
        if (data.system?.size)
        {
            if (data.system.size > this.size)
            {
                setProperty(data, "system.accommodations.list", this.accommodations.list.concat(this._createAccommodations(data.system.size - this.size)))
            }
            else if (data.system.size < this.size)
            {
                let remaining = this.accommodations.list.slice(0, data.system.size)
                setProperty(data, "system.accommodations.list", remaining)
                // removed
            }
        }
    }

    computeBase() {
        this.residents.findActors();
        this.staff.findActors();
        this.size = this.accommodations.list.length
    }

    computeDerived() {
        this.disrepair.ruin = this.disrepair.value >= 3
        this.residents.computeTotal()
        this.staff.computeTotal()
        this.accommodations.prepareAccommodations(this.residents)
        this.residents.setAccommodations(this.accommodations)
    }

    _createAccommodations(number)
    {
        return Array(number).fill(undefined).map((i, index) => {
            return {
                id : randomID(),
                label : `Room ${index + 1}`,
                prepared : false,
                spaceId : "",
                occupantIds : []
            }
        })
    }

}


class ListDataModel extends foundry.abstract.DataModel
{
    static defineSchema() {
        return {
            list: new foundry.data.fields.ArrayField(new foundry.data.fields.ObjectField()),
        }
    }

    add(object) {
        let list = duplicate(this.list);
        list.push(object)
        return list
    }

    remove(index) {
        let list = duplicate(this.list);
        list.splice(index, 1);
        return list
    }

    edit(index, data) {
        let list = duplicate(this.list);
        mergeObject(list[index], data, { overwrite: true })
        return list
    }
}


class EmbeddedActorDataModel extends ListDataModel {
    static defineSchema() {
        return {
            list: new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField(
                {
                    id: new foundry.data.fields.StringField(),
                    count: new foundry.data.fields.NumberField({ integer: true, min: 0 }),
                }
            )),
            extra: new foundry.data.fields.NumberField({ min: 0, integer: true }),
        }
    }

    /* PREPARATION FUNCTIONS */
    findActors() {
        if (game.ready) {
            this.list.forEach(i => i.document = game.actors.get(i.id))
        }
    }

    computeTotal() {
        this.total = this.extra + this.list.reduce((prev, current) => prev += (current.count || 1), 0)
    }

    setAccommodations(accommodations)
    {
        this.list.forEach(resident => {
            resident.accommodation = accommodations.list.find(a => a.occupantIds.includes(resident.id))
        })
    }

    /* EDIT FUNCTIONS */

    add(actor) {
        let list = super.add({ id: actor.id, count: 1 })
        return list
    }

    editId(id, data) {
        return this.edit(this.findIndex(id), data)
    }


    /* HELPER FUNCTIONS */
    findIndex(id)
    {
        return this.list.findIndex(i => i.id == id)
    }

    getActor(id) {
        let index = this.findIndex(id)
        if (index >= 0)
            return this.list[this.findIndex(id)].document
    }
    
}


class AccommodationsDataModel extends ListDataModel {
    static defineSchema() {
        return {
            list: new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField({
                label : new foundry.data.fields.StringField(),
                prepared: new foundry.data.fields.BooleanField(),
                spaceId: new foundry.data.fields.StringField(),
                occupantIds: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField()),
            }))
        }
    }

    addActorTo(index, actorId)
    {
        if (!this.list[index].occupantIds.includes(actorId))
            return this.edit(index, {occupantIds : this.list[index].occupantIds.concat([actorId])})
    }

    removeActorFrom(index, actorId)
    {
        return this.edit(index, {occupantIds : this.list[index].occupantIds.filter(i => i != actorId)})
    }

    // Edit accommodation with given occupant ID 
    editActorId(actorId, data)
    {
        let index = this.list.findIndex(i => i.occupantIds.includes(actorId))
        if (index >= 0)
            return this.edit(index, data)
    }

    reset() {
        return this.list.map(i => {
            i.occupantIds = [];
            return i
        })
    }

    /**
     * Sets occupant and current status of the accommodation
     * 
     * @param {EmbeddedActorDataModel} residents Current Residents in the strong hold
     */
    prepareAccommodations(residents) {
        for(let a of this.list)
        {
            a.occupants = a.occupantIds.map(i => residents.getActor(i))
            let upkeep = a.occupants.reduce((acc, actor) => acc + game.pillars.config.sizeAccommodations[actor.system.size.value], 0)
            let bonded = a.occupants.some(actor => a.occupants.find(target => actor.isBondedWith(target)))

            if (bonded)
                upkeep -= 1

            a.upkeep = upkeep

            if (!a.prepared)
            {
                a.status = "unprepared"
            }
            else if (a.occupants.filter(i => i) == 0)
            {
                a.status = "unoccupied"
            }
            else 
            {
                a.status = "occupied"
            }
        }
    }

}