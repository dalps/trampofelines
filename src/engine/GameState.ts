import { drawTitle } from "../backdrops/Title";
import sfx, { zzfxP } from "../engine/sfx";
import { Basket } from "../entities/Basket";
import { City } from "../entities/City";
import TrampofelineManager from "../entities/Trampofeline";
import type { Tube } from "../entities/Tube";
import { YarnBall } from "../entities/YarnBall";
import { Point } from "../utils/MathUtils";
import { gameoverElements, Stage, titleElements } from "./Stage";
import { drawGameoverUI, drawLives } from "./ui";

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
  volume: true,
};

export interface GameState {
  state: State;
  yarnballs: Map<string, YarnBall>;
  tubes: Tube[];
  baskets: Basket[];
  lives: number;
  score: number;
  settings: typeof settings;
}

export enum State {
  Title,
  Playing,
  GameOver,
}

export function gameOver() {
  switch (GAMESTATE.state) {
    case State.Title:
    case State.Playing:
      drawGameoverUI();
      zzfxP(sfx.gameover);
      gameoverElements.style.display = "block";
      titleElements.style.display = "none";
      TrampofelineManager.disableUI();

      GAMESTATE.state = State.GameOver;
  }
}

export function restart() {
  switch (GAMESTATE.state) {
    case State.Title:
    case State.GameOver:
      GAMESTATE.lives = TOTAL_LIVES;
      GAMESTATE.yarnballs.clear();
      TrampofelineManager.enableUI();
      TrampofelineManager.entities.clear();
      gameoverElements.style.display = "none";
      titleElements.style.display = "none";
      Stage.stage.appendChild(Stage.getLayer("ui"));

      Stage.setActiveLayer("bg");
      // BasketballCourt.draw();
      City.drawBackground();

      drawLives();

      GAMESTATE.state = State.Playing;
  }
}

export function title() {
  switch (GAMESTATE.state) {
    case State.GameOver:
    case State.Title:
      GAMESTATE.lives = TOTAL_LIVES;
      GAMESTATE.yarnballs.clear();
      TrampofelineManager.entities.clear();
      TrampofelineManager.disableUI();
      gameoverElements.style.display = "none";
      titleElements.style.display = "block";

      Stage.clearLayer("game-info");

      drawTitle();

      GAMESTATE.state = State.Title;
    // No transition
  }
}

export function quit() {
  switch (GAMESTATE.state) {
    case State.GameOver:
      title();
  }
}

export const TOTAL_LIVES = 3;
export const GAMESTATE: GameState = {
  state: State.Title,
  yarnballs: new Map(),
  tubes: [],
  baskets: [],
  lives: TOTAL_LIVES,
  score: 0,
  settings,
};
