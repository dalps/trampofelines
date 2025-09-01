import { CircleCollider } from "../lib/Collisions2D";
import { ElasticLine, ElasticShape } from "../lib/ElasticLine";
import { Ball, Gravity } from "../lib/Physics2D";
import type { Point2 } from "../lib/utils";
import Math2D, { DEG2RAD } from "../lib/utils";

export class YarnBall extends Ball {
  public thread: ElasticLine;
  public threadLength: number = 100;

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

    const points = [this._position];
    const subs = 10;

    for (let i = 1; i < subs; i++) {
      points.push(
        Math2D.lerp2(
          this._position,
          this._position.addX(-this.threadLength),
          i / subs
        )
      );
    }

    this.thread = new ElasticShape(points, {
      mass: 0.1,
      jointsAttraction: 200,
      jointsRepulsion: 200,
    });

    this.thread.joints.forEach((j) => j.addForce(Gravity));
    this.thread.joints[0]._position = this._position;
    this.thread.joints[0].clearForces();
    this.thread.joints[0].toggleFixed();
  }

  update(dt: number): void {
    super.update(dt);

    this.threadLength += dt * 0.01;

    this.thread.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.thread.draw(ctx, {
      fill: false,
      strokeColor: this.color,
      lineWidth: 4,
    });

    const col1 = this.color;
    const col2 = "rgb(230, 50, 50)";
    const { x, y } = this._position;

    // super.draw(ctx);

    const subs = 10;
    const n = 90 / subs;

    const drawSector = (theta = 0) => {
      for (let i = 0; i < n; i++) {
        const dStart = theta + subs * i;
        const dEnd = theta + 180 - subs * i;

        ctx.beginPath();
        ctx.arc(x, y, this.radius, dStart * DEG2RAD, dEnd * DEG2RAD, false);
        ctx.closePath();
        ctx.closePath();

        ctx.fillStyle = i % 2 === 0 ? col1 : col2;
        ctx.fill();
      }
    };

    const slices = 3;
    const theta = 360 / slices;
    for (let i = 0; i < slices; i++) {
      drawSector(theta * i);
    }
  }
}
