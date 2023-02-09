import { ActiveEffectDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData";
import {  ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { PillarsActor } from "../../../document/actor-pillars";
import PillarsActiveEffect from "../../../document/effect-pillars";
import { PillarsItem } from "../../../document/item-pillars";
import { getGame } from "../../../system/utility";
import { BasePillarsActorSheet } from "../actor/base-sheet";
import { PillarsItemSheet } from "../item/item-sheet";

type PillarsSheet = BasePillarsActorSheet | PillarsItemSheet

export default function activateSharedListeners(html : JQuery<HTMLElement>, sheet : PillarsSheet)
{
    html.find(".list-edit").on("click", _onListEdit.bind(sheet));
    html.find(".list-create").on("click", _onListCreate.bind(sheet));
    html.find(".list-delete").on("click", _onListDelete.bind(sheet));
    html.find(".property-toggle").on("click", _onPropertyToggle.bind(sheet));
    html.on("click", ".list-post", _onListPost.bind(sheet));
    html.find(".property-edit").on("change", _onPropertyEdit.bind(sheet));

    function _onListEdit(this: PillarsSheet, ev : JQuery.ClickEvent) 
    {   
        const id = _getId(ev);
        const collection = _getCollection(ev);

        (getProperty(this.object, collection).get(id) as (Item | ActiveEffect))?.sheet?.render(true);
    }

    
    function _onListDelete(this: PillarsSheet, ev : JQuery.ClickEvent) 
    {   
        const id = _getId(ev);
        const collection = _getCollection(ev);

        Dialog.confirm({
            title: getGame().i18n.localize("PILLARS.DeleteItem"),
            content: `<p>${getGame().i18n.localize("PILLARS.DeleteConfirmation")}</p>`,
            yes: () => 
            {
                (getProperty(this.object, collection).get(id) as (Item | ActiveEffect))?.delete();
            },
            no: () => {},
            defaultYes: true
        });

    }

    async function _onListCreate(this: PillarsSheet, ev : JQuery.ClickEvent) 
    {   
        const dataset = ev.currentTarget.dataset;
        const collection = _getCollection(ev);
        const cls = collection == "effects" ? PillarsActiveEffect : PillarsItem;

        const createData =  collection == "effects" ? await _effectCreateData(ev) : _itemCreateData(ev);

        cls.create(createData as (ItemDataConstructorData & ActiveEffectDataConstructorData), {parent : this.object});
    }

    function _onListPost(this : PillarsSheet, ev : JQuery.ClickEvent)
    {
        const id = _getId(ev);
        const collection = _getCollection(ev);

        (getProperty(this.object, collection).get(id) as (PillarsItem))?.postToChat();
    }

    function _onPropertyEdit(this: PillarsSheet, ev : JQuery.EventBase) 
    {   
        const id = _getId(ev);
        const path = ev.currentTarget.dataset.path as string;
        let document : (PillarsActiveEffect | PillarsActor | PillarsItem)= this.object;

        // If ID is specified, edit an embedded document
        if (id)
        {
            const collection = _getCollection(ev);
            document = getProperty(this.object, collection).get(id)! as (PillarsActiveEffect | PillarsActor | PillarsItem);
        }

        const value = _getInputValue(ev);

        document?.update({[`${path}`] : value});
    }
    
    function _onPropertyToggle(this: PillarsSheet, ev : JQuery.ClickEvent) 
    {   
        const id = _getId(ev);
        const path = ev.currentTarget.dataset.path as string;
        let document : (PillarsActiveEffect | PillarsActor | PillarsItem)= this.object;

        // If ID is specified, edit an embedded document
        if (id)
        {
            const collection = _getCollection(ev);
            document = getProperty(this.object, collection).get(id)! as (PillarsActiveEffect | PillarsActor | PillarsItem);
        }

        const value = _getInputValue(ev);

        document?.update({[`${path}`] : !getProperty(document, path)});
    }


    function _getInputValue(ev : JQuery.UIEventBase | JQuery.EventBase)
    {
        let value = ev.currentTarget.type == "number" ? Number(ev.currentTarget.value) : ev.currentTarget.value;

        if (ev.currentTarget.type == "checkbox")
        {
            value = (ev.currentTarget as HTMLInputElement).checked;
        }
        return value;
    }

    function _getId(ev: JQuery.UIEventBase | JQuery.EventBase)
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

    function _getCollection(ev: JQuery.UIEventBase | JQuery.EventBase) : "items" | "effects"
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

async function _effectCreateData(ev: JQuery.ClickEvent) : Promise<ActiveEffectDataConstructorData>
{
    const type = ev.currentTarget.dataset.type;
    const createData: Record<string, unknown> = { label: getGame().i18n.localize("PILLARS.NewEffect"), icon: "icons/svg/aura.svg" };
    if (type == "temporary") 
    {
        createData["duration.rounds"] = 1;
    }

    const html = await renderTemplate("systems/pillars-of-eternity/templates/apps/quick-effect.hbs", createData);
    return new Promise(resolve => 
    {
        new Dialog({
            title: getGame().i18n.localize("PILLARS.QuickEffect"),
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
                        resolve(createData as ActiveEffectDataConstructorData);
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
function _itemCreateData(ev: JQuery.ClickEvent) : ItemDataConstructorData
{
    const type = ev.currentTarget.dataset.type;
    const category = ev.currentTarget.dataset.category;
    const createData: Record<string, unknown> & {name : string, type : string} = { name: `New ${getGame().i18n.localize(CONFIG.Item.typeLabels[type!]!)}`, type };
    if (type == "power") {createData["system.improvised.value"] = true;}

    if (category) {createData["system.category.value"] = category;}
    return createData as ItemDataConstructorData;
}

