import { Attraction, DynamicBody, Force, Repulsion } from "./Physics2D";
import Math2D, { Point2 } from "./utils";

class Joint extends DynamicBody {
  public neighbors: Joint[] = [];
  constructor(
    position: Point2,
    mass = 0.1,
    damping = 1,
    public attraction = 100,
    public repulsion = 50
  ) {
    super(position, mass, damping);
  }

  addNeighbor(t: Joint) {
    this.neighbors.push(t);
    t.neighbors.push(this);

    this.addForce(new Attraction(this.position, t.position, this.attraction));
    t.addForce(new Attraction(t.position, this.position, this.attraction));

    this.addForce(new Repulsion(this.position, t.position, this.repulsion));
    t.addForce(new Repulsion(t.position, this.position, this.repulsion));
  }

  update(dt: number): void {
    super.update(dt);
  }
}

/* o<--->o<--->o<--->o<--.. */
export class ElasticLine {
  public joints: Joint[] = [];

  constructor(
    start: Point2,
    end: Point2,
    nJoints: number,
    toggleX = false,
    toggleY = false,
    public mass = 0.1,
    public damping = 1,
    public jointsAttraction = 100,
    public jointsRepulsion = 30
  ) {
    let prevJoint: Joint | undefined = undefined;

    for (let i = 0; i < nJoints; i++) {
      const joint = new Joint(
        Math2D.lerp2(start, end, i / (nJoints - 1)),
        mass,
        damping,
        jointsAttraction,
        jointsRepulsion
      );

      prevJoint && joint.addNeighbor(prevJoint);
      this.joints.push(joint);

      toggleX && joint.toggleX();
      toggleY && joint.toggleY();

      prevJoint = joint;
    }

    // clamp the extremities
    this.joints.at(0)?.clearForces();
    this.joints.at(-1)?.clearForces();
  }

  draw(ctx: CanvasRenderingContext2D, { color = "black", lineWidth = 1 } = {}) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(this.joints[0].position.x, this.joints[0].position.y);
    this.joints.forEach((j) => {
      ctx.lineTo(j.position.x, j.position.y);
    });
    ctx.stroke();
  }

  drawJoints(
    ctx: CanvasRenderingContext2D,
    colors = ["yellow", "magenta", "cyan"]
  ) {
    this.joints.forEach((j, i) => {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(j.position.x, j.position.y, 3, 0, Math.PI * 2);
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
