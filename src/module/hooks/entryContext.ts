import { getGame } from "../system/utility";

export default function () 
{
    Hooks.on("getChatLogEntryContext", addChatMessageContextOptions);
    Hooks.on("getActorDirectoryEntryContext", addActorContextOptions);
}


function addChatMessageContextOptions (html: JQuery, options: ContextMenuEntry[]) 
{
    const isDamage = (li : JQuery<HTMLElement>): boolean=> 
    {
        const message = getGame().messages!.get(li.data("messageId"));
        const test = duplicate(message);
        return message?.isRoll && getProperty(message, "flags.pillars-of-eternity.damageData") && !isHealing(li);
    };

    const isHealing = (li : JQuery<HTMLElement>): boolean => 
    {
        const message = getGame().messages!.get(li.data("messageId"));
        return message?.isRoll && getProperty(message, "flags.pillars-of-eternity.damageData.healing");
    };


    const canAddTargets = (li : JQuery<HTMLElement>): boolean => 
    {
        const game = getGame();
        const message = getGame().messages!.get(li.data("messageId"));
        return !!(message && game.user!.targets.size > 0 && (message.isAuthor || game.user!.isGM) && message.getCheck());
    };
    options.push(
        {
            name: "Apply Damages",
            icon: '<i class="fas fa-user-minus"></i>',
            condition: isDamage,
            callback: (li: JQuery<HTMLElement>) => 
            {
                const message = getGame().messages!.get(li.data("messageId"));
                const roll = message?.getDamage();
                const index = parseInt(message?.getFlag("pillars-of-eternity", "damageIndex") as string);
                roll?.applyDamage(index);

            }
        },
        {
            name: "Apply Healing",
            icon: '<i class="fas fa-user-plus"></i>',
            condition: isHealing,
            callback: (li: JQuery<HTMLElement>) => 
            {
                const message = getGame().messages!.get(li.data("messageId"));
                const roll = message?.getDamage();
                const index = parseInt(message?.getFlag("pillars-of-eternity", "damageIndex") as string);
                roll?.applyHealing(index);

            }
        },
        {
            name : "Add Targets",
            icon : '<i class="fas fa-crosshairs"></i>',
            condition: canAddTargets,
            callback: (li: JQuery<HTMLElement>) => 
            {
                const message = getGame().messages!.get(li.data("messageId"));
                const roll = message?.getCheck();
                roll?.addTargets(Array.from(getGame().user!.targets));
            }
        }
    );
    return options;
}
  
function addActorContextOptions (html: JQuery, options: ContextMenuEntry[]) 
{

    const isActiveHeadquarters = (li : JQuery<HTMLElement>) : boolean => 
    {
        const id = li.attr("data-document-id");
        const actor = getGame().actors!.get(id!)!;
        return actor.type == "headquarters" && getGame().pillars.headquarters.isActive(actor.id);
    };

    const isInactiveHeadquarters = (li : JQuery<HTMLElement>) : boolean => 
    {
        const id = li.attr("data-document-id");
        const actor = getGame().actors!.get(id!)!;
        return actor.type == "headquarters" && !getGame().pillars.headquarters.isActive(actor.id);
    };


    options.push({
        name: "PILLARS.ToggleHeadquartersActive",
        icon: '<i class="fa-solid fa-house-turret"></i>',
        condition: isInactiveHeadquarters,
        callback: (li: JQuery<HTMLElement>) => 
        {
            const id = li.attr("data-document-id");
            getGame().pillars.headquarters.activate(id!);
        }
    },
    );

    options.push({
        name: "PILLARS.ToggleHeadquartersInactive",
        icon: '<i class="fa-solid fa-house-turret"></i>',
        condition: isActiveHeadquarters,
        callback: (li: JQuery<HTMLElement>) => 
        {
            const id = li.attr("data-document-id");
            getGame().pillars.headquarters.deactivate(id!);
        }
    },
    );
}