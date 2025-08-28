import {
  ContactForce,
  Force,
  type DynamicBody,
  type instant,
} from "./Physics2D";
import { damp, Point2 } from "./utils";

const contactForceFactor = 20;

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

      const info = c1.checkContact(c2);

      // only react if ball is in descending motion AND strictly above the joint
      const isDescending = b2._velocity.y >= 0;
      const aboveJoint = b2._position.y < b1._position.y;

      if (info.test && isDescending && aboveJoint) {
        console.log(`b1: ${b1.name} vs b2: ${b2.name} ${b2._velocity}`);
        b1.addForce(this.collide(b1, b2, info.sep1));
        b2.addForce(this.collide(b2, b1, info.sep2));
      }
    });
  }

  static collide(
    body: DynamicBody,
    against: DynamicBody,
    sep: Point2
  ): ContactForce {
    const massFactor = (2 * against.mass) / (body.mass + against.mass);

    // const magnitude =
    //   (massFactor * body.velocity.sub(against.velocity).dot(info.sep)) /
    //   (info.sep.l2() + c1.radius + c2.radius);

    // const direction = body.velocity
    //   .sub(info.sep.multiplyScalar(magnitude))
    //   .normalize();

    return new ContactForce(sep.normalize(), massFactor * contactForceFactor);
  }
}

type ColliderType = "Circle" | "Box" | "Line";

interface ContactInfo {
  test: boolean;
  sep1: Point2;
  sep2: Point2;
}

export abstract class Collider {
  constructor(public type: ColliderType) {}
  abstract checkContact(c2: Collider): ContactInfo; // return more info than just a boolean
}

export class CircleCollider extends Collider {
  constructor(public center: Point2, public radius: number) {
    super("Circle");
  }

  checkContact(that: CircleCollider) {
    const sep = this.center.sub(that.center);
    const distance = sep.l2();
    return {
      test: distance <= this.radius + that.radius,
      sep1: sep,
      sep2: sep.multiplyScalar(-1),
    };
  }
}

export class BoxCollider extends Collider {
  public left: number;
  public right: number;
  public top: number;
  public bottom: number;
  public center: Point2;

  constructor(
    public origin: Point2,
    public width: number,
    public height: number,
    public rotation: number = 0
  ) {
    super("Box");

    this.left = origin.x;
    this.right = origin.x + width;
    this.top = origin.y;
    this.bottom = origin.y + height;
    this.center = new Point2(this.left + width * 0.5, this.top + height * 0.5);
  }

  checkContact(that: Collider) {
    switch (that.type) {
      case "Circle": {
        return false;
      }
      case "Box": {
        return false;
      }
      case "Line": {
        return false;
      }
    }
  }
}

export class LineCollider extends Collider {
  public direction: Point2;
  constructor(public p1: Point2, public p2: Point2) {
    super("Line");

    this.direction = p1.sub(p2).normalize();
  }

  get length(): number {
    return this.p1.sub(this.p2).l2();
  }

  checkContact(that: Collider) {
    switch (that.type) {
      case "Circle": {
        const { center, radius } = that as CircleCollider;
        const d1 = this.p1.sub(center).l2();
        const d2 = this.p2.sub(center).l2();
        const sum = d1 + d2;
        return {
          test:
            sum + 2 * radius <= this.length || this.length <= sum - 2 * radius,

          sep: center.sub(
            this.direction.multiplyScalar(center.dot(this.direction))
          ),
        };
      }
      case "Box": {
        return false;
      }
      case "Line": {
        return false;
      }
    }
  }
}
