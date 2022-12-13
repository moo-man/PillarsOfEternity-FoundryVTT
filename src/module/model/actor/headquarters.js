

export class HeadquartersDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            residents: new foundry.data.fields.EmbeddedDataField(EmbeddedActorDataModel),
            staff: new foundry.data.fields.EmbeddedDataField(EmbeddedActorDataModel),
            accommodations: new foundry.data.fields.EmbeddedDataField(AccommodationsDataModel),
            size: new foundry.data.fields.NumberField(),
            log : new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField({
                text : new foundry.data.fields.StringField(),
                year : new foundry.data.fields.NumberField(),
                season :  new foundry.data.fields.NumberField()
            })),
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
            }
        }

        mergeObject(data, {
            "system.accommodations.list" :  this._cleanAccommodationOccupants(data.system?.accommodations?.list || this.accommodations.list),
            "system.residents.list" :  this._cleanActors(data.system?.residents?.list || this.residents.list),
            "system.staff.list" :  this._cleanActors(data.system?.staff?.list || this.staff.list)
        })
    }

    addToLog(text)
    {
        let time = game.pillars.time.current
        let entry = {
            text,
            year : time.year,
            season : time.season
        }
        let newLog = [entry].concat(this.log)
        return newLog
    }

    computeBase() {
        this.residents.findActors();
        this.staff.findActors();
        this.size = this.accommodations.list.length
    }

    computeDerived(items) {
        this.disrepair.ruin = this.disrepair.value >= 3
        this.residents.computeTotal()
        this.staff.computeTotal()
        this.accommodations.prepareAccommodations(this.residents)
        this.residents.setAccommodations(this.accommodations)
        this.accommodationUpkeep = this.accommodations.list.reduce((total, accomm) => total + accomm.upkeep, 0) // Used for calculating defense upkeep

        this.upkeep = 
            this.accommodationUpkeep + 
            this.staff.list.reduce((total, staff) => total += staff.count * (staff.document?.system.upkeep?.value || 0), 0) +
            items.space.reduce((total, space) => total += space.system.upkeep.value, 0) +
            items.defense.reduce((total, defense) => total += defense.system.upkeep.value * Math.ceil(this.accommodationUpkeep / defense.system.upkeep.per), 0)

    }

    performUpkeep(items) {

        // TODO: if upkeep isn't paid
        let library = this.handleLibrary(items);
        return {"system.treasury.value" : this.treasury.value - this.upkeep, "system.log" : this.addToLog("Upkeep: " + this.upkeep)}
    }

    handleLibrary(items) {
        let books = items.equipment.filter(i => i.category?.value == "book")

        let librariansNeeded = Math.floor(books.length / 30)

        let librariansPresent = this.staff.list.filter(i => i.type == "book").reduce((prev, current) => prev += current.count || 1, 0)

        if (this.disrepair.value > 0 || librariansPresent < librariansNeeded)
        {
            let roll = Math.ceil(CONFIG.Dice.randomUniform() * 10) + (this.disrepair.ruin ? 5 : this.disrepair.value);

            let damage = 0;
            let texts = 0;

            if (roll >= 15)
            {
                texts = 2;
                damage = 6;
            }
            else if (roll >= 13)
            {
                texts = 1;
                damage = 6;
            }
            else if (roll == 12)
            {
                texts = 2;
                damage = 2;
            }
            else if (roll == 11)
            {
                texts = 1;
                damage = 2;
            }
            else if (roll == 10)
            {
                texts = 2;
                damage = 1;
            }
            else if (roll >= 6)
            {
                texts = 1;
                damage = 1;
            }
            else 
            {
                // no damage
            }

            // Texts selected to be damaged
            let textsDamaged = [];

            // If more books damaged is greater or equal to the library contents, use all books
            if (books.length <= texts)
            {
                textsDamaged = books;
            }
            else // Select unique books to damage
            {
                while(texts > 0) 
                {
                    let index = Math.ceil(CONFIG.Dice.randomUniform() * 10);

                    // Only decrement if book isn't already included
                    if (!textsDamaged.find(i => i.id == books[index].id))
                    {
                        textsDamaged.push(books[index]);
                        texts--;
                    }
                }
            }

            for(let book of textsDamaged.map(i => i.toObject()))
            {
                book.system.damage.value += damage;
            }

            return textsDamaged
        }


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

    // Make sure occupantIds only include existing residents
    _cleanAccommodationOccupants(list)
    {
        return list.map(a => {
            a.occupantIds = a.occupantIds.filter(i => this.residents.getActor(i))
            return a
        })
    }

    // Make sure residents/staff only includes existing actors
    _cleanActors(list) {
        return list.filter(i => game.actors.has(i.id))
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
                    type : new foundry.data.fields.StringField(),
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

    add(actor, type=undefined) {
        let obj = { id: actor.id, count: 1 };

        // Only used by staff
        if (type)
            obj.type = type;

        let list = super.add(obj)
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
            return this.list[this.findIndex(id)]?.document
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

            upkeep = Math.max(1, upkeep);

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