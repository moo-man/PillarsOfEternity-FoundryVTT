export class BasicDetailsModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            culture: new foundry.data.fields.StringField(),
            species: new foundry.data.fields.StringField(),
            stock: new foundry.data.fields.StringField(),
            godlike: new foundry.data.fields.StringField()
        }
    }

    compute(items)
    {
        this.species = items.species[0]?.name;
        this.stock = items.stock[0]?.name;
        this.culture = items.culture[0]?.name;
        this.godlike = items.godlike[0]?.name;
    }

}


export class ComputedDetailsModel extends BasicDetailsModel {

    // trying to figure out how to get these items in a clean fashion
    compute(items)
    {
        super.compute(items)
        let species = items.species[0]
        return {stride : species?.system.stride.value, size : species?.system.size.value};
    }

}