
export class PillarsChat {


    static async _onRenderChatMessage(app, html)
    {
                // Do not display "Blind" chat cards to non-gm
                if (html.hasClass("blind") && !game.user.isGM) {
                    html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
                    html.html("").css("display", "none");
                }
        
        
                let postedItem = html.find(".post-item")[0]
                if (postedItem)
                {
                    postedItem.setAttribute("draggable", true)
                    postedItem.addEventListener("dragstart", ev => {
                        ev.dataTransfer.setData("text/plain", JSON.stringify({type: "item", payload : app.getFlag("pillars-of-eternity", "transfer")}))
                    })
                }
    }


    static async _onDamageButtonClick(ev)
    {
        let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
        const message = game.messages.get(messageId);
        let check = message.getCheck();
        if (!message.getCheck().actor.isOwner)
            return ui.notifications.error("You don't have permission to interact with this check")
        check.rollDamage();
    }

    static async _onHealingButtonClick(ev)
    {
        let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
        const message = game.messages.get(messageId);
        let check = message.getCheck();
        if (!message.getCheck().actor.isOwner)
            return ui.notifications.error("You don't have permission to interact with this check")
        check.rollHealing();
    }


    static async _onApplyEffectClick(ev) 
    {
        let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
        const message = game.messages.get(messageId);
        let check = message.getCheck();
        if (!message.getCheck().actor.isOwner)
            return ui.notifications.error("You don't have permission to interact with this check")
        let item = check.item;
        let effectId = ev.currentTarget.dataset.effect;
        let effect = item.effects.get(effectId)
        if (effect)
        {
            effect = effect.toObject()
            setProperty(effect, "flags.core.statusId", effect.label.slugify())
        }
        else
        {
            effect = duplicate(CONFIG.statusEffects.find(i => i.id == effectId))
            setProperty(effect, "flags.core.statusId", effectId)
            delete effect.id
        }

        let tokens = game.user.targets.size ?  Array.from(game.user.targets) :  canvas.tokens.controlled


        tokens.forEach(t => {
            if (!t.document.isOwner)
                game.socket.emit("system.pillars-of-eternity", {type: "applyEffect" , payload : {effects : [effect], speaker : t.document.actor.speakerData(t)}})
            else 
                t.actor.createEmbeddedDocuments("ActiveEffect", [effect])
        })
    }

    static _onHoverInTargetImage(ev)
    {
        ev.preventDefault();
        if ( !canvas.ready ) return;
        const li = ev.target;
        let tokenId = li.dataset.tokenId
        const token = canvas.tokens.get(tokenId);
        if ( token?.isVisible ) {
          if ( !token._controlled ) token._onHoverIn(ev);
          this._highlighted = token;
        }
    }

    static _onHoverOutTargetImage(ev)
    {
        ev.preventDefault();
        if ( this._highlighted ) this._highlighted._onHoverOut(ev);
        this._highlighted = null;
    }

    
    static _onClickTargetImage(ev)
    {
        ev.preventDefault();
        if ( !canvas.ready ) return;
        const li = ev.target;
        let tokenId = li.dataset.tokenId
        const token = canvas.tokens.get(tokenId);
        canvas.animatePan({x: token.center.x, y: token.center.y, duration: 250});
    }


    static _onShieldClick(ev){
        let id = ev.currentTarget.dataset.id
        let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
        const message = game.messages.get(messageId);
        let check = message.getCheck();
        check.toggleShield(id)
        
    }

}   