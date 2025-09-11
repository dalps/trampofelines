import { circle } from "../utils/CanvasUtils";
import { type Point } from "../utils/Point";
import PALETTE, { Color, HSLColor } from "./color";
import { Stage } from "./Stage";
import { Tween } from "./tween";

export interface RippleParams {
  startRadius?: number;
  finalRadius?: number;
  startTransparency?: number;
  finalTransparency?: number;
  color?: HSLColor;
  speed?: number;
}

/**
 * A circle that changes in radius and transparency over time.
 */
export class Ripple {
  radius: number;
  alpha: number;
  color: Color;

  constructor(
    public position: Point,
    {
      startRadius = 5,
      finalRadius = 10,
      startTransparency = 1,
      finalTransparency = 0,
      color = PALETTE.white,
      speed = 7,
    }: RippleParams = {}
  ) {
    this.radius = startRadius;
    this.alpha = startTransparency;
    this.color = color.clone();

    new Tween(this, "alpha", {
      finalValue: finalTransparency,
      speed,
    });
    new Tween(this, "radius", {
      finalValue: finalRadius,
      speed,
    });
  }

  draw() {
    const { ctx } = Stage;

    ctx.fillStyle = this.color.setAlpha(this.alpha);
    ctx.beginPath();
    circle(this.position, this.radius);
    ctx.fill();
  }
}
