import { getGame } from "../system/utility"
import { PillarsActor } from "../document/actor-pillars"
import { PillarsItem } from "../document/item-pillars"
import { PILLARS } from "../system/config"
import { ActorDataConstructor, ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData"
import actor from "../hooks/actor"

interface CharacterCreationData {
    character: {
        name: string,
        items: { [key: string]: PillarsItem | PillarsItem[] | undefined },
        childhood: {
            setting: string,
            reputation: { xp: number, name: string, placeholder: string }
        },
        data: {
            age: number,
            cp: number,
            xp: {
                free: {
                    used: number,
                    total: number
                }
            },
            source1 : string,
            source2 : string
        },
    },
    foundationPowers : PillarsItem[];
    emptyPowers : undefined[];
}

export default class CharacterCreation extends FormApplication<FormApplicationOptions, CharacterCreationData, undefined>
{
    character: CharacterCreationData["character"] = {
        name: "",
        items: {
            culture: undefined,
            species: undefined,
            stock: undefined,
            godlike: undefined,
            background: [],
            setting: [],
            attribute: [],
            skill: getGame().items!.filter(i => i.type == "skill").sort((a, b) => a.name! > b.name! ? 1 : -1),
            trait: [],
            power : []
        },
        childhood: {
            setting: "",
            reputation: { xp: 0, name: "", placeholder: "" }
        },
        data: {
            age: 0,
            cp: 0,
            xp: {
                free: {
                    used: 0,
                    total: 0
                }
            },
            source1 : "",
            source2 : ""
        },
    }

    static get defaultOptions() {
        let options = super.defaultOptions;
        options.classes = options.classes.concat(["pillar-of-eternity", "character-creation"]);
        options.title = getGame().i18n.localize("PILLARS.CharacterCreation");
        options.template = "systems/pillars-of-eternity/templates/apps/character-creation.hbs";
        options.width = 600;
        options.resizable = true;
        return options;
    }


    async getData() {
        let data = await super.getData();
        (this.character.items.skill as PillarsItem[]).forEach(s => s.prepareData());
        data.character = this.character;
        data.foundationPowers = getGame().items!.filter(i => 
            i.type == "power" && 
            i.system.foundation.value && 
            i.system.source.value && 
            (i.system.source.value == this.character.data.source1 || i.system.source.value == this.character.data.source2) )

        let emptyNum = 4 - ((data.character.items.power as PillarsItem[]).length + data.foundationPowers.length);
        data.emptyPowers = new Array(emptyNum).fill(undefined);
        return data;
    }


    calculateAge() {
        let backgrounds = (this.character.items.background as PillarsItem[])
        let settings = PILLARS.settings;

        let age = 7 * (backgrounds.length + 1);

        if (backgrounds.length > 0) {
            let childhoodSetting = settings[this.character.childhood.setting as keyof typeof settings];
            if (childhoodSetting) {
                let prevTransition = childhoodSetting.transition;
                for (let i = 0; i < backgrounds.length; i++) {
                    let bgSetting = settings[backgrounds[i]?.system.setting.value as keyof typeof settings];
                    if (bgSetting) {
                        let years = 0

                        if (bgSetting.transition == prevTransition)
                            years = 1
                        else if (bgSetting.transition > prevTransition)
                            years = bgSetting.transition

                        backgrounds[i]!.updateSource({"system.years.value" : 7 + years});
                        age += years
                    }
                }
            }
        }
        this.character.data.age = age;
    }

    calculateXP() {
        let backgrounds = (this.character.items.background as PillarsItem[]).map(i => i.system.setting.value)
        let settings = PILLARS.settings;

        let xp = 0

        if (backgrounds.length > 1) {
            let childhoodSetting = settings[this.character.childhood.setting as keyof typeof settings];
            if (childhoodSetting) {
                xp += childhoodSetting.free
                for (let i = 1; i < backgrounds.length; i++) {
                    let bgSetting = settings[backgrounds[i] as keyof typeof settings];
                    if (bgSetting) {
                        xp += bgSetting.free
                    }
                }
            }
        }
        this.character.data.xp.free.total = xp;
        this.character.data.xp.free.used = (this.character.items.skill as PillarsItem[]).reduce((acc, skill) => acc + skill.system.xp.value, 0);
    }

    calculateCP() {
        let backgrounds = (this.character.items.background as PillarsItem[]).map(i => i.system.setting.value)
        let settings = PILLARS.settings;

        if (backgrounds.length > 1 && backgrounds[backgrounds.length - 1]) {
            this.character.data.cp = settings[backgrounds[backgrounds.length - 1] as keyof typeof settings].cp
        }
    }


    async _updateObject(event: Event, formData?: { name: string }): Promise<void> {
        let actorData: {name : string | undefined, type: string | undefined, system: any} = mergeObject({ name: this.character.name, type: "character", system : getGame().system.model.Actor.character  });
        let items: (PillarsItem | Record<string, unknown>)[] = [];
        this.character.items.skill = (this.character.items.skill as PillarsItem[]).filter(i => i.system.xp.value > 0);
        for (let type in this.character.items) {
            items = items.concat(this.character.items[type] || []);
        }

        items = items.concat((this.character.items.background as PillarsItem[]).map(i => {
            let reputation = i.getFlag("pillars-of-eternity", "reputation") as {name : string, xp : number};
            return {
                name: reputation.name, "system.xp.value": reputation.xp, type: "reputation"
            }
        }))

        actorData.system.life.birthYear = getGame().pillars.time.current.year - this.character.data.age;
        actorData.system.life.childhood.setting = this.character.childhood.setting;
        actorData.system.wealth.cp = this.character.data.cp;

        // A flat object seems to destroy most of the system data
        let actor = await Actor.create(expandObject(actorData) as ActorDataConstructorData)
        actor?.createEmbeddedDocuments("Item", (items.filter(i => i)) as Record<string, unknown>[]);
    }


    async _onDropItem(ev: DragEvent) {
        let data = JSON.parse(ev.dataTransfer?.getData("text/plain") as string || "");
        const item = await Item.fromDropData(data);

        if (item && hasProperty(this.character.items, item?.type!)) {
            let existing = getProperty(this.character.items, item?.type!) as PillarsItem[] | PillarsItem | undefined

            if (existing instanceof Array) {
                existing.push(item)
            }
            else {
                this.character.items[item.type] = item
            }
        }
        this.render(true);
    }

    activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);

        new DragDrop({
            dropSelector: "form",
            callbacks: { drop: this._onDropItem.bind(this) }
        }).bind(html[0]!);


        html.find(".actor-property").on("change", this._onChangeProperty.bind(this))
        html.find(".backgrounds select").on("change", this._onChangeSetting.bind(this))
        html.find(".skill-xp").on("change", this._onChangeSkillXP.bind(this))
        html.find(".reputation input").on("change", this._onChangeReputation.bind(this))
        html.find(".source select").on("change", this._onChangePowerSource.bind(this))
    }

    _onChangeProperty(ev: JQuery.ChangeEvent) {
        let name = ev.target.name;
        let value = ev.target.value
        if (Number.isNumeric(value)) {
            value = Number(value);
        }
        setProperty(this.character, name, value);
    }

    _onChangeSetting(ev: JQuery.ChangeEvent) {

        // setting-childhood, setting-0, setting-1, etc
        let index = ev.currentTarget.name.split("-")[1];
        let settings = PILLARS.settings;

        // Change setting, also change/clear reputation if needed
        if (index == "childhood") {
            this.character.childhood.setting = ev.target.value;
            if (this.character.childhood.reputation.placeholder != settings[ev.target.value as keyof typeof settings].reputationLabel) {
                this.character.childhood.reputation = {
                    name: "",
                    placeholder: settings[ev.target.value as keyof typeof settings].reputationLabel,
                    xp: settings[ev.target.value as keyof typeof settings].free
                }
            }
        }
        else {
            let background = (this.character.items.background as PillarsItem[])[index]
            if (background) {
                background.updateSource({ "system.setting.value": ev.target.value })
                let reputation = background.getFlag("pillars-of-eternity", "reputation") as { xp: number, name: string, placeholder: string }

                if (reputation?.placeholder != settings[ev.target.value as keyof typeof settings].reputationLabel) {
                    background.updateSource({
                        "flags.pillars-of-eternity.reputation": {
                            name: "",
                            placeholder: settings[ev.target.value as keyof typeof settings].reputationLabel,
                            xp: settings[ev.target.value as keyof typeof settings].free
                        }
                    })
                }
            }
        }

        this.calculateAge();
        this.calculateCP();
        this.calculateXP();
        this.render(true);
    }

    _onChangeSkillXP(ev: JQuery.ChangeEvent) {
        let element = $(ev.currentTarget).parents(".item")[0]!;

        let index = Number(element.dataset.index);

        let skill = (this.character.items.skill as PillarsItem[])[index];

        if (skill) {
            skill.updateSource({ "system.xp.value": Number(ev.currentTarget.value) })
        }
        this.calculateXP();
        this.render(true);
    }

    _onChangeReputation(ev: JQuery.ChangeEvent) {
        let element = $(ev.currentTarget).parents(".item")[0]!;
        let index = element.dataset.index;
        if (index == "childhood") {
            this.character.childhood.reputation.name = ev.target.value
        }
        else {
            (this.character.items.background as PillarsItem[])[Number(index)]!.updateSource({ "flags.pillars-of-eternity.reputation.name": ev.currentTarget.value });
        }
        this.render(true);
    }

    _onChangePowerSource(ev : JQuery.ChangeEvent) 
    {
        this.character.data[ev.currentTarget.name as ("source1" | "source2")] = ev.currentTarget.value;
        this.render(true);
    }
}