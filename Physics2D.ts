import { circle, popsicle } from "./CanvasUtils";
import { Point2 } from "./utils";

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

class ContactForce extends Force {
  update(dt: instant) {}
}

interface CollisionPair {
  r1: WeakRef<DynamicBody>;
  r2: WeakRef<DynamicBody>;
}

export class CollisionManager {
  private static _id = 0;
  private static _bodies: Map<number, CollisionPair> = new Map();

  static register(b1: DynamicBody, b2: DynamicBody): number {
    if (!b1.collider || !b2.collider) {
      throw new Error("Cannot register a body without an attached collider.");
    }

    const r1 = new WeakRef(b1);
    const r2 = new WeakRef(b2);

    this._bodies.set(this._id++, { r1, r2 });
    return this._id;
  }

  static unregister(id: number) {
    this._bodies.delete(id);
  }

  static update(dt: instant) {
    this._bodies.forEach(({ r1, r2 }) => {
      const b1 = r1.deref();
      const b2 = r2.deref();

      if (!b1 || !b2) {
        console.log("A body's missing");
        return;
      }

      const c1 = b1.collider!;
      const c2 = b2.collider!;
      if (c1.checkContact(c2)) {
        console.log(
          `Collided! New velocities: ${this.collide(b1, b2)} ${this.collide(
            b2,
            b1
          )}`
        );
        b1.velocity = this.collide(b1, b2);
        b2.velocity = this.collide(b2, b1);
      }
    });
  }

  static collide(body: DynamicBody, against: DynamicBody): Point2 {
    const c1 = body.collider!;
    const c2 = against.collider!;
    const sep = c1.center.sub(c2.center);

    return body.velocity.sub(
      sep.multiplyScalar(
        (((2 * against.mass) / (body.mass + against.mass)) *
          body.velocity.sub(against.velocity).dot(sep)) /
          Math.pow(sep.l2(), 2)
      )
    );
  }
}

export abstract class Collider {
  abstract checkContact(c2: Collider): boolean;
}

export class CircleCollider extends Collider {
  constructor(public center: Point2, public radius: number) {
    super();
  }

  checkContact(c2: CircleCollider): boolean {
    const distance = this.center.sub(c2.center).l2();
    return distance <= this.radius * 2;
  }
}

export class DynamicBody {
  public velocity: Point2;
  private _forces: Force[] = [];
  private _aux = new Point2(0, 0);
  private _locks = { x: false, y: false };
  public collider?: CircleCollider;
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

  createCollider(radius: number) {
    this.collider = new CircleCollider(this.position, radius);
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

  update(dt: number) {
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
    // this._forces.forEach((f) => {
    //   popsicle(
    //     ctx,
    //     this.position,
    //     this.position.add(f.direction.multiplyScalar(f.magnitude)),
    //     "green"
    //   );
    // });

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
  constructor(p: Point2, public radius = 2) {
    super(p, radius, 0);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "yellow";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
  }
}
