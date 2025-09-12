import { BasketManager } from "../entities/Basket";
import TrampofelineManager from "../entities/Trampofeline";
import type { Tube } from "../entities/Tube";
import { YarnBall, YarnBallManager } from "../entities/YarnBall";
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
export let YARNBALLS: YarnBallManager;

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
    YARNBALLS = new YarnBallManager();
  }

  static update() {
    Stage.setActiveLayer("game");
    Stage.clearLayer();

    switch (this.state) {
      case State.Title:
        Title2.draw();
      case State.GameOver:
      case State.Playing:
        const { cw, ch } = Stage;

        CollisionManager.update();

        Game.tubes.forEach(tube => {
          tube.update();
        });
        BASKETS.update();
        TRAMPOFELINES.update();

        YARNBALLS.list.forEach(b => {
          const threadEndPos = b.thread.at(-1).position;

          if (threadEndPos.y > ch) {
            if (Game.state === State.Playing) {
              zzfxP(sfx.drop);
              b.die();

              Game.lives = Math.max(0, Game.lives - 1);
              drawLives();
              Game.lives <= 0 && Game.gameOver();

              new Alert(
                new Point(clamp(70, cw - 70, b.position.x), ch),
                `missed ${TOTAL_LIVES - Game.lives}`,
                {
                  startRadius: 0,
                  finalRadius: 50,
                  finalTransparency: 1,
                }
              );
            }
          }

          const threshold = b.radius * 0.5;
          if (b.position.x - threshold < 0 || b.position.x + threshold > cw) {
            b.velocity.x *= -1.1;
          }

          b.update();
        });

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
        YARNBALLS.clearEntities();
        TRAMPOFELINES.clearEntities();
        BASKETS.outro();
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

        YARNBALLS.clearEntities();
        TRAMPOFELINES.clearEntities();
        TRAMPOFELINES.disableUI();
        BASKETS.outro();
        gameoverElements.style.display = "none";
        titleElements.style.display = "block";

        Stage.clearLayer("info");
        City.draw();
        Title2.intro();
        Title2.draw();

        this.state = State.Title;
    }
  }
}
