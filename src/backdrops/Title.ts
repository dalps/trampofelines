import { Palette } from "../engine/Color";
import { engrave } from "../engine/font";
import { Stage } from "../engine/Stage";
import { YarnBall } from "../entities/YarnBall";
import { circle, star } from "../utils/CanvasUtils";
import { distribute, Point } from "../utils/MathUtils";
import { Clock } from "../utils/TimeUtils";

export function toranporin(position: Point, { color = Palette.colors.blue0 }) {
  Stage.setActiveLayer("game");
  const { ctx } = Stage;

  const text = "猫のトランポリン";
  const textSize = 48;

  ctx.font = `${textSize}px sans-serif`;
  ctx.textBaseline = "ideographic";

  ctx.fillStyle = color;
  ctx.fillText(text, position.x, position.y + 48);

  // ctx.strokeStyle = Palette.colors.blue1;
  // ctx.strokeText(text, 0, 48);
}

export function drawTitle() {
  Stage.setActiveLayer("game");
  const { ctx, cw, ch } = Stage;
  const { time } = Clock;
  const { white, blue0, blue1, blue2, blue3 } = Palette.colors;

  ctx.fillStyle = blue1;
  ctx.fillRect(0, 0, cw, ch);

  // draw black bars
  const w = cw * 0.5;
  const h = w * 0.5;
  ctx.fillStyle = blue0.toString();

  // ctx.translate(cw * 0.5, ch * 0.5);
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(0, h);
  ctx.moveTo(cw - w, ch);
  ctx.lineTo(cw, ch - h);
  ctx.lineTo(cw, ch);
  ctx.fill();

  let c1 = new Point(0, ch);
  let c2 = new Point(cw, 0);

  ctx.fillStyle = blue0;
  ctx.strokeStyle = blue0;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  [c1, c2].forEach((c, i) =>
    star(c, {
      outerRadius: 200,
      innerRadius: 400,
      angle: 0.01 * time,
      cb: (p, j) => {
        const even = j % 2 === 0;
        star(p, {
          points: even ? 5 : 4,
          innerRadius: even ? 20 : 10,
          outerRadius: even ? 40 : 20,
          angle: (even ? 1 : -1) * 0.05 * time,
        });
        ctx.closePath();
        even && ctx.fill();
        !even && ctx.stroke();
      },
    })
  );

  c1 = new Point(cw * 0.5 - 150, ch * 0.35);
  c2 = new Point(cw * 0.5 + 150, ch * 0.45);

  ctx.fillStyle = blue3;
  ctx.strokeStyle = white;

  [c1, c2].forEach((c, i) =>
    star(c, {
      outerRadius: 100,
      innerRadius: 100,
      angle: (i % 2 === 0 ? -1 : 1) * 0.05 * time,
      cb: (p, j) => {
        star(p, { angle: (i % 2 === 0 ? -1 : 1) * 0.3 * time });
        ctx.closePath();
        j % 2 === 0 && ctx.fill();
        j % 2 === 1 && ctx.stroke();
      },
    })
  );

  ctx.fillStyle = blue0;
  circle(c1, 80);
  ctx.fill();
  circle(c2, 80);
  ctx.fill();

  const c = new Point(cw * 0.5, ch * 0.4);
  YarnBall.drawYarnball(c, {
    radius: 150,
    color: blue0.clone(),
    lineWidth: 15,
    rotation: time * 2,
  });

  ctx.fillStyle = white;
  ctx.strokeStyle = blue2;
  ctx.lineWidth = 2;
  const textScale = 1;
  const originalTextSize = 100;
  const pos = new Point(
    cw * 0.5 - originalTextSize * (textScale * 0.5),
    ch * 0.5 - 65
  );

  [
    ["trampo", 50, -65],
    ["felines", 50, 25],
  ].forEach(([t, dx, dy]: [string, number, number]) => {
    const p = new Path2D();
    const { path, length } = engrave(t);
    p.addPath(
      path,
      new DOMMatrix([
        textScale,
        -0.2,
        0,
        textScale,
        pos.x - length * 0.5 + dx,
        pos.y + dy,
      ])
    );
    ctx.fill(p);
    ctx.stroke(p);
  });

  const catSize = 50;
  const subs = Math.ceil(Math.hypot(w, h) / catSize) + 5;
  const l = catSize * subs;
  const min = -l;
  const max = l;
  const angle = Math.atan2(-h, w);

  ctx.save();
  ctx.scale(1.2, 1.2);
  ctx.rotate(angle);
  toranporin(new Point(min + ((time * 10) % (max - min)), h * 0.5), {
    color: blue1,
  });

  distribute(min, max, subs, (n) => {
    const x = min + ((n + time * 3) % (max - min));
    const y = h * 0.4;
    ctx.drawImage(Stage.getLayer("catFace"), x + 25, y);
  });
  ctx.restore();

  ctx.save();
  ctx.translate(cw, ch);
  ctx.scale(1.2, 1.2);
  ctx.rotate(Math.PI + angle);
  toranporin(new Point(min + ((time * 10) % (max - min)), h * 0.5), {
    color: blue1,
  });
  distribute(min, max, subs, (n) => {
    const x = min + ((n + time * 3) % (max - min));
    const y = h * 0.4;
    ctx.drawImage(Stage.getLayer("catFace"), x + 25, y);
  });
  ctx.restore();
}
