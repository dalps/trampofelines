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

export class Point {
  constructor(public x: number, public y: number) {}

  static ZERO = new Point(0, 0);

  static random(min = new Point(0, 0), max = new Point(1, 1)) {
    return new Point(
      lerp(min.x, max.x, Math.random()),
      lerp(min.y, max.y, Math.random())
    );
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  abs(): number {
    return Math.hypot(this.x, this.y);
  }

  rotate(phi: number) {
    const cos = Math.cos(phi);
    const sin = Math.sin(phi);
    return new Point(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  rotateAbout(c: Point, phi: number) {
    return c.add(this.sub(c).rotate(phi));
  }

  rotateAboutI(c: Point, phi: number) {
    const rotated = c.add(this.sub(c).rotate(phi));
    this.set(rotated.x, rotated.y);
  }

  normalize(): Point {
    const l2 = this.abs();
    this.x /= l2;
    this.y /= l2;
    return this;
  }

  clone() {
    return new Point(this.x, this.y);
  }

  equals(p: Point) {
    return this.x === p.x && this.y === p.y;
  }

  addI(p: Point) {
    this.x += p.x;
    this.y += p.y;
    return this;
  }

  subI(p: Point) {
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

  add(p: Point) {
    return this.clone().addI(p);
  }

  addX(dx: number) {
    return this.clone().incrX(dx);
  }

  addY(dy: number) {
    return this.clone().incrY(dy);
  }

  sub(p: Point) {
    return this.clone().subI(p);
  }

  multiplyScalar(n: number): Point {
    return this.clone().multiplyScalarI(n);
  }

  /**
   * Get a new point rotated 90 degrees counterclockwise.
   */
  perp() {
    return new Point(this.y, -this.x);
  }

  dot(p: Point): number {
    return this.x * p.x + this.y * p.y;
  }

  cross(p: Point): number {
    return this.x * p.y - this.y * p.x;
  }

  onSegment(a: Point, b: Point) {
    return Math2D.orient(a, b, this) === 0 && Math2D.inDisk(a, b, this);
  }

  projectI(i: Point, j: Point) {
    return this.set(this.dot(i), this.dot(j));
  }

  project(i: Point, j: Point) {
    return this.clone().projectI(i, j);
  }

  toString() {
    return `(${this.x},${this.y})`;
  }
}

export default class Math2D {
  static add(sum: Point, addend1: Point, addend2: Point) {
    sum.x = addend1.x + addend2.x;
    sum.y = addend1.y + addend2.y;
  }

  static subtract(difference: Point, minuend: Point, subtrahend: Point) {
    difference.x = minuend.x - subtrahend.x;
    difference.y = minuend.y - subtrahend.y;
  }

  static l2(a: Point) {
    return Math.hypot(a.x, a.y);
  }

  static dot(a: Point, b: Point) {
    return a.x * b.x + a.y * b.y;
  }

  static multiplyScalar(p: Point, n: number): Point {
    return new Point(p.x * n, p.y * n);
  }

  /**
   * Does `p` lie in the disk spanning the diameter `ab`?
   */
  static inDisk(a: Point, b: Point, p: Point) {
    return a.sub(p).dot(b.sub(p)) <= 0;
  }

  /**
   * Does `p` lie on segment `ab`?
   */
  static onSegment(a: Point, b: Point, p: Point) {
    return this.orient(a, b, p) === 0 && this.inDisk(a, b, p);
  }

  static lerp2(min: Point, max: Point, t: number): Point {
    return new Point(lerp(min.x, max.x, t), lerp(min.y, max.y, t));
  }

  static lerp2I(min: Point, max: Point, t: number): Point {
    min.x = lerp(min.x, max.x, t);
    min.y = lerp(min.y, max.y, t);
    return min;
  }

  static damp2I(
    current: Point,
    target: Point,
    lambda: number,
    dt: number
  ): Point {
    current.x = damp(current.x, target.x, lambda, dt);
    current.y = damp(current.y, target.y, lambda, dt);
    return current;
  }

  /**
   * Compare the projections of `p` and `q` on the line of direction `v`
   */
  static cmpProj(v: Point, p: Point, q: Point) {
    return v.dot(p) < v.dot(q);
  }

  /**
   * The distance between the point `p` and the segment `ab`
   */
  static segPointDistance(a: Point, b: Point, p: Point) {
    if (!a.equals(b)) {
      const v = b.sub(a); // direction

      // Is `p` closest to its projection on `ab`?
      if (this.cmpProj(v, a, p) && this.cmpProj(v, p, b)) {
        return Math.abs(v.cross(p) - v.cross(a)) / v.abs(); // distance to line: see Lecomte p. 57
      }
    }

    return Math.min(p.sub(a).abs(), p.sub(b).abs());
  }

  /**
   * Returns a positive number if `c` is to the left of the segment `ab`, negative if `c` is to the right, zero if the three are collinear.
   */
  static orient(a: Point, b: Point, c: Point) {
    return b.sub(a).cross(c.sub(a));
  }

  /**
   * Do segments `ab` and `cd` intersect?
   */
  static properInter(a: Point, b: Point, c: Point, d: Point) {
    let oa = this.orient(c, d, a);
    let ob = this.orient(c, d, b);
    let oc = this.orient(a, b, c);
    let od = this.orient(a, b, d);

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

  const check = () => {
    const res = Math2D.properInter(p1, p2, p3, p4);
    console.log(
      `Checking intersection between (${p1}~~${p2}) and ${p3}~~${p4}: ${res}`
    );
    return res;
  };

  let p1 = new Point(0, 0);
  let p2 = new Point(1, 1);
  let p3 = new Point(0.5, 1);
  let p4 = new Point(0.5, -1);
  assertTruthy(check());

  p1 = new Point(25, 526);
  p2 = new Point(62, 424);
  p3 = new Point(4, 454);
  p4 = new Point(307, 462);
  assertTruthy(check());
}
