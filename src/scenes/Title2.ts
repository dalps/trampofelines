import palette from "../engine/color";
import { Firework } from "../engine/Firework";
import { engrave } from "../engine/font";
import { Stage } from "../engine/Stage";
import { Tween } from "../engine/tween";
import { Point } from "../utils/MathUtils";
import { Clock } from "../utils/TimeUtils";

export class Title2 {
  static vignette: number = 0;
  static trampoPos: Point = new Point(-5000, 300);
  static felinesPos: Point = new Point(5000, 300);
  static skew: number;

  static init() {}

  static intro() {
    const { ctx, cw, ch } = Stage;

    new Firework(new Point(cw * 0.3, ch * 0.5), {
      ctx: Stage.getLayer("game-info").ctx,
      startRadius: 5,
      finalRadius: 100,
      speed: 1,
    });
    new Firework(new Point(cw * 0.5, ch * 0.3), {
      ctx: Stage.getLayer("game-info").ctx,
      startRadius: 5,
      finalRadius: 100,
      speed: 1,
    });
    new Firework(new Point(cw * 0.7, ch * 0.4), {
      ctx: Stage.getLayer("game-info").ctx,
      startRadius: 5,
      finalRadius: 100,
      speed: 1,
    });
    new Tween(this, "vignette", {
      finalValue: 0.5,
      speed: 0.7,
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
    Stage.setActiveLayer("game");

    const { ctx, cw, ch } = Stage;
    const { time } = Clock;
    const { white, blue0, blue1, blue2, blue3 } = palette;

    ctx.fillStyle = palette.black.toAlpha(this.vignette);
    ctx.fillRect(0, 0, cw, ch);

    // rotating stars
    {
      const c1 = new Point(cw * 0.5 - 150, ch * 0.35);
      const c2 = new Point(cw * 0.5 + 150, ch * 0.45);
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
