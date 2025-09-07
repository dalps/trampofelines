import { circle, popsicle } from "./CanvasUtils";
import Math2D, { Point } from "./MathUtils";
import { ContactForce, State, type DynamicBody } from "./Physics2D";
import { Stage } from "./Stage";
import { instant } from "./TimeUtils";

const debugColor = "yellowgreen";
const DEBUG = false;

function log(msg: string) {
  DEBUG && console.log(msg);
}

interface CollisionOptions {
  sensor?: boolean;
  contactForceFactor?: number;
  filter?: (b1: DynamicBody, b2: DynamicBody) => boolean;
  cb?: Function;
}

interface CollisionPair extends CollisionOptions {
  id1: string;
  id2: string;
  ref1: WeakRef<DynamicBody>;
  ref2: WeakRef<DynamicBody>;
}

export class CollisionManager {
  private static _id = 0;
  private static _pairsToWatch: CollisionPair[] = [];

  static getId(b: DynamicBody) {
    if (!b.collider || b.state !== State.Alive) return undefined;
    if (!b.collisionID) b.collisionID = `${b.name}${this._id++}`;
    return b.collisionID;
  }

  static register(
    b1: DynamicBody,
    b2: DynamicBody,
    options: CollisionOptions = {}
  ): void {
    const id1 = this.getId(b1);
    const id2 = this.getId(b2);

    if (!id1 || !id2) return;

    this._pairsToWatch.push({
      id1,
      id2,
      ref1: new WeakRef(b1),
      ref2: new WeakRef(b2),
      ...options,
    });
  }

  static unregisterBody(b: DynamicBody) {
    const entriesToRemove: number[] = [];

    log(`Searching for entries containing ${b.collisionID}...`);

    this._pairsToWatch.forEach(({ id1, id2 }, idx) => {
      if (b.collisionID === id1 || b.collisionID === id2) {
        entriesToRemove.push(idx);
      }
    });

    log(
      `Found ${entriesToRemove.map(
        (v) => `(${this._pairsToWatch[v].id1},${this._pairsToWatch[v].id2})`
      )}`
    );

    entriesToRemove.forEach((idx) => this._pairsToWatch.splice(idx, 1));
  }

  static update() {
    this._pairsToWatch.forEach(
      ({
        ref1: r1,
        ref2: r2,
        filter,
        cb,
        sensor = false,
        contactForceFactor = 300,
      }) => {
        const b1 = r1.deref();
        const b2 = r2.deref();
        const c1 = b1?.collider;
        const c2 = b2?.collider;

        if (
          !b1 ||
          !b2 ||
          !c1 ||
          !c2 ||
          b1.state !== State.Alive ||
          b2.state !== State.Alive ||
          (filter && !filter(b1, b2)) ||
          !c1.checkContact(c2)
        )
          return;

        !sensor && b1.addForce(this.collide(b1, b2, contactForceFactor));
        !sensor && b2.addForce(this.collide(b2, b1, contactForceFactor));
        cb && cb();
      }
    );
  }

  static collide(
    body: DynamicBody,
    against: DynamicBody,
    factor = 1
  ): ContactForce {
    const massFactor = (2 * against.mass) / (body.mass + against.mass);
    const sep = body.collider.center.sub(against.collider.center);

    return new ContactForce(sep.normalize(), massFactor * factor);
  }
}

function segSeg(c1: SegmentCollider, c2: SegmentCollider) {
  return Math2D.properInter(c1.a, c1.b, c2.a, c2.b) !== undefined;
}

function circleSegment(c1: CircleCollider, c2: SegmentCollider) {
  return Math2D.segPointDistance(c2.a, c2.b, c1.center) <= c1.radius;
}

function circleCircle(c1: CircleCollider, c2: CircleCollider) {
  const sep = c2.center.sub(c1.center);
  return sep.abs() <= c1.radius + c2.radius;
}

type ColliderType = "Circle" | "Segment";

export abstract class Collider {
  public abstract center: Point;
  constructor(public type: ColliderType) {}
  abstract draw(): void;
  abstract checkContact(c2: Collider): boolean;
}

export class CircleCollider extends Collider {
  constructor(public center: Point, public radius: number) {
    super("Circle");
  }

  checkContact(that: Collider) {
    switch (that.type) {
      case "Circle":
        return circleCircle(this, that as CircleCollider);
      case "Segment":
        return circleSegment(this, that as SegmentCollider);
    }
  }

  draw() {
    const { ctx } = Stage;
    ctx.lineWidth = 1;
    ctx.strokeStyle = debugColor;

    circle(this.center, this.radius);
    ctx.stroke();
  }
}

export class SegmentCollider extends Collider {
  constructor(public a: Point, public b: Point) {
    super("Segment");
  }

  get center(): Point {
    return Math2D.lerp2(this.a, this.b, 0.5);
  }

  get direction(): Point {
    return this.a.sub(this.b);
  }

  get length(): number {
    return this.direction.abs();
  }

  checkContact(that: Collider) {
    switch (that.type) {
      case "Circle":
        return circleSegment(that as CircleCollider, this);
      case "Segment":
        return segSeg(this, that as SegmentCollider);
    }
  }

  draw() {
    popsicle(this.a, this.b, debugColor);
    popsicle(this.b, this.a, debugColor);
  }
}

/**
 * Rejects collisions when the first body is not in descending motion
 * and strictly above the second body
 */
export function downwardFilter(b1: DynamicBody, b2: DynamicBody) {
  const isDescending = b2.velocity.y >= 0;
  const aboveJoint = b2.position.y < b1.position.y;
  return isDescending && aboveJoint;
}
