import { CircleCollider, CollisionManager } from "../engine/Collisions2D";
import palette, { type Color } from "../engine/color";
import { EntityManager } from "../engine/EntityManager";
import Game, { BALL_MIN_RADIUS, YARNBALLS } from "../engine/GameState";
import { DynamicBody, GRAVITY } from "../engine/Physics2D";
import { Stage } from "../engine/Stage";
import * as Math2D from "../utils/MathUtils";
import { Point } from "../utils/Point";
import { Clock } from "../utils/TimeUtils";

export class YarnBallManager extends EntityManager<YarnBall> {
  public update(): void {}

  public spawn(
    startPos: Point,
    startVelocity: Point,
    mass: number,
    radius: number = 10,
    color: Color
  ): YarnBall {
    const b = new YarnBall(startPos, startVelocity, mass, radius, color);

    this.add(b);

    return b;
  }

  clearEntities(): void {
    this.list.forEach(b => b.die());

    super.clearEntities();
  }
}

export class YarnBall extends DynamicBody {
  public id: string;
  public thread: DynamicBody[];
  public threadLength: number = 0;
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

    this.name = "YB";
    this.id = crypto.randomUUID();

    this.mass = mass;
    this.color = color;
    this.radius = radius;

    this.attachCollider(new CircleCollider(this.position, this.radius));
    this.velocity = startVelocity.clone();
    this.addForce(GRAVITY);

    const points: Point[] = [];
    const subs = 10;

    for (let i = 0; i < subs; i++) {
      points.push(this.position.clone());
    }

    this.thread = points.map(p => new DynamicBody(p));

    Clock.every(2, () => {
      this.thread.push(new DynamicBody(this.thread.at(-1).position.clone()));
    });
  }

  die() {
    CollisionManager.unregisterBody(this);
    YARNBALLS.delete(this);
  }

  update(): void {
    const { dt } = Clock;
    super.update();

    this.threadLength += dt * 0.01;
    this.thread[0].position = this.position
      .add(new Point(this.radius * 0.5, 0))
      .rotateAbout(this.position, this.orientation);

    let prevJoint: DynamicBody = this.thread[0];
    this.radius = Math.max(BALL_MIN_RADIUS, this.radius - 0.05 * dt);

    if (this.radius <= BALL_MIN_RADIUS) {
      CollisionManager.unregisterBody(this);
    }

    this.thread.forEach(joint => {
      Math2D.damp2I(joint.position, prevJoint.position, 2, dt);
      // Math2D.lerp2I(joint.position, prevJoint.position, dt);
      prevJoint = joint;
    });

    this.draw();
  }

  draw() {
    Stage.setActiveLayer("game");
    const { ctx } = Stage;

    ctx.lineCap = ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = this.color.toString();
    ctx.moveTo(this.position.x, this.position.y);
    this.thread.forEach((joint, i) => {
      i >= 0 && ctx.lineTo(joint.position.x, joint.position.y);
    });
    ctx.stroke();

    ctx.save();
    const { x, y } = this.position;
    ctx.translate(x, y);
    ctx.rotate(this.orientation);
    YarnBall.drawTexture(new Point(0, 0), {
      radius: Math.max(10, this.radius),
      color: this.color,
      lineWidth: 2,
    });
    ctx.restore();
  }

  static drawTexture(
    position: Point,
    {
      radius = 100,
      color = palette.coral,
      lineWidth = 7,
      rotation = 0,
      decoration = false,
    } = {}
  ) {
    const { ctx } = Stage;
    const stripes = new Path2D(
      `M6.2,5.3C5.4,2.5-3.8,0.5-6.5,3.9M34.2,-14.2C20.5,-36.9-4.3,-41-25.9,-26.9M26.1,-6.4C19.8,-20.8-5.4,-27.6-21.1,-16.8M17.3,0C10.5,-9.4-4.6,-12.3-14.4,-6M45.8,8.7C44.1,15.3 30.8,22.3 17.5,23.7M46,-8.1C41.9,-0.5 24.8,13.6 5,15M41,-22.2C35.6,-15.3 18.5,5.5-3.3,7.3M-45.4,-11c3.7,18.6 21.5,45.1 55.2,56.6M-39.5,-24.9c8.9,27.5 29.2,51.4 64.5,64.3M-29.4,-36.2C-16.9,3.3 15.3,27.1 35.3,30.5`
    );
    const excess = new Path2D(`M0,46C-35,47-75,46-50,29-36,19-100,32-64,12`);
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
    ctx.fillStyle = color.lighten(1.1);
    ctx.fill(bg);

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke(p);
  }
}
