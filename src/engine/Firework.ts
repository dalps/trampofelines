import { star } from "../utils/CanvasUtils";
import { Point } from "../utils/MathUtils";
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
  color2: Color;
  points: number;
  drawEven: Function;
  drawOdd: Function;

  constructor(
    public center: Point,
    {
      color2 = PALETTE.blue3,
      points = 5,
      drawEven = (ctx: CanvasRenderingContext2D) => ctx.fill(),
      drawOdd = (ctx: CanvasRenderingContext2D) => ctx.stroke(),
      ...options
    }: FireworkParams & RippleParams = {}
  ) {
    super(center, options);
    this.color2 = color2.clone();
    this.points = points;
    this.drawEven = drawEven;
    this.drawOdd = drawOdd;
  }

  override draw() {
    Stage.setActiveLayer("game");
    const { ctx } = Stage;
    const { time } = Clock;
    console.log(this.alpha);

    ctx.fillStyle = this.color.setAlpha(this.alpha);
    ctx.strokeStyle = this.color2.setAlpha(this.alpha);
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    star(this.center, {
      outerRadius: this.radius,
      innerRadius: this.radius,
      points: this.points,
      angle: 0.05 * time,
      cb: (p: Point, j: number) => {
        star(p, { angle: 0.3 * time });
        ctx.closePath();
        j % 2 === 0 && this.drawEven(ctx, this.color, this.color2);
        j % 2 === 1 && this.drawOdd(ctx, this.color, this.color2);
      },
    });
  }
}
