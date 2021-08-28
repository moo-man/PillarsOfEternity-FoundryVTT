export default function () {

    // If a container is deleted, reset location of all items within it.
    Hooks.on("deleteItem", (item) => {
        if (item.isOwned && item.type == "container")
        {
            let items = item.actor.items.filter(i => i.location  == item.id).map(i => {
                return {_id : i.id, "data.location" : ""}
            });
            item.actor.updateEmbeddedDocuments("Item", items);
        }
    })

    Hooks.on("preCreateItem", (item) => {
        if (item.type == "species" && item.isOwned)  
            item.actor.setSpeciesData(item)

        if (item.type == "culture" && item.isOwned)  
            item.actor.setCultureData(item)
    })
}