export interface PillarsTurn extends CombatTracker.Turn {
  move?: {
    running: boolean;
    counter: number;
    stride: number;
  };
}
