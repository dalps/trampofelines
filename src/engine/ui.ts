import { YarnBall } from "../entities/YarnBall";
import { star } from "../utils/CanvasUtils";
import { Point } from "../utils/MathUtils";
import { engrave } from "./font";
import { GAMESTATE, TOTAL_LIVES } from "./GameState";
import { Stage } from "./Stage";
import palette from "./color";

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

  ctx.fillStyle = palette.black.clone().setAlpha(0.5);
  ctx.fillRect(0, 0, cw, ch);

  {
    ctx.save();
    ctx.fillStyle = palette.blue3;
    ctx.strokeStyle = palette.blue0;
    ctx.lineWidth = 3;
    const { path, length } = engrave(`game over!`);

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
}
