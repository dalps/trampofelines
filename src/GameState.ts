import type { Tube } from "./entities/Tube";
import type { ElasticLine } from "./lib/ElasticLine";
import type { Ball } from "./lib/Physics2D";
import { Point2 } from "./lib/utils";

export const settings = {
  showJoints: false,
  showForces: false,
  play: true,
  colliderRadius: 20,
  lineMass: 2,
  ballMass: 3,
  ballRadius: 10,
  ballVelocity: new Point2(0, 5),
  gravity: false,
};

export interface GameState {
  balls: Ball[];
  lines: ElasticLine[];
  tubes: Tube[];
  settings: typeof settings;
}

export const GAMESTATE: GameState = {
  balls: [],
  lines: [],
  tubes: [],
  settings,
};
