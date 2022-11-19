import { PillarsActor } from "../module/actor/actor-pillars";

export interface Accommodation {
    id : string,
    prepared : false,
    spaceId : string,
    occupantIds : string[],
    occupants? : PillarsActor[]
}