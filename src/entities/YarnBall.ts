import { CircleCollider } from "../lib/Collisions2D";
import { Palette, type Color } from "../lib/Color";
import { Point } from "../lib/MathUtils";
import Math2D, { DEG2RAD } from "../lib/MathUtils";
import { DynamicBody, Gravity } from "../lib/Physics2D";
import { Stage } from "../lib/Stage";
import { Clock } from "../lib/TimeUtils";

export class YarnBall extends DynamicBody {
  public id: string;
  public thread: DynamicBody[];
  public threadLength: number = 100;
  public radius: number = 10;
  public color: Color;

  constructor(
    startPos: Point,
    startVelocity: Point,
    mass: number,
    radius: number = 10,
    color: Color
  ) {
    super(startPos, { friction: 0.1, angularVelocity: 0.5 });

    this.id = crypto.randomUUID();

    this.mass = mass;
    this.color = color;
    this.radius = radius;

    this.attachCollider(new CircleCollider(this.position, this.radius));
    this.velocity = startVelocity.clone();
    this.addForce(Gravity);

    const points = [];
    const subs = 10;

    for (let i = 0; i < subs; i++) {
      points.push(this.position.clone());
    }

    this.thread = points.map((p) => new DynamicBody(p));
  }

  update(): void {
    const { dt } = Clock;
    super.update();

    this.threadLength += dt * 0.01;
    this.thread[0].position = this.position
      .add(new Point(this.radius * 0.5, 0))
      .rotateAbout(this.position, this.orientation);

    let prevJoint: DynamicBody = this.thread[0];
    let lambda = 1;

    this.thread.forEach((joint) => {
      Math2D.damp2I(joint.position, prevJoint.position, lambda, dt);
      // Math2D.lerp2I(joint.position, prevJoint.position, dt);
      prevJoint = joint;
    });
  }

  draw() {
    const { ctx } = Stage;

    Palette.setTransparency(1);

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = "butt";
    ctx.lineJoin = "bevel";
    ctx.strokeStyle = this.color.setAlpha(0.9).toString();
    ctx.moveTo(this.position.x, this.position.y);
    this.thread.forEach((joint, i) => {
      i >= 0 && ctx.lineTo(joint.position.x, joint.position.y);
    });
    ctx.stroke();

    ctx.save();
    const { x, y } = this.position;
    ctx.translate(x, y);
    ctx.rotate(this.orientation);
    YarnBall.drawYarnball(new Point(0, 0), this.radius, this.color);
    ctx.restore();
  }

  static drawYarnball(position: Point, radius: number, color: Color) {
    const { ctx } = Stage;
    const subs = 10;
    const n = 90 / subs;
    const slices = 3;
    const theta = 360 / slices;
    const col1 = color;
    const col2 = color.lighten(1.1);

    const drawSector = (theta = 0) => {
      for (let i = 0; i < n; i++) {
        const dStart = theta + subs * i;
        const dEnd = theta + 180 - subs * i;

        ctx.beginPath();
        ctx.arc(
          position.x,
          position.y,
          radius,
          dStart * DEG2RAD,
          dEnd * DEG2RAD,
          false
        );
        ctx.closePath();
        ctx.closePath();

        ctx.fillStyle = i % 2 === 0 ? col1 : col2;
        ctx.fill();
      }
    };

    for (let i = 0; i < slices; i++) {
      drawSector(theta * i);
    }
  }
}
