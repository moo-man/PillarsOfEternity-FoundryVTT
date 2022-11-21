
export enum Season {
    SPRING,
    SUMMER,
    AUTUMN,
    WINTER
  }

export interface Time {
    season : Season,
    year : number
  }
  
  export interface TimeSettingData extends Time { 
    context? : TimeContextData
  }
  
  export interface TimeContextData {
    latest? : boolean
    adventure? : {
      name? : string,
      experience? : number
    }
  }