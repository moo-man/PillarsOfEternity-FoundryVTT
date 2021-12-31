export default class DamageRoll {
    constructor(damages, check, item)
    {
        damages.forEach(async (damage, i) => {
            let multiplier = damage.mult
            let type = game.pillars.config.damageTypes[damage.type]
            let baseDice = [new Die({number : parseInt(damage.base.split("d")[0]), faces : parseInt(damage.base.split("d")[1]), options : {flavor: "Base"}})]
            let critDice = []
            for(let i = 0 ; i < multiplier; i++)
            {
                critDice.push(new OperatorTerm({operator : "+"}))
                critDice.push(new Die({number : parseInt(damage.crit.split("d")[0]), faces : parseInt(damage.crit.split("d")[1]), options :  {flavor : `${i + 1}x Crit`}}))
            }
            let dice = baseDice.concat(critDice)
            let roll = Roll.fromTerms(dice)
            await roll.evaluate({async: true})
            //new DamageRoll(damage, this.check)
            await roll.toMessage({flavor : damage.label ? `${damage.label} Damage - ${type}` : `${item.name} Damage ${damages.length > 1 ? i + 1 : ""} - ${type}`, speaker : item.actor.speakerData()});
        })
    }
}