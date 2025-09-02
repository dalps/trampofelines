export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function lerp(min: number, max: number, t: number) {
  return min * (1 - t) + max * t;
}

export function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number
) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function resolveMousePosition(e: MouseEvent): Point2 {
  if (e.offsetX) {
    return new Point2(e.offsetX, e.offsetY);
  }

  return new Point2(e.layerX, e.layerY);
}

export function resolveTouchPosition(canvasRect: DOMRect, e: Touch): Point2 {
  return new Point2(e.clientX - canvasRect.x, e.clientY - canvasRect.y);
}

export class Point2 {
  constructor(public x: number, public y: number) {}

  static ZERO = new Point2(0, 0);

  static random(min = new Point2(0, 0), max = new Point2(1, 1)) {
    return new Point2(
      lerp(min.x, max.x, Math.random()),
      lerp(min.y, max.y, Math.random())
    );
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  l2(): number {
    return Math.hypot(this.x, this.y);
  }

  normalize(): Point2 {
    const l2 = this.l2();
    this.x /= l2;
    this.y /= l2;
    return this;
  }

  clone() {
    return new Point2(this.x, this.y);
  }

  addI(p: Point2) {
    this.x += p.x;
    this.y += p.y;
    return this;
  }

  subI(p: Point2) {
    this.x -= p.x;
    this.y -= p.y;
    return this;
  }

  multiplyScalarI(n: number) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  incrY(dy: number) {
    this.y += dy;
    return this;
  }

  incrX(dx: number) {
    this.x += dx;
    return this;
  }

  add(p: Point2) {
    return this.clone().addI(p);
  }

  addX(dx: number) {
    return this.clone().incrX(dx);
  }

  addY(dy: number) {
    return this.clone().incrY(dy);
  }

  sub(p: Point2) {
    return this.clone().subI(p);
  }

  multiplyScalar(n: number): Point2 {
    return this.clone().multiplyScalarI(n);
  }

  /**
   * Get a new point rotated 90 degrees counterclockwise.
   */
  perp() {
    return new Point2(this.y, -this.x);
  }

  dot(p: Point2): number {
    return this.x * p.x + this.y * p.y;
  }

  cross(p: Point2): number {
    return this.x * p.y - this.y * p.x;
  }

  onSegment(a: Point2, b: Point2) {
    return Math2D.orient(a, b, this) === 0 && Math2D.inDisk(a, b, this);
  }

  projectI(i: Point2, j: Point2) {
    return this.set(this.dot(i), this.dot(j));
  }

  project(i: Point2, j: Point2) {
    return this.clone().projectI(i, j);
  }

  toString() {
    return `(${this.x},${this.y})`;
  }
}

export const Vec2 = Point2;

export default class Math2D {
  static add(sum: Point2, addend1: Point2, addend2: Point2) {
    sum.x = addend1.x + addend2.x;
    sum.y = addend1.y + addend2.y;
  }

  static subtract(difference: Point2, minuend: Point2, subtrahend: Point2) {
    difference.x = minuend.x - subtrahend.x;
    difference.y = minuend.y - subtrahend.y;
  }

  static l2(a: Point2) {
    return Math.hypot(a.x, a.y);
  }

  static dot(a: Point2, b: Point2) {
    return a.x * b.x + a.y * b.y;
  }

  static multiplyScalar(p: Point2, n: number): Point2 {
    return new Point2(p.x * n, p.y * n);
  }

  static inDisk(a: Point2, b: Point2, p: Point2) {
    return a.sub(p).dot(b.sub(p)) <= 0;
  }

  static onSegment(a: Point2, b: Point2, p: Point2) {
    return this.orient(a, b, p) === 0 && this.inDisk(a, b, p);
  }

  static lerp2(min: Point2, max: Point2, t: number): Point2 {
    return new Point2(lerp(min.x, max.x, t), lerp(min.y, max.y, t));
  }

  static lerp2I(min: Point2, max: Point2, t: number): Point2 {
    min.x = lerp(min.x, max.x, t);
    min.y = lerp(min.y, max.y, t);
    return min;
  }

  static damp2I(
    current: Point2,
    target: Point2,
    lambda: number,
    dt: number
  ): Point2 {
    current.x = damp(current.x, target.x, lambda, dt);
    current.y = damp(current.y, target.y, lambda, dt);
    return current;
  }

  /**
   * The orientation of `c` with respect to the line going through `a` and `b`. Positive if `c` is to the left, negative if to the right, zero if they are collinear.
   */
  static orient(a: Point2, b: Point2, c: Point2) {
    return b.sub(a).cross(c.sub(a));
  }

  static properInter(a: Point2, b: Point2, c: Point2, d: Point2) {
    let oa = this.orient(c, d, a);
    let ob = this.orient(c, d, b);
    let oc = this.orient(a, b, c);
    let od = this.orient(a, b, d);

    console.log(oa, ob, oc, od);

    if (oa * ob < 0 && oc * od < 0) {
      return a
        .multiplyScalar(ob)
        .sub(b.multiplyScalar(oa))
        .multiplyScalar(1 / (ob - oa));
    }

    return undefined;
  }
}

function testLineIntersection() {
  const assertTruthy = (b) => {
    if (!b) {
      throw new Error("Assertion failed.");
    }
  };

  const assertFalsy = (b) => {
    if (b) {
      throw new Error("Assertion failed.");
    }
  };

  const check = () => {
    const res = Math2D.properInter(p1, p2, p3, p4);
    console.log(
      `Checking intersection between (${p1}~~${p2}) and ${p3}~~${p4}: ${res}`
    );
    return res;
  };

  let p1 = new Point2(0, 0);
  let p2 = new Point2(1, 1);
  let p3 = new Point2(0.5, 1);
  let p4 = new Point2(0.5, -1);
  assertTruthy(check());

  p1 = new Point2(25, 526);
  p2 = new Point2(62, 424);
  p3 = new Point2(4, 454);
  p4 = new Point2(307, 462);
  assertTruthy(check());
}

testLineIntersection();
