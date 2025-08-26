import { circle, popsicle } from "./CanvasUtils";
import type { CircleCollider, Collider } from "./Collisions2D";
import { damp, Point2 } from "./utils";

export type instant = number;

/**
 * A static force that can be applied to a dynamic body
 */
export class Force {
  constructor(
    protected _direction: Point2 = new Point2(0, 0),
    protected _magnitude: number = 1
  ) {}

  set magnitude(v) {
    this._magnitude = v;
  }

  set direction(v) {
    this._direction = v;
  }

  get magnitude(): number {
    return this._magnitude;
  }

  get direction(): Point2 {
    return this._direction;
  }

  toString() {
    return `[d=${this.direction} mag=${this.magnitude}]`;
  }
}

type AttractionStrengthBehavior = "Additive" | "Multiplicative";

/**
 * A pull towards another body in space
 */
export class Attraction extends Force {
  constructor(
    public from: Point2,
    public to: Point2,
    public strength = 1,
    public behavior: AttractionStrengthBehavior = "Additive"
  ) {
    super();
  }

  override get magnitude(): number {
    switch (this.behavior) {
      case "Additive":
        return this.strength + this.to.sub(this.from).l2();
      case "Multiplicative":
        return this.strength * this.to.sub(this.from).l2();
    }
  }

  override get direction(): Point2 {
    return this.to.sub(this.from).normalize();
  }
}

export class Repulsion extends Force {
  constructor(
    public from: Point2,
    public to: Point2,
    public strength = 1,
    public behavior: AttractionStrengthBehavior = "Additive"
  ) {
    super();
  }

  override get magnitude(): number {
    switch (this.behavior) {
      case "Additive":
        return this.strength - this.from.sub(this.to).l2();
      case "Multiplicative":
        return this.strength / this.from.sub(this.to).l2();
    }
  }

  override get direction(): Point2 {
    return this.from.sub(this.to).normalize();
  }
}

export class ContactForce extends Force {
  static EPSILON = 0.000001;

  constructor(d: Point2, m: number, public lambda = 1) {
    super(d, m);
  }

  update(dt: instant) {
    this._magnitude =
      this._magnitude <= ContactForce.EPSILON
        ? 0
        : damp(this._magnitude, 0, this.lambda, dt);
  }
}

export class DynamicBody {
  public velocity: Point2;
  private _forces: Force[] = [];
  private _aux = new Point2(0, 0);
  private _locks = { x: false, y: false };
  private _fixed = false;
  public collider?: Collider;
  public ref?: WeakRef<DynamicBody>;

  constructor(public position: Point2, public mass = 1, public friction = 0) {
    this.velocity = new Point2(0, 0);
  }

  translate(x: number, y: number) {
    this.position.x += x;
    this.position.y += y;
  }

  addForce(force: Force) {
    this._forces.push(force);
  }

  clearForces() {
    this._forces = [];
  }

  attachCollider(c: Collider) {
    this.collider = c;
  }

  public get totalForce() {
    this._aux.set(0, 0);
    this._forces.forEach((f) =>
      this._aux.addI(f.direction.multiplyScalar(f.magnitude))
    );
    return this._aux;
  }

  public get acceleration(): Point2 {
    return this.totalForce
      .multiplyScalarI(1 / this.mass)
      .subI(this.velocity.multiplyScalar(this.friction));
  }

  toggleX() {
    this._locks.x = !this._locks.x;
  }

  toggleY() {
    this._locks.y = !this._locks.y;
  }

  toggleFixed() {
    this._fixed = !this._fixed;
  }

  update(dt: number) {
    if (this._fixed) return;

    this._forces.forEach(
      (f) => (f as ContactForce).update && (f as ContactForce).update(dt)
    );

    if (!this._locks.x) {
      this.velocity.x += this.acceleration.x * dt;
      this.position.x +=
        this.velocity.x * dt + this.acceleration.x * dt * dt * 0.5;
    }

    if (!this._locks.y) {
      this.velocity.y += this.acceleration.y * dt;
      this.position.y +=
        this.velocity.y * dt + this.acceleration.y * dt * dt * 0.5;
    }
  }

  drawForces(ctx: CanvasRenderingContext2D) {
    // draw each individual force
    this._forces.forEach((f) => {
      popsicle(
        ctx,
        this.position,
        this.position.add(f.direction.multiplyScalar(f.magnitude)),
        "green"
      );
    });

    // draw the total force
    popsicle(
      ctx,
      this.position,
      this.position.add(this.totalForce.multiplyScalar(1)),
      "hotpink"
    );

    popsicle(ctx, this.position, this.position.add(this.velocity), "magenta");

    // popsicle(
    //   ctx,
    //   this.position,
    //   this.position.add(this.acceleration),
    //   "hotpink"
    // );
  }

  drawCollider(ctx: CanvasRenderingContext2D) {
    if (!this.collider) return;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "green";

    ctx.beginPath();
    circle(ctx, this.collider?.center, this.collider?.radius);
    ctx.closePath();
    ctx.stroke();
  }

  toString() {
    return `[m=${this.mass} p=${this.position} v=${this.velocity} a=${this.acceleration} F=${this.totalForce} forces=[${this._forces}]]`;
  }
}

export const Gravity = new Force(new Point2(0, 1), 9.81);

export class Ball extends DynamicBody {
  constructor(p: Point2, public radius = 2, public color = "yellow") {
    super(p, radius, 0);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
  }
}
