export class BaseActorDataModel extends foundry.abstract.DataModel 
{
    static preventItemTypes = [];
    static singletonItemTypes = [];
    static singletonPaths = {};
  
    async getPreCreateData(data)
    {
        let preCreateData = {};
        if (!data.prototypeToken)
        {
            mergeObject(preCreateData, {
                "prototypeToken.name" : data.name,
            });
        }
        return preCreateData;
    }

    async preUpdate(data, options, user)  
    {

    }

    async onUpdate(data, options, user)
    {
        
    }

    preCreateItem(item, options, id)
    {
        if (this.constructor.preventItemTypes.includes(item.type))
        {
            ui.notifications.error(game.i18n.format("PILLARS.ItemNotAllowed", {type : item.type}));
            return false;
        }
    }

        
    onCreateItem(item)
    {
        if (this.constructor.singletonItemTypes.includes(item.type))
        {
            item.actor.update({
                [`${this.constructor.singletonPaths[item.type]}`] : getProperty(item.actor, this.constructor.singletonPaths[item.type]).updateSingleton(item)
            });
        }
    }


    computeBase() 
    {
    }

    computeDerived()
    {
       
    }
}