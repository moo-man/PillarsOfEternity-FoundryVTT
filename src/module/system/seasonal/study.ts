import { getGame } from "../../system/utility";
import { hasXPData, ItemType } from '../../../types/common';
import { SeasonalActivityResult } from '../../../types/seasonal-activities';
import { PillarsActor } from '../../actor/actor-pillars';
import { PillarsItem } from '../../item/item-pillars';
import { PILLARS } from '../config';

export abstract class StudyActivity {
  abstract actor: PillarsActor;
  abstract status: Record<string, string>
  abstract text: Record<string, string>
  xp : number = 0;

  abstract getSubmitData(xp?: number) : Promise<SeasonalActivityResult>

  abstract evaluate() : number


}
