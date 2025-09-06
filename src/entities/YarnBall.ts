import { CircleCollider } from "../lib/Collisions2D";
import { Palette, type Color } from "../lib/Color";
import Math2D, { Point } from "../lib/MathUtils";
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
    YarnBall.drawYarnball(new Point(0, 0), {
      radius: this.radius,
      color: this.color,
      lineWidth: 2,
    });
    ctx.restore();
  }

  static drawYarnball(
    position: Point,
    {
      radius = 100,
      color = Palette.colors.coral,
      color2 = color.lighten(1.1),
      lineWidth = 7,
      rotation = 0,
      decoration = false,
    } = {}
  ) {
    const { ctx } = Stage;
    const stripes = new Path2D(
      `M 6.2,5.3 C 5.4,2.5 -3.8,0.5 -6.5,3.9    M 34.2,-14.2 C 20.5,-36.9 -4.3,-41 -25.9,-26.9    M 26.1,-6.4 C 19.8,-20.8 -5.4,-27.6 -21.1,-16.8    M 17.3,0 C 10.5,-9.4 -4.6,-12.3 -14.4,-6    M 45.8,8.7 C 44.1,15.3 30.8,22.3 17.5,23.7    M 46,-8.1 C 41.9,-0.5 24.8,13.6 5,15    M 41,-22.2 C 35.6,-15.3 18.5,5.5 -3.3,7.3    M -45.4,-11 c 3.7,18.6 21.5,45.1 55.2,56.6    M -39.5,-24.9 c 8.9,27.5 29.2,51.4 64.5,64.3    M -29.4,-36.2 C -16.9,3.3 15.3,27.1 35.3,30.5`
    );
    const excess = new Path2D(
      `M 0,46 C -35,47 -75,46 -50,29 -36,19 -100,32 -64,12`
    );
    const originalRadius = 50;
    const p = new Path2D();
    const arc = new Path2D();
    const bg = new Path2D();
    const mat = new DOMMatrix()
      .translate(position.x, position.y)
      .rotate(0, 0, rotation)
      .scale(radius / originalRadius, radius / originalRadius);

    arc.arc(0, 0, 47.5, 0, Math.PI * 2);

    p.addPath(arc, mat);
    p.addPath(stripes, mat);
    decoration && p.addPath(excess, mat);

    ctx.beginPath();
    bg.addPath(arc, mat);
    ctx.fillStyle = color2;
    ctx.fill(bg);

    ctx.lineCap = "butt";
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke(p);
  }
}
