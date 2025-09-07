import { drawTitle } from "../backdrops/Title";
import { Basket } from "../entities/Basket";
import TrampofelineManager from "../entities/Trampofeline";
import type { Tube } from "../entities/Tube";
import { YarnBall } from "../entities/YarnBall";
import { star } from "./CanvasUtils";
import { Palette } from "./Color";
import { Point } from "./MathUtils";
import sfx from "./sfx";
import { gameoverElements, Stage, titleElements } from "./Stage";
import { zzfxP } from "./zzfx";

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
  basket?: Basket;
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
    case State.Playing:
      drawGameoverUI();
      zzfxP(sfx.gameover);
      gameoverElements.style.display = "block";
      titleElements.style.display = "none";

      GAMESTATE.state = State.GameOver;
  }
}

export function restart() {
  switch (GAMESTATE.state) {
    case State.Title:
    case State.GameOver:
      GAMESTATE.lives = TOTAL_LIVES;
      GAMESTATE.balls.clear();
      TrampofelineManager.entities.clear();
      gameoverElements.style.display = "none";
      titleElements.style.display = "none";

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
      gameoverElements.style.display = "none";
      titleElements.style.display = "block";

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
  lives: TOTAL_LIVES,
  score: 0,
  settings,
};

export function drawLives() {
  Stage.setActiveLayer("ui");
  const { ctx, cw, ch } = Stage;

  ctx.clearRect(0, 0, cw, ch);

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
      color: Palette.colors.fuchsia,
      lineWidth: 2,
      decoration: true,
    });

    pos.incrX(sectionSize);
  }

  // Print the score
  const score = `Rescued: ${GAMESTATE.score}`;
  ctx.font = `24px ${FONT}`;
  ctx.fillStyle = "black";
  ctx.textAlign = "right";
  ctx.fillText(score, cw - 20, 48);
}

export const FONT = "Roboto,tsans-serif";

export function drawGameoverUI() {
  Stage.setActiveLayer("ui");
  const { ctx, cw, ch } = Stage;

  ctx.fillStyle = "#0000007f";
  ctx.fillRect(0, 0, cw, ch);

  const gameOver = new Path2D(
    `M 6.3 8.2  L 6.3 7.7  L 5.4 7.7  L 5.4 5  L 9.7 5  L 9.7 10.9  L 7.5 11.5  L 5.3 11.7  L 2.8 11.3  L 1.1 10.2  L 0.3 8.4  L 0.1 5.9  L 0.3 3.4  L 1.2 1.6  L 1.9 0.9  L 2.9 0.5  L 5.7 0.1  L 7.5 0.2  L 9.1 0.5  L 8.6 3.3  L 6 3  L 4.4 3.2  L 3.9 3.9  L 3.9 8.9  L 5.1 8.9  L 6 8.8  L 6.3 8.2  L 6.3 8.2    M 14.4 11.4  L 10.7 11.4  L 13.6 0.4  L 19.1 0.4  L 21.9 11.4  L 18.2 11.4  L 17.8 9.7  L 14.9 9.7  L 14.4 11.4    M 16.2 3.7  L 15.5 6.8  L 17.1 6.8  L 16.4 3.8  L 16.2 3.7    M 26.4 11.4  L 22.7 11.4  L 23.4 0.4  L 28 0.4  L 29.4 6  L 29.5 6  L 30.9 0.4  L 35.5 0.4  L 36.2 11.4  L 32.5 11.4  L 32.3 6.1  L 32.2 6.1  L 30.8 11.4  L 28.1 11.4  L 26.7 6.1  L 26.6 6.1  L 26.4 11.4    M 45.1 7.3  L 41.6 7.3  L 41.6 8.6  L 45.9 8.6  L 45.9 11.4  L 38 11.4  L 38 0.4  L 45.8 0.4  L 45.4 3.2  L 41.6 3.2  L 41.6 4.7  L 45.1 4.7  L 45.1 7.3    M 51 6  L 51.3 3.4  L 52.1 1.6  L 53.7 0.6  L 56.2 0.2  L 58.7 0.6  L 60.3 1.6  L 61.1 3.4  L 61.4 6  L 61.2 8.5  L 60.4 10.3  L 59.7 11  L 58.8 11.4  L 56.2 11.8  L 53.6 11.4  L 52 10.3  L 51.2 8.5  L 51 6  L 51 6    M 54.8 4.2  L 54.8 8.8  L 56.3 8.8  L 57.3 8.6  L 57.6 7.8  L 57.6 3.1  L 56.1 3.1  L 55.1 3.3  L 54.8 4.1  L 54.8 4.2    M 69.3 0.4  L 73 0.4  L 70.3 11.4  L 65.1 11.4  L 62.4 0.4  L 66.1 0.4  L 67.6 7.4  L 67.8 7.4  L 69.3 0.4    M 81.5 7.3  L 78 7.3  L 78 8.6  L 82.3 8.6  L 82.3 11.4  L 74.5 11.4  L 74.5 0.4  L 82.3 0.4  L 81.8 3.2  L 78 3.2  L 78 4.7  L 81.5 4.7  L 81.5 7.3    M 94 11.4  L 90.1 11.4  L 88.7 8.1  L 87.9 8.1  L 87.9 11.4  L 84.4 11.4  L 84.4 0.4  L 90 0.4  L 91.7 0.6  L 92.8 1.4  L 93.6 2.6  L 93.8 4.3  L 93.4 6.5  L 92.9 7.3  L 92.2 7.8  L 94 11.4    M 87.9 3.2  L 87.9 5.4  L 88.7 5.4  L 89.6 5.3  L 89.9 4.7  L 89.9 3.9  L 89.6 3.3  L 88.7 3.2  L 87.9 3.2    M 99.3 8.4  L 96.4 8.4  L 95.8 0.8  L 96 0.4  L 96.5 0.3  L 99.3 0.3  L 99.8 0.4  L 100 0.8  L 99.3 8.4    M 96.2 11.2  L 95.8 10.1  L 96.2 9  L 97.8 8.7  L 99.4 9  L 99.8 10.1  L 99.4 11.2  L 97.8 11.5  L 96.2 11.2  L 96.2 11.2`
  );
  const gameOver2 = `All the yarn balls dropped into the void :(`;
  const score = `Rescued: ${GAMESTATE.score}`;

  ctx.fillStyle = "#c4de69ff";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#5a7bffff";
  ctx.textAlign = "center";
  ctx.font = `48px ${FONT}`;

  ctx.save();
  ctx.translate(cw * 0.5 - 250, ch * 0.5 - 200);
  ctx.scale(5, 5);
  ctx.stroke(gameOver);
  ctx.fill(gameOver);
  ctx.restore();

  ctx.font = `28px ${FONT}`;
  ctx.fillText(gameOver2, cw * 0.5, ch * 0.5 - 50);

  ctx.fillStyle = "#fff";
  ctx.font = `36px ${FONT}`;
  ctx.fillText(score, cw * 0.5, ch * 0.5);
}
