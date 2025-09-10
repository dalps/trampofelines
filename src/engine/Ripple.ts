import { circle } from "../utils/CanvasUtils";
import { type Point } from "../utils/MathUtils";
import PALETTE, { Color } from "./color";
import { Stage } from "./Stage";
import { Tween } from "./tween";

/**
 * A circle that changes in radius and transparency over time.
 */
export class Ripple {
  radius: number;
  transparency: number;
  color: Color;

  constructor(
    public position: Point,
    {
      startRadius = 5,
      finalRadius = 10,
      startTransparency = 1,
      finalTransparency = 0,
      fillColor = PALETTE.white.clone(),
      speed = 7,
    }
  ) {
    this.radius = startRadius;
    this.transparency = startTransparency;
    this.color = fillColor;

    new Tween(this, "transparency", {
      startValue: startTransparency,
      finalValue: finalTransparency,
      speed,
    });
    new Tween(this, "radius", {
      startValue: startRadius,
      finalValue: finalRadius,
      speed,
    });
  }

  draw() {
    const { ctx } = Stage;

    ctx.fillStyle = this.color.toAlpha(this.transparency);
    ctx.beginPath();
    circle(this.position, this.radius);
    ctx.fill();
  }
}
