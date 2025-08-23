import { circle } from "./CanvasUtils";
import { damp, type Point2 } from "./utils";

// TODO: ripple manager

export class Ripple {
  private _radius: number;
  private _transparency: number;
  constructor(
    public position: Point2,
    public initialRadius = 5,
    public finalRadius = 10,
    public initialTransparency = 1,
    public finalTransparency = 0,
    public fillColor = "#rgb()",
    public speed = 7
  ) {
    this._radius = initialRadius;
    this._transparency = initialTransparency;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgb(255,255,255,${this._transparency})`;
    ctx.beginPath();
    circle(ctx, this.position, this._radius);
    ctx.closePath();
    ctx.fill();
  }

  update(dt: number) {
    this._radius = damp(this._radius, this.finalRadius, this.speed, dt);
    this._transparency = damp(
      this._transparency,
      this.finalTransparency,
      this.speed,
      dt
    );
  }
}
