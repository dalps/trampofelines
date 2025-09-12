import { Point } from "../utils/Point";
import PALETTE, { Color } from "./color";
import { drawText } from "./font";
import { Ripple, RippleParams } from "./Ripple";
import { Stage } from "./Stage";

export class Alert extends Ripple {
  fontSize: number;

  constructor(
    public center: Point,
    public text: string,
    { fontSize = 24, ...options }: RippleParams = {}
  ) {
    super(center, options);
    this.fontSize = fontSize;
  }

  override draw() {
    Stage.setActiveLayer("game");
    drawText(this.text, {
      fontSize: this.fontSize,
      pos: this.center.addY(-this.radius),
      fill: this.color.setAlpha(this.alpha),
    });
  }
}
