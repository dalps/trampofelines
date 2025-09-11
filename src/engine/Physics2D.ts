import { popsicle } from "../utils/CanvasUtils";
import { damp } from "../utils/MathUtils";
import { Point } from "../utils/Point";
import { Clock } from "../utils/TimeUtils";
import { type Collider } from "./Collisions2D";
import { CollisionManager } from "./Collisions2D";
import Game from "./GameState";

/**
 * A permanent force that can be applied to a dynamic body
 */
export class Force {
  constructor(
    protected _direction: Point = new Point(0, 0),
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

  get direction(): Point {
    return this._direction;
  }

  toString() {
    return `[d=${this.direction} mag=${this.magnitude}]`;
  }
}

/**
 * A pull towards another body in space
 */
export class Pull extends Force {
  constructor(public from: Point, public to: Point, public strength = 1) {
    super();
  }

  override get magnitude(): number {
    return this.strength + this.to.sub(this.from).abs();
  }

  override get direction(): Point {
    return this.to.sub(this.from).normalize();
  }
}

/**
 * A force that lasts a very short amount of time
 */
export class ContactForce extends Force {
  static EPSILON = 0.000001;

  constructor(d: Point, m: number, public lambda = 1) {
    super(d, m);
  }

  update() {
    this._magnitude =
      this._magnitude <= ContactForce.EPSILON
        ? 0
        : damp(this._magnitude, 0, this.lambda, Clock.dt);
  }
}

export enum State {
  Alive,
  Asleep,
  Dead,
}

export class DynamicBody {
  public name?: string;
  public position: Point;
  public velocity: Point;
  public orientation: number;
  public angularVelocity: number;
  public mass: number;
  public friction: number;
  private _forces: Force[] = [];
  private _aux = new Point(0, 0);
  private _locks = { x: false, y: false };
  private _fixed = false;
  public collider?: Collider;
  public ref?: WeakRef<DynamicBody>;
  public collisionID?: string;
  public state = State.Alive;

  constructor(
    position: Point,
    {
      name = "DynamicBody",
      mass = 1,
      friction = 1,
      orientation = 0,
      angularVelocity = 0,
    } = {}
  ) {
    this.name = name;
    this.position = position;
    this.velocity = new Point(0, 0);
    this.mass = mass;
    this.friction = friction;
    this.orientation = orientation;
    this.angularVelocity = angularVelocity;
  }

  die() {
    this.state = State.Dead;
    CollisionManager.unregisterBody(this);
  }

  translate(x: number, y: number) {
    this.position.x += x;
    this.position.y += y;
  }

  addForce(force: Force) {
    !this._fixed && this._forces.push(force);
  }

  clearForces() {
    this._forces = [];
  }

  attachCollider(c: Collider) {
    this.collider = c;
  }

  public get totalForce() {
    this._aux.set(0, 0);
    this._forces.forEach(f =>
      this._aux.addI(f.direction.multiplyScalar(f.magnitude))
    );
    return this._aux;
  }

  public get acceleration(): Point {
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

  update() {
    const { dt } = Clock;

    if (this._fixed) return;

    this._forces.forEach(
      f => (f as ContactForce).update && (f as ContactForce).update()
    );

    const o = this.orientation + this.angularVelocity * dt;
    this.orientation = o > Math.PI * 2 ? 0 : o;

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

    Game.settings.showForces && (this.drawForces(), this.drawCollider());
  }

  drawForces() {
    // draw each individual force
    this._forces.forEach(f => {
      popsicle(
        this.position,
        this.position.add(f.direction.multiplyScalar(f.magnitude)),
        "green"
      );
    });

    // draw the total force
    popsicle(
      this.position,
      this.position.add(this.totalForce.multiplyScalar(1)),
      "hotpink"
    );

    popsicle(this.position, this.position.add(this.velocity), "magenta");

    // popsicle(
    //   ctx,
    //   this.position,
    //   this.position.add(this.acceleration),
    //   "hotpink"
    // );
  }

  drawCollider() {
    this.collider?.draw();
  }

  toString() {
    return `[m=${this.mass} p=${this.position} v=${this.velocity} a=${this.acceleration} F=${this.totalForce} forces=[${this._forces}]]`;
  }
}

export const Gravity = new Force(new Point(0, 1), 9.81);
