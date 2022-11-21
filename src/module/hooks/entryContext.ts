import { getGame } from "../system/utility";

export default function () {
    Hooks.on("getChatLogEntryContext", addChatMessageContextOptions)
    Hooks.on("getActorDirectoryEntryContext", addActorContextOptions)
}


 function addChatMessageContextOptions (html: JQuery, options: ContextMenuEntry[]) {
    let isDamage = (li : JQuery<HTMLElement>): boolean=> {
      const message = getGame().messages!.get(li.data("messageId"));
      let test = duplicate(message)
      return message?.isRoll && getProperty(message, "flags.pillars-of-eternity.damageData") && !isHealing(li)
    };

    let isHealing = (li : JQuery<HTMLElement>): boolean => {
      const message = getGame().messages!.get(li.data("messageId"));
      return message?.isRoll && getProperty(message, "flags.pillars-of-eternity.damageData.healing")
    };


    let canAddTargets = (li : JQuery<HTMLElement>): boolean => {
      let game = getGame()
      const message = getGame().messages!.get(li.data("messageId"));
      return !!(message && game.user!.targets.size > 0 && (message.isAuthor || game.user!.isGM) && message.getCheck())
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
  
  function addActorContextOptions (html: JQuery, options: ContextMenuEntry[]) {

     let isActiveHeadquarters = (li : JQuery<HTMLElement>) : boolean => {
        let id = li.attr("data-document-id")
        let actor = getGame().actors!.get(id!)!
        return actor.type == "headquarters" && getGame().pillars.headquarters.isActive(actor.id)
     }

     let isInactiveHeadquarters = (li : JQuery<HTMLElement>) : boolean => {
      let id = li.attr("data-document-id")
      let actor = getGame().actors!.get(id!)!
      return actor.type == "headquarters" && !getGame().pillars.headquarters.isActive(actor.id)
   }


     options.push({
        name: "PILLARS.ToggleHeadquartersActive",
        icon: '<i class="fa-solid fa-house-turret"></i>',
        condition: isInactiveHeadquarters,
        callback: (li: JQuery<HTMLElement>) => {
          let id = li.attr("data-document-id")
          getGame().pillars.headquarters.activate(id!)
        }
      },
     )

     options.push({
      name: "PILLARS.ToggleHeadquartersInactive",
      icon: '<i class="fa-solid fa-house-turret"></i>',
      condition: isActiveHeadquarters,
      callback: (li: JQuery<HTMLElement>) => {
        let id = li.attr("data-document-id")
        getGame().pillars.headquarters.deactivate(id!)
      }
    },
   )
  }