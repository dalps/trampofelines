import { YarnBall } from "../entities/YarnBall";
import { star } from "../utils/CanvasUtils";
import { Point } from "../utils/MathUtils";
import palette from "./color";
import { drawText } from "./font";
import Game from "./GameState";
import { Stage } from "./Stage";

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
  for (let i = 0; i < Game.TOTAL_LIVES - Game.lives; i++) {
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
  for (let i = 0; i < Game.lives; i++) {
    YarnBall.drawYarnball(pos.add(center), {
      radius,
      color: palette.fuchsia,
      lineWidth: 2,
      decoration: true,
    });

    pos.incrX(sectionSize);
  }

  drawText(`score ${Game.score}`, {
    pos: new Point(cw * 0.5, 100),
  });
}

export function drawGameoverUI() {
  Stage.setActiveLayer("game-info");
  const { ctx, cw, ch } = Stage;

  ctx.fillStyle = palette.black.toAlpha(0.5);
  ctx.fillRect(0, 0, cw, ch);

  ctx.lineWidth = 3;
  drawText(`game over!`, {
    pos: new Point(cw * 0.5, ch * 0.5 - 200),
    fill: palette.blue3,
    stroke: palette.blue0,
    fontSize: 80,
  });

  drawText(`you rescued ${Game.score} yarn balls`, {
    pos: new Point(cw * 0.5, ch * 0.5 - 100),
  });
}
