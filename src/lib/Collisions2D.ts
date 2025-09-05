import { circle, popsicle } from "./CanvasUtils";
import Math2D, { Point } from "./MathUtils";
import { ContactForce, State, type DynamicBody } from "./Physics2D";
import { Stage } from "./Stage";
import { instant } from "./TimeUtils";

const contactForceFactor = 20;
const debugColor = "yellowgreen";
const DEBUG = false;

function log(msg: string) {
  DEBUG && console.log(msg);
}

interface CollisionPair {
  id1: string;
  id2: string;
  r1: WeakRef<DynamicBody>;
  r2: WeakRef<DynamicBody>;
  filter?: (b1: DynamicBody, b2: DynamicBody) => boolean;
  cb?: Function;
}

export class CollisionManager {
  private static _id = 0;
  private static _pairsToWatch: CollisionPair[] = [];

  static getID(b: DynamicBody) {
    if (b.state !== State.Alive) {
      log(`Refusing to assign an id to dead body ${b.name}`);
      return undefined;
    }

    if (!b.collisionID) {
      const id = `${b.name}_${this._id++}`;
      log(`${b.name} doesn't have an id yet. Creating new one... ${id}`);
      return (b.collisionID = id);
    }

    return b.collisionID;
  }

  static register(
    b1: DynamicBody,
    b2: DynamicBody,
    filter?: (b1: DynamicBody, b2: DynamicBody) => boolean,
    cb?: Function
  ): void {
    if (!b1.collider || !b2.collider) {
      throw new Error("Cannot register a body without an attached collider.");
    }

    let id1 = this.getID(b1);
    let id2 = this.getID(b2);

    if (!id1 || !id2) {
      log(`Couldn't schedule collisions for ${b1.name} or ${b2.name}.`);
      return;
    }

    const r1 = new WeakRef(b1);
    const r2 = new WeakRef(b2);

    this._pairsToWatch.push({ id1, id2, r1, r2, filter, cb });
  }

  static unregisterBody(id: string) {
    const entriesToRemove: number[] = [];

    log(`Searching for entries containing ${id}...`);
    this._pairsToWatch.forEach(({ id1, id2 }, idx) => {
      if (id === id1 || id === id2) {
        log(`Unregistered pair ${id1}~${id2}.`);
        entriesToRemove.push(idx);
      }
    });

    entriesToRemove.forEach((idx) => this._pairsToWatch.splice(idx, 1));
  }

  static update() {
    this._pairsToWatch.forEach(({ r1, r2, filter, cb }) => {
      const b1 = r1.deref();
      const b2 = r2.deref();

      if (!b1 || !b2) {
        log(`A registered body was dropped.\nb1: ${b1?.name} b2: ${b2?.name}`);
        return;
      }

      const c1 = b1.collider!;
      const c2 = b2.collider!;

      if (filter && !filter(b1, b2)) return;

      if (c1.checkContact(c2)) {
        b1.addForce(this.collide(b1, b2, c1.center.sub(c2.center)));
        b2.addForce(this.collide(b2, b1, c2.center.sub(c1.center)));
        cb && cb();
      }
    });
  }

  static collide(
    body: DynamicBody,
    against: DynamicBody,
    sep: Point
  ): ContactForce {
    const massFactor = (2 * against.mass) / (body.mass + against.mass);

    return new ContactForce(sep.normalize(), massFactor * contactForceFactor);
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

interface ContactInfo {
  test: boolean;
  sep1: Point;
  sep2: Point;
}

export abstract class Collider {
  public abstract center: Point;
  constructor(public type: ColliderType) {}
  abstract draw();
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
