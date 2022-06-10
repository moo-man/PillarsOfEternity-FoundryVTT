import { Data } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/dice/roll";
import { ActiveEffectDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData";
import { getGame } from "../../pillars";
import {  CheckDataFlattened, DialogDamage, DialogHealing, SkillCheckData } from "../../types/checks";
import { PowerBaseEffect } from "../../types/powers";
import DamageDialog from "../apps/damage-dialog";
import HealingDialog from "../apps/healing-dialog";
import { PillarsItem } from "../item/item-pillars";
import DamageRoll from "../system/damage-roll";
import PillarsActiveEffect from "./pillars-effect";
import PILLARS_UTILITY from "./utility";

export default class SkillCheck
{
    data? : SkillCheckData
    roll? : Roll


        constructor(data? : CheckDataFlattened) {
            if (!data)
                return 
            this.data = {
                checkData : {
                    title : data.title,
                    modifier : data.modifier,
                    steps : data.steps,
                    proxy : data.proxy,
                    assister : data.assister,
                    state : data.state || "normal",
                    skillId : data.skillId,
                    skillName : data.skillName
                },
                context : {
                    speaker : data.speaker,
                    targetSpeakers : data.targetSpeakers || [],
                    rollClass : this.constructor.name,
                    rollMode : data.rollMode,
                    messageId : "",
                },
                result : <SkillCheckData["result"]>{}
            }
        }
    
        static recreate(data : SkillCheckData)
        {
            let classes = getGame()!.pillars.rollClass;
            let check = new classes[data.context.rollClass as keyof typeof classes]();
            check.data = data;
            check.roll = Roll.fromData(<Data><unknown>check.data.result) // No idea what it wants from me here
            return check
        }
    
        getTerms() 
        {
            let terms : (PoolTerm | OperatorTerm | Die | NumericTerm | RollTerm)[]= []

            if(this.checkData?.state == "normal")
            {
                terms.push(new Die({number : 2, faces : 10, modifiers : ["xp" as keyof Die.Modifiers]}))
            }
            else 
            {
                let modifier = ""
                let flavor = ""
                if (this.checkData?.state == "adv") 
                {
                    modifier = "kh"
                    flavor = "Advantage"
                }
                else if (this.checkData?.state == "dis") 
                {
                    flavor = "Disadvantage"
                    modifier = "kl"
                }


                                                                                                          // TODO fix this?
                terms.push(new PoolTerm({terms : ["2d10xp", `1d20xp[${flavor}]`], modifiers : [modifier], isDeterministic : false }))
            }

            let assisterDie : Partial<Die.TermData> = <Partial<Die.TermData>>this.assisterDie()

            if (assisterDie)
            {
                assisterDie.options = {flavor : this.assister?.name || ""}
                terms.push(new OperatorTerm({operator : "+"}))
                terms.push(new Die(assisterDie))
            }

            if (this.checkData?.modifier)
            {
                terms.push(new OperatorTerm({operator : "+"}))
                terms = terms.concat(Roll.parse(this.checkData?.modifier, {}))
            }

            if (this.checkData?.steps)
            {
                if (this.checkData?.steps > 0)
                    terms.push(new OperatorTerm({operator : "+"}))
                else if (this.checkData?.steps < 0)
                    terms.push(new OperatorTerm({operator : "-"}))

                let stepsDie : Die.TermData = <Die.TermData>PILLARS_UTILITY.stepsToDice(this.checkData?.steps)

                if (this.checkData?.steps > 0)
                    stepsDie.options = {flavor : "Bonus Die"}
                else if (this.checkData?.steps < 0)
                    stepsDie.options = {flavor : "Penalty Die"}

                terms.push(new Die(stepsDie))
            }

            if (!this.checkData?.proxy && this.skill)
            {
                terms.push(new OperatorTerm({operator : "+"}))
                terms.push(new NumericTerm({number : this.skill.rank || 0}))
            }
            else if (this.checkData?.proxy)
            {
                terms.push(new OperatorTerm({operator : "+"}))
                terms.push(new Die(this.proxyDie()))
            }

            return terms

        }
    
        async rollCheck() {
            
            let terms = this.getTerms()
            this.roll = Roll.fromTerms(terms)
            await this.roll.evaluate({async:true})  

            if (this.actor.type == "character")
                this.actor.use("skill", this.checkData?.skillName || "")
            this.data!.result = <SkillCheckData["result"]>this.roll.toJSON()
        }
    
    
    
        _computeResult()
        {   
        }

    
        async sendToChat()
        {
            let tooltip = await this.roll?.getTooltip()
            let content = await renderTemplate("systems/pillars-of-eternity/templates/chat/check.html", {check : this, tooltip})
            let chatData = {
                content,
                speaker : this.context?.speaker,
                "flags.pillars-of-eternity.rollData" : this.data,
                type : CONST.CHAT_MESSAGE_TYPES.ROLL,
                roll : this.roll?.toJSON()
            }
            ChatMessage.applyRollMode(chatData, this.context!.rollMode)
            if (!this.message)
            {
                return ChatMessage.create(chatData).then(message => {
                    message!.update({"flags.pillars-of-eternity.rollData.context.messageId" : message!.id})
                })
            }
            else 
            {
                return this.message.update(chatData)
            }
            
        }

        static rankToDie(skill : PillarsItem | undefined) : 8 | 6 | 4 | string {
            if (!skill) return ""

            if (skill.rank! >= 15)
                return 8
            if (skill.rank! >= 10)
                return 6
            if (skill.rank! >= 5)
                return 4
                
            return ""
        }

        proxyDie() {
            return {number : 1, faces : Number(SkillCheck.rankToDie(this.skill))}
        }

        assisterDie() {
            if (this.checkData?.assister)
                return {number : 1, faces : Number(SkillCheck.rankToDie(this.assister?.items.contents.find(i => i.data.name == this.skill?.data.name))), options : {appearance : this.assistDieAppearance()}}
            else return {}
        }

        assisterDieString() {
            if (this.checkData?.assister)
                return `d${SkillCheck.rankToDie(this.assister?.items.contents.find(i => i.data.name == this.skill?.data.name))}`
            else return ""
        }

        assistDieAppearance()
        {            
            if (getGame().dice3d)
                //@ts-ignore
                return getGame().dice3d.DiceFactory.getAppearanceForDice(getGame().dice3d.constructor.APPEARANCE(this.assisterUser), this.assisterDieString())
        }

        async rollDamage() {

            let damages = await new Promise<DialogDamage[]>((resolve, reject) => {
                new DamageDialog(this.item, this, this.targets).render(true, {resolve, reject})
            }) as (DialogHealing & DialogDamage)[]

            let roll = new DamageRoll(damages, this);
            await roll.rollDice()
        }

        async rollHealing() {

            let healing = await new Promise<DialogHealing[]>((resolve, reject) => {
                new HealingDialog(this.item, this, this.targets).render(true, {resolve, reject})
            }) as (DialogHealing & DialogDamage)[]

            let roll = new DamageRoll(healing, this);
            await roll.rollDice()
        }
        
        updateMessageFlags()
        {
            if (this.message)
                this.message.update({"flags.pillars-of-eternity.rollData" : this.data})
        }

        addTargets(targets : Token[]) {
            this.context!.targetSpeakers = this.context!.targetSpeakers.concat(targets.map(t => t.actor!.speakerData(t)))
            this.sendToChat()
        }

        // Convert effect data to effect objects (from ids or keys)
        _toEffectObjects(effects : PowerBaseEffect[])
        {
            let effectObjects:  (PillarsActiveEffect | {data : Partial<ActiveEffectDataConstructorData & { id: string }>, id : string})[] = []
            effects.forEach(e => {
                let effectObject 
                if (this.item?.effects)
                    effectObject = this.item.effects.get(e.value)
                if (!effectObject)
                    effectObject = {data : CONFIG.statusEffects.find(i => i.id == e.value)!, id : e.value}

                if (effectObject)
                    effectObjects.push(effectObject)
            })
            return effectObjects
        }

        get checkData()  { return this.data?.checkData }
        get context() { return this.data?.context}
        get result() { return this.data?.result}
    
        get actor() {
            let actor = PILLARS_UTILITY.getSpeaker(this.context?.speaker!)
            if (actor)
                return actor
            else throw new Error("Cannot find actor in Check object")
        }
    
        get assister() {
            return getGame().actors!.get(this.checkData?.assister || "")
        }

        get assisterUser() {
            let game = getGame()
            let actor = game.actors!.get(this.checkData?.assister || "")
            if (actor)
                return game.users!.find(i => i.character?.id == actor!.id)
        }

        get target() {
            return PILLARS_UTILITY.getSpeaker(this.context?.targetSpeakers[0]!)
        }

        get targets() : TokenDocument[] {
            return this.context?.targetSpeakers
            .map(speaker => getGame().scenes!.get(speaker.scene || "")?.tokens.get(speaker.token || "")!)
            .filter(i => i)
            || []
        }

        get effects () {
            let effects = this.item?.base?.effects || []
            return this._toEffectObjects(effects)
        }

        get item() : PillarsItem {
            return this.skill
        }

        get skill()  : PillarsItem{
            let skill =  this.actor.items.get(this.checkData?.skillId || "") || getGame().items!.get(this.checkData?.skillId || "");
            if (skill)
                return skill
            else throw new Error("Cannot find skill in Check object")
        }

        get doesDamage() {
            return this.item?.damage?.value?.filter(d => d.base || d.crit)?.length! > 0
        }

        get doesHealing() {
            return this.item?.healing?.length!  > 0
        }

        get hasEffects() {
            return this.effects.length
        }

        get tags() {
            return [this.skill?.Category]
        }

        get message() {
            return getGame().messages!.get(this.context?.messageId || "")
        }

        get requiresRoll() {
            return true
        }
}
