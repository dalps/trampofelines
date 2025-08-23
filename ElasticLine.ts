import { Attraction, DynamicBody, Force, Repulsion } from "./Physics2D";
import Math2D, { Point2 } from "./utils";

class Joint extends DynamicBody {
  public neighbors: Joint[] = [];
  constructor(position: Point2, mass = 0.1, damping = 1) {
    super(position, mass, damping);
  }

  addNeighbor(t: Joint) {
    this.neighbors.push(t);
    t.neighbors.push(this);

    const attraction = 100;
    const repulsion = 0;
    this.addForce(new Attraction(this.position, t.position, attraction));
    t.addForce(new Attraction(t.position, this.position, attraction));

    this.addForce(new Repulsion(this.position, t.position, repulsion));
    t.addForce(new Repulsion(t.position, this.position, repulsion));
  }

  update(dt: number): void {
    super.update(dt);
  }
}

/* o<--->o<--->o<--->o<--.. */
export class ElasticLine {
  public joints: Joint[] = [];

  constructor(start: Point2, end: Point2, nJoints: number) {
    let prevJoint: Joint | undefined = undefined;

    for (let i = 0; i < nJoints; i++) {
      const joint = new Joint(Math2D.lerp2(start, end, i / (nJoints - 1)));

      prevJoint && joint.addNeighbor(prevJoint);
      this.joints.push(joint);

      // joint.toggleX();

      prevJoint = joint;
    }

    // clamp the extremities
    this.joints.at(0)?.clearForces();
    this.joints.at(-1)?.clearForces();
  }

  draw(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
    ctx.beginPath();
    ctx.moveTo(this.joints[0].position.x, this.joints[0].position.y);

    ctx.fillStyle = "blue";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    this.joints.forEach((a) => {
      ctx.lineTo(a.position.x, a.position.y);
    });

    ctx.lineTo(cw - 10, ch - 10);
    ctx.lineTo(10, ch - 10);
    ctx.lineTo(this.joints[0].position.x, this.joints[0].position.y);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  drawJoints(ctx: CanvasRenderingContext2D, color = "yellow") {
    ctx.fillStyle = color;
    this.joints.forEach((a) => {
      ctx.beginPath();
      ctx.arc(a.position.x, a.position.y, 3, 0, Math.PI * 2);
      ctx.closePath();

      ctx.fill();
      ctx.stroke();
    });
  }

  update(time: number) {
    this.joints.forEach((joint, i) => {
      joint.update(time);
    });
  }
}
