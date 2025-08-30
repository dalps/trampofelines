import { circle } from "./CanvasUtils";
import { damp, type Point2 } from "./utils";

// TODO: ripple manager & cleanup

export class RippleManager {
  private static _ripples: Set<WeakRef<Ripple>> = new Set();

  static add(ripple: Ripple) {
    const ref = new WeakRef(ripple);
    this._ripples.add(ref);
    return ref;
  }

  static delete(ref: WeakRef<Ripple>) {
    this._ripples.delete(ref);
  }

  static draw(ctx: CanvasRenderingContext2D) {
    for (let ref of this._ripples.values()) {
      ref.deref()?.draw(ctx);
    }
  }

  static update(dt: number) {
    for (let ref of this._ripples.values()) {
      ref.deref()?.update(dt);
    }
  }

  static updateAndDraw(ctx: CanvasRenderingContext2D, dt: number) {
    this.update(dt);
    this.draw(ctx);
  }
}

const EPSILON = 0.001;
export class Ripple {
  private _radius: number;
  private _transparency: number;
  private _ref: WeakRef<Ripple>;

  constructor(
    public position: Point2,
    public initialRadius = 5,
    public finalRadius = 10,
    public initialTransparency = 1,
    public finalTransparency = 0,
    public fillColor = "rgb(0,0,0,0.2)",
    public speed = 7
  ) {
    this._radius = initialRadius;
    this._transparency = initialTransparency;
    this._ref = RippleManager.add(this);
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

    if (
      Math.abs(this._radius - this.finalRadius) <= EPSILON ||
      Math.abs(this._transparency - this.finalTransparency) <= EPSILON
    ) {
      RippleManager.delete(this._ref);
    }
  }
}
