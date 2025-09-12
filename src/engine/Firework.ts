import { star } from "../utils/CanvasUtils";
import { Point } from "../utils/Point";
import { Clock } from "../utils/TimeUtils";
import PALETTE, { Color, HSLColor } from "./color";
import { Ripple, RippleParams } from "./Ripple";
import { Stage } from "./Stage";

export interface FireworkParams {
  color2?: HSLColor;
  points?: number;
  drawEven?: (ctx: CanvasRenderingContext2D) => void;
  drawOdd?: (ctx: CanvasRenderingContext2D) => void;
}

export class Firework extends Ripple {
  ctx: CanvasRenderingContext2D;
  color2: Color;
  points: number;
  drawEven: Function;
  drawOdd: Function;

  constructor(
    public center: Point,
    {
      ctx = Stage.activeLayer.ctx,
      color2 = PALETTE.blue3,
      points = 5,
      ...options
    }: FireworkParams & RippleParams = {}
  ) {
    super(center, options);
    this.ctx = ctx;
    this.color2 = color2.clone();
    this.points = points;
  }

  override draw() {
    const { time } = Clock;

    this.ctx.lineWidth = 2;

    star(this.center, {
      outerRadius: this.radius,
      innerRadius: this.radius,
      points: this.points,
      angle: 0.05 * time,
      cb: (p: Point, j: number) => {
        star(p, {
          angle: 0.3 * time,
          ctx: this.ctx,
          fill: this.color.setAlpha(this.alpha),
          stroke: this.color2.setAlpha(this.alpha),
        });
      },
    });
  }
}
