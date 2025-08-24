import { circle, popsicle } from "./CanvasUtils";
import { Point2 } from "./utils";

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

/**
 * A pull towards another body in space
 */
export class Attraction extends Force {
  constructor(public from: Point2, public to: Point2, public strength = 1) {
    super();
  }

  override get magnitude(): number {
    return this.strength + this.to.sub(this.from).l2();
  }

  override get direction(): Point2 {
    return this.to.sub(this.from).normalize();
  }
}

export class Repulsion extends Force {
  constructor(public from: Point2, public to: Point2, public strength = 1) {
    super();
  }

  override get magnitude(): number {
    return this.strength - this.from.sub(this.to).l2();
  }

  override get direction(): Point2 {
    return this.from.sub(this.to).normalize();
  }
}

export class CollisionManager {
  private static _bodies: Set<WeakRef<DynamicBody>> = new Set();

  static register(body: DynamicBody): WeakRef<DynamicBody> {
    if (!body.collider) {
      throw new Error("Cannot register a body without an attached collider.");
    }

    if (body.ref && this._bodies.has(body.ref)) {
      // console.log("Already has a ref")
      return body.ref;
    }

    const ref = new WeakRef(body);
    this._bodies.add(ref);
    return ref;
  }

  static update(dt: number) {
    this._bodies.forEach((ref) => {
      const body = ref.deref();

      if (!body) {
        console.log("Body missing");
        return;
      }

      this._bodies.forEach((ref2) => {
        const b2 = ref2.deref();
        if (ref === ref2 || !b2) return;

        const c1 = body.collider!;
        const c2 = b2.collider!;
        if (body.collider!.checkContact(b2.collider!)) {
          const direction = c1.center.sub(c2.center);
          body.addForce(new Force(direction, 10));
          b2.addForce(new Force(direction.multiplyScalar(-1), 10));
        }
      });
    });
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
    const colliding = distance <= this.radius * 2;

    // console.log(`${distance}, ${colliding}`);
    return this.center.sub(c2.center).l2() <= this.radius * 2;
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

  createCollider() {
    this.collider = new CircleCollider(this.position, 10);
    this.ref = CollisionManager.register(this);
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

    // popsicle(ctx, this.position, this.position.add(this.velocity), "magenta");

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
