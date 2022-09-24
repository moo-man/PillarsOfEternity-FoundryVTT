import { getGame } from "../../system/utility";
import { hasXPData, ItemType } from '../../../types/common';
import { SeasonalActivityResult } from '../../../types/seasonal-activities';
import { PillarsActor } from '../../actor/actor-pillars';
import { PillarsItem } from '../../item/item-pillars';
import { PILLARS } from '../config';
import { PILLARS_UTILITY } from '../utility';
import { StudyActivity } from './study';

export class StudyTeacherActivity extends StudyActivity{
  actor: PillarsActor;
  teacher : PillarsActor;
  skill? : string;
  
  status={};
  
  text: {
    skillMinimum: string,
    skillMaximum: string,
  } = {
    skillMinimum: "",
    skillMaximum: ""
  };

  _raiseMinimum : number = 0; 
  _skillMaximum : number = 0
  _students : number = 1;


  constructor(actor: PillarsActor, teacher : PillarsActor, skill? : string) {
    super();
    this.actor = actor;
    this.teacher = teacher;
    this.skill = skill
    this.evaluate();
  }

  async getSubmitData(xp?: number) {
    let result = <SeasonalActivityResult>{};

    
    if (!this.skill)
    {
      throw new Error("Cannot submit activity without selected skill")
    }

    xp = xp || this.xp
    let skill = (await PILLARS_UTILITY.findSkillName(this.skill, this.actor))?.toObject()
    if (skill && hasXPData(skill))
    {
      skill.data.xp.value += xp;
      result.text = `Study (Teacher: ${this.teacher.name}): +${xp} ${skill.name}`
      result.data = {items : [skill]}
    }
    return result
  }

  set raiseMinimum(value : number) {
    if (value > this.skillMaximum)
      value = this.skillMaximum
    this._raiseMinimum = value
    this.evaluate();
  }
  set skillMaximum(value : number) {
    this._skillMaximum = value
    if(this._raiseMinimum > value)
      this._raiseMinimum = value
    this.evaluate();
  }
  set students(value : number) {
    this._students = value
    this.evaluate();
  }
  
  get raiseMinimum() {
    return this._raiseMinimum
  }
  get skillMaximum() {
    return this._skillMaximum || this.teacherSkill?.rank || 0
  }
  get students() {
    return this._students
  }

  get skillMinimum() {
    return Math.max(0, this.skillMaximum - this.teachingSkill + this.raiseMinimum)
  }

  get raiseRange() {
    return (this.teacherSkill?.rank || 0) - (this._skillMaximum)
  }

  get teacherSkill()
  {
    if (this.skill)
      return this.teacher.getItemTypes(ItemType.skill).find(i => i.name == this.skill)
  }

  get teachingSkill() {
    return this.teacher.getItemTypes(ItemType.skill).find(i => i.name == "Teaching")?.rank || 0
  }

  setSkill(skill : string)
  {
    this.skill = skill;
    this.evaluate();
  }

  evaluate() {

    let game = getGame();
    let teacherSkill = this.teacherSkill;
    let studentSkill = this.actor.getItemTypes(ItemType.skill).find(i => i.name == this.skill)?.rank || 0
    let xp = 0;

    if (teacherSkill?.rank) {
      
      
      this.text.skillMinimum = studentSkill < this.skillMinimum ? game.i18n.localize("PILLARS.SkillMinimumNotMet") : ""
      this.text.skillMaximum =  studentSkill > this.skillMaximum ? game.i18n.localize("PILLARS.SkillMaximumExceeded") : ""

      if (this.students <= 10)
        xp += 3
      if (this.students <= 6)
        xp += 3
      if (this.students <= 3)
        xp += 3
      if (this.students == 1)
        xp += 3

      this.xp = Math.min(12, xp + this.raiseMinimum);
      return this.xp
    }

    console.log(this.skillMinimum, this.skillMaximum, this.raiseMinimum)
    return xp
  }
}
