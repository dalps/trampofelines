import Math2D, { Point } from "./MathUtils";
import { Attraction, DynamicBody, Repulsion } from "./Physics2D";
import { Stage } from "./Stage";
import { instant } from "./TimeUtils";

class Joint extends DynamicBody {
  public neighbors: Joint[] = [];
  constructor(
    position: Point,
    mass = 0.1,
    damping = 1,
    public attraction = 100,
    public repulsion = 50
  ) {
    super(position, { name: "joint", mass, friction: damping });
  }

  addNeighbor(t: Joint) {
    this.neighbors.push(t);
    t.neighbors.push(this);

    this.addForce(new Attraction(this.position, t.position, this.attraction));
    t.addForce(new Attraction(t.position, this.position, this.attraction));

    this.addForce(new Repulsion(this.position, t.position, this.repulsion));
    t.addForce(new Repulsion(t.position, this.position, this.repulsion));
  }

  update(dt: instant): void {
    super.update(dt);
  }
}

export class ElasticShape {
  public joints: Joint[] = [];
  mass: number;
  damping: number;
  jointsAttraction: number;
  jointsRepulsion: number;
  closed: boolean;

  constructor(
    points: Point[],
    {
      mass = 0.05,
      damping = 20,
      jointsAttraction = 100,
      jointsRepulsion = 100,
      closed = false,
    } = {}
  ) {
    let prevJoint: Joint | undefined;

    this.mass = mass;
    this.damping = damping;
    this.jointsAttraction = jointsAttraction;
    this.jointsRepulsion = jointsRepulsion;
    this.closed = closed;

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

  draw({
    fillColor = "black",
    strokeColor = "black",
    lineWidth = 1,
    lineCap = "round" as CanvasLineCap,
    stroke = true,
    fill = true,
  } = {}) {
    const ctx = Stage.ctx;

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;

    ctx.beginPath();
    ctx.moveTo(this.joints[0].position.x, this.joints[0].position.y);
    this.joints.forEach((j) => {
      ctx.lineTo(j.position.x, j.position.y); // consider using bezier curves for a smooth line
    });
    this.closed && ctx.closePath();
    stroke && ctx.stroke();
    fill && ctx.fill();
  }

  drawJoints(colors = ["yellow", "magenta", "cyan"]) {
    const ctx = Stage.ctx;

    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    this.joints.forEach((j, i) => {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(j.position.x, j.position.y, 3, 0, Math.PI * 2);
      ctx.closePath();

      ctx.fill();
      ctx.stroke();
    });
  }

  update(dt: instant) {
    this.joints.forEach((joint) => {
      joint.update(dt);
    });
  }
}

export class ElasticTightLoop extends ElasticShape {
  constructor(
    points: Point[],
    public mass = 0.05,
    public damping = 20,
    public jointsAttraction = 100,
    public jointsRepulsion = 100,
    public closed = false
  ) {
    super([], {
      mass,
      damping,
      jointsAttraction,
      jointsRepulsion,
      closed: true,
    });

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
    start: Point,
    end: Point,
    nJoints: number,
    {
      toggleX = false,
      toggleY = false,
      mass = 1,
      damping = 1,
      jointsAttraction = 100,
      jointsRepulsion = 100,
    } = {}
  ) {
    super([], { mass, damping, jointsAttraction, jointsRepulsion });

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
    this.joints.at(0)?.toggleFixed();
    this.joints.at(-1)?.toggleFixed();
  }
}
