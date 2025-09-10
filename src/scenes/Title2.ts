import palette from "../engine/color";
import { drawText, engrave } from "../engine/font";
import { Stage } from "../engine/Stage";
import { Tween } from "../engine/tween";
import { YarnBall } from "../entities/YarnBall";
import { circle, star } from "../utils/CanvasUtils";
import { distribute, Point } from "../utils/MathUtils";
import { Clock } from "../utils/TimeUtils";

export class Title2 {
  static vignette: number = 0;
  static trampoPos: Point = new Point(-5000, 300);
  static felinesPos: Point = new Point(5000, 300);
  static skew: number;

  static init() {}

  static intro() {
    const { ctx, cw, ch } = Stage;

    new Tween(this, "vignette", {
      finalValue: 0.5,
      speed: 0.7
    });
    new Tween(this.trampoPos, "x", {
      finalValue: cw * 0.5,
    });
    new Tween(this.felinesPos, "x", {
      finalValue: cw * 0.5,
    });
    new Tween(this, "skew", {
      startValue: 50,
      finalValue: -0.2,
    });
  }
  
  static outro() {
    const { ctx, cw, ch } = Stage;
    
    new Tween(this, "vignette", {
      finalValue: 0,
    });
    new Tween(this.trampoPos, "x", {
      finalValue: cw * 2,
    });
    new Tween(this.felinesPos, "x", {
      finalValue: -cw * 2,
    });
  }

  static draw() {
    console.log(this.vignette)
    Stage.setActiveLayer("game");
    const { ctx, cw, ch } = Stage;
    const { time } = Clock;
    const { white, blue0, blue1, blue2, blue3 } = palette;

    Stage.clearLayer();

    ctx.fillStyle = palette.black.toAlpha(this.vignette);
    ctx.fillRect(0, 0, cw, ch);

    // rotating stars
    {
      const c1 = new Point(cw * 0.5 - 150, ch * 0.35);
      const c2 = new Point(cw * 0.5 + 150, ch * 0.45);

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
    }

    ctx.fillStyle = palette.white;
    ctx.strokeStyle = palette.blue2;
    ctx.lineWidth = 2;
    const textScale = 1;
    const originalTextSize = 100;
    const pos = new Point(
      this.trampoPos.x - originalTextSize * (textScale * 0.5),
      this.trampoPos.y - 65
    );

    [
      ["trampo", this.trampoPos, -40],
      ["felines!", this.felinesPos, 50],
    ].forEach(([t, pos, dy]: [string, Point, number], i) => {
      const p = new Path2D();
      const { path, length } = engrave(t);
      p.addPath(
        path,
        new DOMMatrix([
          textScale,
          this.skew,
          this.skew,
          textScale,
          pos.x - length * 0.5,
          pos.y + dy,
        ])
      );
      ctx.fill(p);
      ctx.stroke(p);
    });
  }
}
