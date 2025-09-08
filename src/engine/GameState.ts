import { drawTitle } from "../backdrops/Title";
import sfx, { zzfxP } from "../engine/sfx";
import { Basket } from "../entities/Basket";
import { City } from "../entities/City";
import TrampofelineManager from "../entities/Trampofeline";
import type { Tube } from "../entities/Tube";
import { YarnBall } from "../entities/YarnBall";
import { star } from "../utils/CanvasUtils";
import { Point } from "../utils/MathUtils";
import palette from "./color";
import { drawText, engrave } from "./font";
import { gameoverElements, Stage, titleElements } from "./Stage";

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
  balls: Map<string, YarnBall>;
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
      GAMESTATE.balls.clear();
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
      GAMESTATE.balls.clear();
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

const TOTAL_LIVES = 3;
export const GAMESTATE: GameState = {
  state: State.Title,
  balls: new Map(),
  tubes: [],
  baskets: [],
  lives: TOTAL_LIVES,
  score: 0,
  settings,
};

export function drawLives() {
  Stage.setActiveLayer("game-info");
  Stage.clearLayer("game-info");
  const { ctx, cw } = Stage;

  const sectionSize = 55;
  const radius = 20;
  const pos = new Point(cw * 0.5 - 1.5 * sectionSize, 20);
  const center = new Point(sectionSize * 0.5, sectionSize * 0.5);

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (let i = 0; i < TOTAL_LIVES - GAMESTATE.lives; i++) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 8;
    star(pos.add(center), {
      points: 4,
      innerRadius: 0,
      outerRadius: 18,
      angle: Math.PI / 4,
    });
    ctx.stroke();

    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    star(pos.add(center), {
      points: 4,
      innerRadius: 0,
      outerRadius: 18,
      angle: Math.PI / 4,
    });
    ctx.stroke();

    pos.incrX(sectionSize);
  }

  // const colors = ["fuchsia", "chartreuse", "coral"]
  for (let i = 0; i < GAMESTATE.lives; i++) {
    YarnBall.drawYarnball(pos.add(center), {
      radius,
      color: palette.fuchsia,
      lineWidth: 2,
      decoration: true,
    });

    pos.incrX(sectionSize);
  }

  // Print the score
  {
    const { path, length } = engrave(`Rescued ${GAMESTATE.score}`);
    ctx.fillStyle = palette.white;
    ctx.save();
    ctx.translate(cw - 20 - length * 0.5, 48);
    ctx.scale(0.2, 0.2);
    ctx.fill(path);
    ctx.restore();
  }
}

export function drawGameoverUI() {
  Stage.setActiveLayer("game-info");
  const { ctx, cw, ch } = Stage;

  ctx.fillStyle = "#0000007f";
  ctx.fillRect(0, 0, cw, ch);

  {
    ctx.save();
    ctx.fillStyle = palette.blue3;
    ctx.strokeStyle = palette.blue0;
    ctx.lineWidth = 3;
    const { path, length } = engrave(`game over`);

    ctx.translate(cw * 0.5 - length * 0.5, ch * 0.5 - 200);
    ctx.fill(path);
    ctx.stroke(path);
    ctx.restore();
  }

  ctx.fillStyle = palette.white;

  {
    ctx.save();
    const { path, length } = engrave(
      `you rescued ${GAMESTATE.score} yarn balls`
    );
    const scale = 0.2;
    ctx.translate(cw * 0.5 - length * 0.5 * scale, ch * 0.5 - 100);
    ctx.scale(scale, scale);
    ctx.fill(path);
    ctx.restore();
  }

  ["retry", "quit"].forEach((t, i) => {
    ctx.save();
    const { path, length } = engrave(t);
    const scale = 0.3;
    ctx.translate(cw * 0.5 - length * 0.5 * scale, ch * 0.5 + i * 50);
    ctx.scale(scale, scale);
    ctx.fill(path);
    ctx.restore();
  });
}
