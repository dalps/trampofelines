import type { Ironwool } from "./entities/Ironwool";
import type { Tube } from "./entities/Tube";
import type { ElasticLine, ElasticShape } from "./lib/ElasticLine";
import type { Ball } from "./lib/Physics2D";
import { Point2 } from "./lib/utils";

export const settings = {
  showJoints: false,
  showForces: true,
  play: true,
  colliderRadius: 20,
  lineMass: 2,
  ballMass: 3,
  ballRadius: 20,
  ballVelocity: new Point2(50, -10),
  gravity: true,
};

export interface GameState {
  balls: Ball[];
  lines: ElasticShape[];
  tubes: Tube[];
  enemies: Ironwool[];
  settings: typeof settings;
}

export const GAMESTATE: GameState = {
  balls: [],
  lines: [],
  tubes: [],
  enemies: [],
  settings,
};
