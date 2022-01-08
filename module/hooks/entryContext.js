export default function () {
    Hooks.on("getChatLogEntryContext", addChatMessageContextOptions)
}


 function addChatMessageContextOptions (html, options) {
   let isCheck = li => {
     const message = game.messages.get(li.data("messageId"));
     return message?.getCheck()
   }
    let isDamage = li => {
      const message = game.messages.get(li.data("messageId"));
      return message?.isRoll && getProperty(message, "data.flags.pillars-of-eternity.damageData")
    };
    options.push(
      {
        name: game.i18n.localize("Apply Damages"),
        icon: '<i class="fas fa-user-minus"></i>',
        condition: isDamage,
        callback: li => {
          const message = game.messages.get(li.data("messageId"));
          let roll = message.getCheck()
          let index = parseInt(message.getFlag("pillars-of-eternity", "damageIndex"))
          roll.applyDamage(index)

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
  function applyChatCardDamage(li, type, multiplier) {
    const message = game.messages.get(li.data("messageId"));
    const roll = message.roll;
    return Promise.all(canvas.tokens.controlled.map(t => {
      const a = t.actor;
      return a.applyDamage(roll.total, type, multiplier);
    }));
  }