import { PillarsActor } from "../module/document/actor-pillars";

export interface Accommodation {
    id : string,
    prepared : false,
    spaceId : string,
    occupantIds : string[],
    occupants? : PillarsActor[]
}