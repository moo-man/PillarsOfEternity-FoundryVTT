import { SeasonalActivityResult } from "../../../types/seasonal-activities";
import { PillarsActor } from "../../document/actor-pillars";

export abstract class StudyActivity 
{
  abstract actor: PillarsActor;
  abstract status: Record<string, string>
  abstract text: Record<string, string>
  xp  = 0;

  abstract getSubmitData(xp?: number) : Promise<SeasonalActivityResult>

  abstract evaluate() : number


}
