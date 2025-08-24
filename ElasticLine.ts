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

export class ElasticShape {
  public joints: Joint[] = [];

  constructor(
    points: Point2[],
    public mass = 0.05,
    public damping = 20,
    public jointsAttraction = 100,
    public jointsRepulsion = 100,
    public closed = false
  ) {
    let prevJoint: Joint | undefined;

    this.joints = points.map((p) => {
      const joint = new Joint(
        p,
        mass,
        damping,
        jointsAttraction,
        jointsRepulsion
      );
      prevJoint && joint.addNeighbor(prevJoint);
      prevJoint = joint;
      return joint;
    });

    if (prevJoint && closed) {
      prevJoint.addNeighbor(this.joints[0]);
    }
  }

  draw(ctx: CanvasRenderingContext2D, { color = "black", lineWidth = 1 } = {}) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(this.joints[0].position.x, this.joints[0].position.y);
    this.joints.forEach((j) => {
      ctx.lineTo(j.position.x, j.position.y);
    });
    this.closed && ctx.closePath();
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
    this.joints.forEach((joint) => {
      joint.update(time);
    });
  }
}

export class ElasticTightLoop extends ElasticShape {
  constructor(
    points: Point2[],
    public mass = 0.05,
    public damping = 20,
    public jointsAttraction = 100,
    public jointsRepulsion = 100,
    public closed = false
  ) {
    super([], mass, damping, jointsAttraction, jointsRepulsion, true);

    this.joints = points.map((p) => {
      const joint = new Joint(
        p,
        mass,
        damping,
        jointsAttraction,
        jointsRepulsion
      );
      return joint;
    });

    this.joints.forEach((j) => {
      this.joints.forEach((j2) => {
        if (j.position.x !== j2.position.x && j.position.y !== j2.position.y) {
          j.addNeighbor(j2);
        }
      });
    });
  }
}

/* o<--->o<--->o<--->o<--.. */
export class ElasticLine extends ElasticShape {
  constructor(
    start: Point2,
    end: Point2,
    nJoints: number,
    toggleX = false,
    toggleY = false,
    public mass = 0.05,
    public damping = 20,
    public jointsAttraction = 100,
    public jointsRepulsion = 0
  ) {
    super([], mass, damping, jointsAttraction, jointsRepulsion);

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
}
