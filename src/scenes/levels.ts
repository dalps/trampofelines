import { Point } from "../utils/MathUtils";

export interface Level {
  goal: Point;
  enemies: Point[];
  tubes: Point[];
  yarnBallsToRescue: number;
  draw: Function;
  drawBackground: Function;
  init: Function;
}

export const LEVELS: Level[] = [
  // TODO: design some levels
];
