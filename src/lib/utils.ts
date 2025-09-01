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

  dot(p: Point2): number {
    return this.x * p.x + this.y * p.y;
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

  static L2(a: Point2) {
    return Math.hypot(a.x, a.y);
  }

  static dot(a: Point2, b: Point2) {
    return a.x * b.x + a.y * b.y;
  }

  static multiplyScalar(p: Point2, n: number): Point2 {
    return new Point2(p.x * n, p.y * n);
  }

  /* Find point on line defined parametrically by
   * L = P0 + t * direction */
  static linePointAt(p0: Point2, t: number, dir: Point2) {
    return new Point2(p0.x + t * dir.x, p0.y + t * dir.y);
  }

  /* Find point on line defined parametrically by
   * L = P0 + t * direction */
  static linePoint(p0: Point2, t: number, dir: number | "V" | "H") {
    if (dir === "V") {
      return new Point2(p0.x + t, p0.y);
    }

    if (dir === "H") {
      return new Point2(p0.x, p0.y + t);
    }

    return new Point2(p0.x + t, p0.y + t * dir);
  }

  static lerp2(min: Point2, max: Point2, t: number): Point2 {
    return new Point2(lerp(min.x, max.x, t), lerp(min.y, max.y, t));
  }
}
