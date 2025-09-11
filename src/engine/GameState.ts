import sfx, { zzfxP } from "./sfx";
import { Basket } from "../entities/Basket";
import TrampofelineManager from "../entities/Trampofeline";
import type { Tube } from "../entities/Tube";
import { YarnBall } from "../entities/YarnBall";
import { City } from "../scenes/City";

import { CollisionManager } from "./Collisions2D";
import { gameoverElements, Stage, titleElements } from "./Stage";
import { drawGameoverUI, drawLives } from "./ui";
import { Title2 } from "../scenes/Title2";

export enum State {
  Title,
  Playing,
  GameOver,
}

/**
 * Functions to manage the game state
 */
export default class Game {
  public static TOTAL_LIVES = 3;
  public static state = State.Title;
  public static yarnballs: Map<string, YarnBall> = new Map();
  public static tubes: Tube[] = [];
  public static baskets: Basket[] = [];
  public static lives = this.TOTAL_LIVES;
  public static score = 0;
  public static settings = {
    showJoints: false,
    showForces: false,
    lineMass: 2,
    ballMass: 3,
    ballRadius: 20,
    colliderRadius: 20,
    gravity: true,
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

        City.update();

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
        this.lives = this.TOTAL_LIVES;
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
        this.lives = this.TOTAL_LIVES;
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

  static quit() {
    switch (this.state) {
      case State.GameOver:
        this.title();
    }
  }
}
