export default function () {


    Hooks.on("renderChatMessage", async (app, html, msg) => {
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

    
    })

    // Activate chat listeners defined in dice-wfrp4e.js
    Hooks.on('renderChatLog', (log, html, data) => {

        html.on("click", ".roll-damage", (ev) => {
            let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
            const message = game.messages.get(messageId);
            let check = message.getCheck();
            new game.pillars.apps.DamageDialog(check.item, check, Array.from(game.user.targets)).render(true)

        })

        html.on("click", ".apply-effect", (ev) => {
            let messageId = $(ev.currentTarget).parents(".message").attr("data-message-id")
            const message = game.messages.get(messageId);
            let check = message.getCheck();
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

            canvas.tokens.controlled.forEach(t => {
                t.actor.createEmbeddedDocuments("ActiveEffect", [effect])
            })
        })
    });

}
