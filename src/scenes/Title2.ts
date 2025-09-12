import palette from "../engine/color";
import { Firework } from "../engine/Firework";
import { engrave } from "../engine/font";
import { Stage } from "../engine/Stage";
import { Tween } from "../engine/tween";
import { clamp, lerp } from "../utils/MathUtils";
import { Point } from "../utils/Point";
import { Clock } from "../utils/TimeUtils";

export class Title2 {
  static vignette: number = 0;
  static trampoPos: Point = new Point(-1000, 300);
  static felinesPos: Point = new Point(1000, 300);
  static skew: number;

  static init() {}

  static intro() {
    const { ctx, cw, ch } = Stage;

    new Firework(new Point(cw * 0.3, ch * 0.5), {
      startRadius: 5,
      finalRadius: 100,
      speed: 1,
    });
    new Firework(new Point(cw * 0.5, ch * 0.3), {
      startRadius: 5,
      finalRadius: 100,
      speed: 1,
    });
    new Firework(new Point(cw * 0.7, ch * 0.4), {
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
      epsilon: 1,
    });
    new Tween(this.felinesPos, "x", {
      finalValue: cw * 0.5,
      epsilon: 1,
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
      epsilon: 1,
    });
    new Tween(this.felinesPos, "x", {
      finalValue: -cw * 2,
      epsilon: 1,
    });
  }

  static draw() {
    Stage.setActiveLayer("game");
    const { ctx, cw, ch } = Stage;
    const { time } = Clock;
    const { white, blue0, blue1, blue2, blue3 } = palette;

    ctx.fillStyle = palette.black.toAlpha(this.vignette);
    ctx.fillRect(0, 0, cw, ch);

    ctx.fillStyle = palette.white;
    ctx.strokeStyle = palette.blue2;
    ctx.lineWidth = 2;
    const textScale = lerp(0.5, 1, clamp(0, 1, cw / ch));

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
          pos.x - length * textScale * 0.5,
          pos.y + dy * textScale,
        ])
      );
      ctx.fill(p);
      ctx.stroke(p);
    });
  }
}
