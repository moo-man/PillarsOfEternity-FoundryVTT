import { getGame } from "../../pillars";
import { DamageType } from "../../types/common";

export default function () {
    Hooks.on("getChatLogEntryContext", addChatMessageContextOptions)
}


 function addChatMessageContextOptions (html, options) {
    let isDamage = (li : JQuery<HTMLElement>) => {
      const message = getGame().messages!.get(li.data("messageId"));
      let test = duplicate(message)
      return message?.isRoll && getProperty(message, "data.flags.pillars-of-eternity.damageData") && !isHealing(li)
    };

    let isHealing = (li : JQuery<HTMLElement>) => {
      const message = getGame().messages!.get(li.data("messageId"));
      return message?.isRoll && getProperty(message, "data.flags.pillars-of-eternity.damageData.healing")
    };


    let canAddTargets = (li : JQuery<HTMLElement>) => {
      let game = getGame()
      const message = getGame().messages!.get(li.data("messageId"));
      return message && game.user!.targets.size > 0 && (message.isAuthor || game.user!.isGM) && message.getCheck()
    }
    options.push(
      {
        name: "Apply Damages",
        icon: '<i class="fas fa-user-minus"></i>',
        condition: isDamage,
        callback: (li: JQuery<HTMLElement>) => {
          const message = getGame().messages!.get(li.data("messageId"));
          let roll = message?.getDamage()
          let index = parseInt(message?.getFlag("pillars-of-eternity", "damageIndex") as string)
          roll?.applyDamage(index)

        }
      },
      {
        name: "Apply Healing",
        icon: '<i class="fas fa-user-plus"></i>',
        condition: isHealing,
        callback: (li: JQuery<HTMLElement>) => {
          const message = getGame().messages!.get(li.data("messageId"));
          let roll = message?.getDamage()
          let index = parseInt(message?.getFlag("pillars-of-eternity", "damageIndex") as string)
          roll?.applyHealing(index)

        }
      },
      {
        name : "Add Targets",
        icon : '<i class="fas fa-crosshairs"></i>',
        condition: canAddTargets,
        callback: (li: JQuery<HTMLElement>) => {
          const message = getGame().messages!.get(li.data("messageId"));
          let roll = message?.getCheck()
          roll?.addTargets(Array.from(getGame().user!.targets))
        }
      }
    );
    return options;
  };
  
  /* -------------------------------------------- */
  
  /**
   * Apply rolled dice damage to the token or tokens which are currently controlled.
   * This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
   *
   * @param {HTMLElement} li      The chat entry which contains the roll data
   * @param {Number} multiplier   A damage multiplier to apply to the rolled damage.
   * @return {Promise}
   */
  function applyChatCardDamage(li : JQuery<HTMLElement>, type : DamageType, multiplier: number) {
    const message = getGame().messages!.get(li.data("messageId"));
    const roll = message?.roll;
    return Promise.all(canvas!.tokens!.controlled.map(t => {
      const a = t.actor;
      return a.applyDamage(roll?.total || 0, type, multiplier);
    }));
  }