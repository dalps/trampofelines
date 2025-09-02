import type { Ironwool } from "./entities/Ironwool";
import { Trampofeline } from "./entities/Trampofeline";
import type { Tube } from "./entities/Tube";
import type { Ball } from "./lib/Physics2D";
import { Point } from "./lib/MathUtils";

export const settings = {
  showJoints: false,
  showForces: false,
  play: true,
  colliderRadius: 20,
  lineMass: 2,
  ballMass: 3,
  ballRadius: 20,
  ballVelocity: new Point(50, -10),
  gravity: true,
};

export interface GameState {
  balls: Ball[];
  trampolines: Trampofeline[];
  tubes: Tube[];
  enemies: Ironwool[];
  lives: number;
  score: number;
  settings: typeof settings;
}

export const GAMESTATE: GameState = {
  balls: [],
  trampolines: [],
  tubes: [],
  enemies: [],
  lives: 3,
  score: 0,
  settings,
};
