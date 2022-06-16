import { ActiveEffectDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData";
import { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { getGame } from "../../pillars";
import { isEquippableData } from "../../types/common";

export class PillarsChat {

    static _highlighted? : Token | null


    static async _onRenderChatMessage(app : ChatMessage, html : JQuery<HTMLElement>)
    {
                // Do not display "Blind" chat cards to non-gm
                if (html.hasClass("blind") && !getGame().user!.isGM) {
                    html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
                    html.html("").css("display", "none");
                }
        
        
                let postedItem = html.find(".post-item")[0]
                if (postedItem)
                {
                    postedItem.setAttribute("draggable", "true")
                    postedItem.addEventListener("dragstart", (ev : DragEventInit) => {
                        ev.dataTransfer!.setData("text/plain", JSON.stringify({type: "item", payload : app.getFlag("pillars-of-eternity", "transfer")}))
                    })
                }
    }


    static async _onDamageButtonClick(ev : JQuery.ClickEvent)
    {
        let game = getGame();
        let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
        const message = game.messages?.get(messageId || "");
        let check = message?.getCheck();
        if (!check?.actor.isOwner)
            return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorCheckInteractPermission"))
        check?.rollDamage();
    }

    static async _onHealingButtonClick(ev : JQuery.ClickEvent)
    {
        let game = getGame();
        let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
        const message = game.messages?.get(messageId || "");
        let check = message?.getCheck();
        if (!check?.actor.isOwner)
            return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorCheckInteractPermission"))
        check?.rollHealing();
    }


    static async _onApplyEffectClick(ev : JQuery.ClickEvent) 
    {
        let game = getGame();
        let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
        const message = game.messages?.get(messageId || "");
        let check = message?.getCheck();
        if (!check?.actor.isOwner)
            return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorCheckInteractPermission"))

        let effectObj : PropertiesToSource<ActiveEffectDataProperties> & {id? : string}
        if (check)
        {
            let item = check.item;
            let effectId = ev.currentTarget.dataset.effect;
            let effect = item?.effects.get(effectId)
            if (effect)
            {
                effectObj = effect.toObject()
                setProperty(effectObj, "flags.core.statusId", effect.label.slugify())
            }
            else
            {
                effectObj = foundry.utils.deepClone(CONFIG.statusEffects.find(i => i.id == effectId)) as PropertiesToSource<ActiveEffectDataProperties> & {id? : string}

                setProperty(effectObj, "flags.core.statusId", effectId)
                delete effectObj.id
            }
        }

        let tokens = game.user!.targets.size ?  Array.from(game.user!.targets) :  canvas?.tokens!.controlled || []


        tokens.forEach(t => {
            if (!t.document.isOwner)
                game.socket!.emit("system.pillars-of-eternity", {type: "applyEffect" , payload : {effects : [effectObj], speaker : t.document.actor!.speakerData(t)}})
            else 
                t.actor!.createEmbeddedDocuments("ActiveEffect", [effectObj])
        })
    }

    static _onHoverInTargetImage(ev : JQuery.MouseEnterEvent)
    {
        ev.preventDefault();
        if ( !canvas?.ready ) return;
        const li = ev.target;
        let tokenId = li.dataset.tokenId
        const token = canvas.tokens?.get(tokenId);
        if ( token?.isVisible ) {
          //@ts-ignore not sure how to handle private functions, this function is useful and don't understand why it's private
          if ( !token._controlled ) token._onHoverIn(ev);
          this._highlighted = token;
        }
    }

    static _onHoverOutTargetImage(ev : JQuery.MouseLeaveEvent)
    {
        ev.preventDefault();
        //@ts-ignore
        if ( this._highlighted ) this._highlighted._onHoverOut(ev);
        this._highlighted = null;
    }

    
    static _onClickTargetImage(ev : JQuery.ClickEvent)
    {
        ev.preventDefault();
        if ( !canvas?.ready ) return;
        const li = ev.target;
        let tokenId = li.dataset.tokenId
        const token = canvas.tokens!.get(tokenId);
        if (token)
            canvas.animatePan({x: token.center.x, y: token.center.y, duration: 250});
    }


    static _onShieldClick(ev : JQuery.ClickEvent){
        let id = ev.currentTarget.dataset.id
        let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
        const message = getGame().messages!.get(messageId || "");
        let check = message?.getDamage();
        check?.toggleShield(id)
        
    }

    static _onAddSummonClick(ev : JQuery.ClickEvent) 
    {
        let game = getGame();
        let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
        const message = getGame().messages!.get(messageId || "");
        let check = message?.getCheck();
        if (!check?.actor.isOwner)
            return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorCheckInteractPermission"))
        let item = check?.item;
        let index = Number(ev.currentTarget.dataset.index);
        if (item && item.data.type == "power")
        {
            let itemData = foundry.utils.deepClone(item.summons![index]?.data);

            if (isEquippableData(itemData))
            {
                itemData.data.equipped.value = true;
            }
                
            let tokens = game.user!.targets.size ?  Array.from(game.user!.targets) :  canvas!.tokens?.controlled || []
            
            tokens.forEach(t => {
                if (!t.document.isOwner)
                game.socket!.emit("system.pillars-of-eternity", {type: "addItems" , payload : {items : [itemData], speaker : t.document.actor?.speakerData(t)}})
                else 
                t.actor?.createEmbeddedDocuments("Item", [{...itemData}])
                
                
                ui.notifications!.notify(game.i18n.format("PILLARS.ItemCreatedOn", {item: itemData?.name, actor : t.document.name}))
            })
        }
    }
}   