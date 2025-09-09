import { Point } from "../utils/MathUtils";

export interface Scene {
  goal: Point;
  enemies: Point[];
  tubes: Point[];
  yarnBallsToRescue: number;
  draw: Function;
  drawBackground: Function;
  init: Function;
}

export const LEVELS: Scene[] = [
  // TODO: design some levels
];
