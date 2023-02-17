import { PillarsItem } from "../../../document/item-pillars";

export default function activateSharedListeners(html, sheet )
{
    html.find(".list-edit").on("click", _onListEdit.bind(sheet));
    html.find(".list-create").on("click", _onListCreate.bind(sheet));
    html.find(".list-delete").on("click", _onListDelete.bind(sheet));
    html.find(".property-toggle").on("click", _onPropertyToggle.bind(sheet));
    html.on("click", ".list-post", _onListPost.bind(sheet));
    html.find(".property-edit").on("change", _onPropertyEdit.bind(sheet));

    function _onListEdit(ev) 
    {   
        const id = _getId(ev);
        const collection = _getCollection(ev);

        (getProperty(this.object, collection).get(id))?.sheet?.render(true);
    }

    
    function _onListDelete(ev) 
    {   
        const id = _getId(ev);
        const collection = _getCollection(ev);

        Dialog.confirm({
            title: game.i18n.localize("PILLARS.DeleteItem"),
            content: `<p>${game.i18n.localize("PILLARS.DeleteConfirmation")}</p>`,
            yes: () => 
            {
                (getProperty(this.object, collection).get(id))?.delete();
            },
            no: () => {},
            defaultYes: true
        });

    }

    async function _onListCreate(ev) 
    {   
        const collection = _getCollection(ev);
        const cls = collection == "effects" ? ActiveEffect : PillarsItem;

        const createData =  collection == "effects" ? await _effectCreateData(ev) : _itemCreateData(ev);

        cls.create(createData, {parent : this.object});
    }

    function _onListPost(ev) 
    {
        const id = _getId(ev);
        const collection = _getCollection(ev);

        (getProperty(this.object, collection).get(id))?.postToChat();
    }

    function _onPropertyEdit(ev) 
    {   
        const id = _getId(ev);
        const path = ev.currentTarget.dataset.path;
        let document = this.object;

        // If ID is specified, edit an embedded document
        if (id)
        {
            const collection = _getCollection(ev);
            document = getProperty(this.object, collection).get(id);
        }

        const value = _getInputValue(ev);

        document?.update({[`${path}`] : value});
    }

    // function _onArrayEdit(ev) 
    // {   
    //     const id = _getId(ev);
    //     const path = ev.currentTarget.dataset.path as string;
    //     let document : (PillarsActiveEffect | PillarsActor | PillarsItem)= this.object;

    //     // If ID is specified, edit an embedded document
    //     if (id)
    //     {
    //         const collection = _getCollection(ev);
    //         document = getProperty(this.object, collection).get(id)! as (PillarsActiveEffect | PillarsActor | PillarsItem);
    //     }

    //     const value = _getInputValue(ev);

    //     document?.update({[`${path}`] : value});
    // }
    
    function _onPropertyToggle(ev) 
    {   
        const id = _getId(ev);
        const path = ev.currentTarget.dataset.path;
        let document = this.object;

        // If ID is specified, edit an embedded document
        if (id)
        {
            const collection = _getCollection(ev);
            document = getProperty(this.object, collection).get(id);
        }

        document?.update({[`${path}`] : !getProperty(document, path)});
    }


    function _getInputValue(ev)
    {
        let value = ev.currentTarget.type == "number" ? Number(ev.currentTarget.value) : ev.currentTarget.value;

        if (ev.currentTarget.type == "checkbox")
        {
            value = (ev.currentTarget).checked;
        }
        return value;
    }

    function _getIndex(ev)
    {
        let index = ev.currentTarget.dataset.index;

        if (!Number.isNumeric(index))
        {
            const parent = $(ev.currentTarget).parents("[data-index]");
            if (parent)
            {
                index = parent[0]?.dataset.index;
            }
        }
        return Number(index);
    }


    function _getId(ev)
    {
        let id = ev.currentTarget.dataset.id;

        if (!id)
        {
            const parent = $(ev.currentTarget).parents("[data-id]");
            if (parent)
            {
                id =parent[0]?.dataset.id;
            }
        }
        return id;
    }

    function _getCollection(ev)
    {
        let collection = ev.currentTarget.dataset.collection;

        if (!collection)
        {
            const parent = $(ev.currentTarget).parents("[data-collection]");
            if (parent)
            {
                collection =parent[0]?.dataset.collection;
            }
        }
        return collection || "items";
    }
}

async function _effectCreateData(ev)
{
    const type = ev.currentTarget.dataset.type;
    const createData = { label: game.i18n.localize("PILLARS.NewEffect"), icon: "icons/svg/aura.svg" };
    if (type == "temporary") 
    {
        createData["duration.rounds"] = 1;
    }

    const html = await renderTemplate("systems/pillars-of-eternity/templates/apps/quick-effect.hbs", createData);
    return new Promise(resolve => 
    {
        new Dialog({
            title: game.i18n.localize("PILLARS.QuickEffect"),
            content: html,
            buttons: {
                create: {
                    label: "Create",
                    callback: (html) => 
                    {
                        html = $(html);
                        const mode = 2;
                        const label = html.find(".label").val();
                        const key = html.find(".key").val();
                        const value = parseInt(html.find(".modifier").val()?.toString() || "");
                        createData.label = label;
                        createData.changes = [{ key, mode, value }];
                        resolve(createData);
                    },
                },
                skip: {
                    label: "Skip",
                    callback: () => resolve(createData),
                },
            },
            render: (dlg) => 
            {
                $(dlg).find(".label").trigger("select");
            },
        }).render(true);
    });
}
function _itemCreateData(ev)
{
    const type = ev.currentTarget.dataset.type;
    const category = ev.currentTarget.dataset.category;
    const createData = { name: `New ${game.i18n.localize(CONFIG.Item.typeLabels[type])}`, type };
    if (type == "power") {createData["system.improvised.value"] = true;}

    if (category) {createData["system.category.value"] = category;}
    return createData;
}

