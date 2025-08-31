import { CircleCollider } from "../lib/Collisions2D";
import { Ball, Gravity } from "../lib/Physics2D";
import type { Point2 } from "../lib/utils";

export class YarnBall extends Ball {
  constructor(
    startPos: Point2,
    startVelocity: Point2,
    mass: number,
    radius: number | undefined,
    color: string | undefined
  ) {
    super(startPos, radius, color);

    this._velocity = startVelocity.clone();
    this.mass = mass;

    this.attachCollider(new CircleCollider(this.position, this.radius));
    this.addForce(Gravity);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx);
  }
}
