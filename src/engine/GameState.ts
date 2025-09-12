import { Basket, BasketManager } from "../entities/Basket";
import TrampofelineManager from "../entities/Trampofeline";
import type { Tube } from "../entities/Tube";
import { YarnBall } from "../entities/YarnBall";
import { City } from "../scenes/City";
import sfx, { zzfxP } from "./sfx";
import { Title2 } from "../scenes/Title2";
import { CollisionManager } from "./Collisions2D";
import { gameoverElements, Stage, titleElements } from "./Stage";
import { drawGameoverUI, drawLives } from "./ui";
import { Alert } from "./Alert";
import { Point } from "../utils/Point";
import { clamp } from "../utils/MathUtils";

export enum State {
  Title,
  Playing,
  GameOver,
}

export const TOTAL_LIVES = 3;
export const MAX_BASKETS = 2;

/**
 * Functions to manage the game state
 */
export default class Game {
  public static state = State.Title;
  public static yarnballs: Map<string, YarnBall> = new Map();
  public static tubes: Tube[] = [];
  public static lives = TOTAL_LIVES;
  public static stock = 0;
  public static settings = {
    lineMass: 2,
    ballMass: 3,
    ballRadius: 20,
    colliderRadius: 20,
    volume: 0,
  };

  static update() {
    switch (this.state) {
      case State.Title:
        Stage.setActiveLayer("game");
        Stage.clearLayer();
        Title2.draw();
        break;
      case State.GameOver:
      case State.Playing:
        Stage.setActiveLayer("game");
        Stage.clearLayer();

        const { cw, ch } = Stage;

        Game.tubes.forEach(tube => tube.draw());
        BasketManager.update();

        Game.yarnballs.forEach((b, i) => {
          const threadEndPos = b.thread.at(-1).position;
          if (threadEndPos.y > ch) {
            new Alert(
              new Point(clamp(70, cw - 70, b.position.x), ch),
              `missed ${TOTAL_LIVES - Game.lives + 1}`,
              {
                startRadius: 0,
                finalRadius: 50,
                finalTransparency: 1,
              }
            );

            b.die();

            if (Game.state === State.Playing) {
              zzfxP(sfx.drop);
              drawLives();
            }

            Game.lives = Math.max(0, Game.lives - 1);
            Game.lives <= 0 && Game.gameOver();

            return;
          }

          const threshold = b.radius * 0.5;
          if (b.position.x - threshold < 0 || b.position.x + threshold > cw) {
            b.velocity.x *= -1.1;
          }

          b.update();
          b.draw();
        });

        CollisionManager.update();

        TrampofelineManager.trampolines.forEach(l => {
          l.update();
          l.draw();
        });

        TrampofelineManager.drawGuides();

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
        TrampofelineManager.disableUI();

        this.state = State.GameOver;
    }
  }

  static restart() {
    switch (this.state) {
      case State.Title:
      case State.GameOver:
        this.lives = TOTAL_LIVES;
        this.yarnballs.forEach(v => v.die());
        this.yarnballs.clear();

        TrampofelineManager.clearEntities();
        TrampofelineManager.enableUI();

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
        this.yarnballs.clear();
        TrampofelineManager.clearEntities();
        TrampofelineManager.disableUI();
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
