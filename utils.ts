export function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

export class Point2 {
  constructor(public x: number, public y: number) {}

  l2(): number {
    return Math.hypot(this.x, this.y);
  }

  add(p: Point2): void {
    this.x += p.x;
    this.y += p.y;
  }

  sub(p: Point2): void {
    this.x -= p.x;
    this.y -= p.y;
  }

  multiplyScalar(n: number) {
    this.x *= n;
    this.y *= n;
  }

  dot(p: Point2): number {
    return this.x * p.x + this.y * p.y;
  }
}

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

  /* Find point on line defined parametrically by
   * L = P0 + t * direction */
  static linePointAt(p0: Point2, t: number, dir: Point2) {
    return new Point2(p0.x + t * dir.x, p0.y + t * dir.y);
  }

  static lerp(min: Point2, max: Point2, t: number): Point2 {
    return new Point2(lerp(min.x, max.x, t), lerp(min.y, max.y, t));
  }
}
