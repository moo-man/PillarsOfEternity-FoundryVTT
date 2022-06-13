interface ActorHealthSourceData {
  max: number;
  value: number;
  modifier: number;
  death: {
    modifier: number;
  };
  threshold: {
    bloodied: number;
    incap: number;
  };
  wounds: {
    value: number;
  };
}

interface ActorEnduranceSourceData {
  max: number;
  value: number;
  bonus: number;
  penalty: number;
  threshold: {
    winded: number;
  };
}

interface ActorHealthPreparedData extends ActorHealthSourceData {
    bloodied: boolean;
    incap: boolean;
    dead: boolean;
}

interface ActorEndurancePreparedData extends ActorEnduranceSourceData {
    winded: boolean;
    incap: boolean;
}

interface ActorHealthSheetData extends ActorHealthPreparedData {
    array : {state : number}[]
}


interface ActorEnduranceSheetData extends ActorEndurancePreparedData {
    array : {state : number, bonus? : boolean}[]
}