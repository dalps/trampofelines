import * as Math2D from "../utils/MathUtils";
import { Point } from "../utils/Point";
import { Pull, DynamicBody, Repulsion } from "./Physics2D";
import { Stage } from "./Stage";
import { instant } from "../utils/TimeUtils";
import PALETTE from "./color";

class Joint extends DynamicBody {
  public neighbors: Joint[] = [];

  constructor(
    position: Point,
    mass = 0.1,
    damping = 1,
    public attraction = 100,
  ) {
    super(position, { name: "Joint", mass, friction: damping });
  }

  addNeighbor(t: Joint) {
    this.neighbors.push(t);
    t.neighbors.push(this);

    this.addForce(new Pull(this.position, t.position, this.attraction));
    t.addForce(new Pull(t.position, this.position, this.attraction));
  }
}

export class ElasticShape {
  public joints: Joint[] = [];
  mass: number;
  damping: number;
  jointsAttraction: number;
  closed: boolean;

  constructor(
    points: Point[],
    {
      mass = 0.05,
      damping = 20,
      jointsAttraction = 100,
      closed = false,
    } = {}
  ) {
    let prevJoint: Joint | undefined;

    this.mass = mass;
    this.damping = damping;
    this.jointsAttraction = jointsAttraction;
    this.closed = closed;

    this.joints = points.map(p => {
      const joint = new Joint(
        p,
        mass,
        damping,
        jointsAttraction,
      );
      prevJoint && joint.addNeighbor(prevJoint);
      prevJoint = joint;
      return joint;
    });

    if (prevJoint && closed) {
      prevJoint.addNeighbor(this.joints[0]);
    }
  }

  update() {
    this.joints.forEach(joint => {
      joint.update();
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
    } = {}
  ) {
    super([], { mass, damping, jointsAttraction });

    let prevJoint: Joint | undefined = undefined;

    for (let i = 0; i < nJoints; i++) {
      const joint = new Joint(
        Math2D.lerp2(start, end, i / (nJoints - 1)),
        mass,
        damping,
        jointsAttraction,
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
