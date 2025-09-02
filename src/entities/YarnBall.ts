import { circle } from "../lib/CanvasUtils";
import { CircleCollider } from "../lib/Collisions2D";
import { Palette, type Color, type HSLColor } from "../lib/Color";
import { ElasticShape } from "../lib/ElasticLine";
import { DynamicBody, Gravity } from "../lib/Physics2D";
import { Stage } from "../lib/Stage";
import type { Point2 } from "../lib/utils";
import Math2D, { damp, DEG2RAD } from "../lib/utils";

export class YarnBall extends DynamicBody {
  public thread: DynamicBody[];
  public threadLength: number = 100;
  public radius: number = 10;
  public color: Color;

  constructor(
    startPos: Point2,
    startVelocity: Point2,
    mass: number,
    radius: number = 10,
    color: Color
  ) {
    super(startPos, { friction: 0.1 });

    this.mass = mass;
    this.color = color;
    this.radius = radius;

    this.attachCollider(new CircleCollider(this.position, this.radius));
    this._velocity = startVelocity.clone();
    this.addForce(Gravity);

    const points = [this._position];
    const subs = 10;

    for (let i = 1; i < subs; i++) {
      points.push(this._position.clone());
    }

    this.thread = points.map((p) => new DynamicBody(p));
    console.log(this.thread);
  }

  update(dt: number): void {
    super.update(dt);

    this.threadLength += dt * 0.01;

    let prevJoint: DynamicBody = this.thread[0];

    let lambda = 1;
    this.thread.forEach((joint, i) => {
      joint._position.x = damp(
        joint._position.x,
        prevJoint._position.x,
        lambda,
        dt
      );
      joint._position.y = damp(
        joint._position.y,
        prevJoint._position.y,
        lambda,
        dt
      );
      prevJoint = joint;
    });
  }

  draw() {
    const ctx = Stage.ctx;

    Palette.setTransparency(1);

    ctx.beginPath();
    ctx.strokeStyle = this.color.toString();
    ctx.moveTo(this.position.x, this.position.y);
    this.thread.forEach((joint, i) => {
      i >= 0 && ctx.lineTo(joint.position.x, joint.position.y);
    });
    ctx.stroke();

    const col1 = this.color;
    const col2 = this.color.lighten(1.1);
    const { x, y } = this._position;

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
