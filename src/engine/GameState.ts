import { BasketManager } from "../entities/Basket";
import TrampofelineManager from "../entities/Trampofeline";
import type { Tube } from "../entities/Tube";
import { YarnBall } from "../entities/YarnBall";
import { City } from "../scenes/City";
import { Title2 } from "../scenes/Title2";
import { clamp } from "../utils/MathUtils";
import { Point } from "../utils/Point";
import { Alert } from "./Alert";
import { CollisionManager } from "./Collisions2D";
import sfx, { zzfxP } from "./sfx";
import { gameoverElements, Stage, titleElements } from "./Stage";
import { drawGameoverUI, drawLives } from "./ui";

export enum State {
  Title,
  Playing,
  GameOver,
}

export const TOTAL_LIVES = 3;
export const MAX_BASKETS = 2;
export const MAX_BALLS = 3;
export const MAX_CATS = 3;
export const SPAWN_RATE = 20;
export const MIN_CAT_LENGTH = 100;
export const BALL_RADIUS = 20;
export const BALL_MASS = 3;
export const LINE_MASS = 2;
export let TRAMPOFELINES: TrampofelineManager;
export let BASKETS: BasketManager;

/**
 * Functions to manage the game state
 */
export default class Game {
  public static state = State.Title;
  public static tubes: Tube[] = [];
  public static lives = TOTAL_LIVES;
  public static stock = 0;
  public static settings = {};

  static init() {
    TRAMPOFELINES = new TrampofelineManager();
    BASKETS = new BasketManager();
  }

  static update() {
    Stage.setActiveLayer("game");
    Stage.clearLayer();

    switch (this.state) {
      case State.Title:
        Title2.draw();
        break;
      case State.GameOver:
      case State.Playing:
        CollisionManager.update();

        Game.tubes.forEach(tube => {
          tube.update();
        });
        BASKETS.update();
        TRAMPOFELINES.update();

        break;
    }
  }

  static gameOver() {
    switch (this.state) {
      case State.Title:
      case State.Playing:
        drawGameoverUI();
        zzfxP(sfx.gameover);
        gameoverElements.style.display = "block";
        titleElements.style.display = "none";
        TRAMPOFELINES.disableUI();

        this.state = State.GameOver;
    }
  }

  static restart() {
    switch (this.state) {
      case State.Title:
      case State.GameOver:
        this.lives = TOTAL_LIVES;
        this.tubes.forEach(t => t.clearEntities());
        TRAMPOFELINES.clearEntities();
        TRAMPOFELINES.enableUI();

        gameoverElements.style.display = "none";
        titleElements.style.display = "none";
        Title2.outro();
        City.draw();
        drawLives();

        this.state = State.Playing;
    }
  }

  static title() {
    switch (this.state) {
      case State.GameOver:
      case State.Title:
        this.lives = TOTAL_LIVES;
        this.tubes.forEach(t => t.clearEntities());
        TRAMPOFELINES.clearEntities();
        TRAMPOFELINES.disableUI();
        gameoverElements.style.display = "none";
        titleElements.style.display = "block";

        City.draw();
        Title2.intro();
        Title2.draw();

        this.state = State.Title;
      // No transition
    }
  }
}
