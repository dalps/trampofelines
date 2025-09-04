import { GAMESTATE } from "../GameState";
import { circle } from "../lib/CanvasUtils";
import { CircleCollider, CollisionManager } from "../lib/Collisions2D";
import { Palette } from "../lib/Color";
import { ElasticLine } from "../lib/ElasticLine";
import Math2D, { damp, lerp, Point, RAD2DEG } from "../lib/MathUtils";
import { Gravity, State } from "../lib/Physics2D";
import { Stage } from "../lib/Stage";
import type { instant, timestamp } from "../lib/TimeUtils";

let p1: Point | undefined;
let p2: Point | undefined;
let p3: Point | undefined;
let p4: Point | undefined;
let inter: Point | undefined;
let mouseDown = false;
let distance = 0;
let drawing = false;

const {
  nightBlue: coatColor,
  blueGray: detailColor,
  white,
  black,
  pink,
} = Palette.colors;
const MAX_CATS = 3;
const MIN_LENGTH = 100;
const MAX_STEEPNESS_TO_90 = 25;

export default class Trampofelines {
  static init() {
    const { trampolines, balls, settings } = GAMESTATE;
    const uiCanvas = Stage.getLayer("ui");

    uiCanvas.addEventListener("mousedown", handleMouseDown, false);
    uiCanvas.addEventListener("mousemove", handleMouseMove, false);
    uiCanvas.addEventListener("mouseup", handleMouseUp, false);

    uiCanvas.addEventListener("touchstart", handleTouchStart, false);
    uiCanvas.addEventListener("touchmove", handleTouchMove, false);
    uiCanvas.addEventListener("touchend", handleTouchEnd, false);

    function handleTouchStart(e: TouchEvent) {
      p1 = uiCanvas.resolveTouchPosition(e.touches[0]);
      mouseDown = true;
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();

      if (!mouseDown) {
        p1 = p2 = undefined;
        return;
      }

      drawing = true;
      distance = p1 && p2 ? p1.sub(p2).abs() : 0;
      p2 = uiCanvas.resolveTouchPosition(e.touches[0]);
    }

    function handleTouchEnd(e: TouchEvent) {
      e.preventDefault();

      endStroke();
    }

    function handleMouseDown(e: MouseEvent) {
      e.preventDefault();

      p1 = uiCanvas.resolveMousePosition(e);
      mouseDown = true;
    }

    function handleMouseMove(e: MouseEvent) {
      e.preventDefault();

      if (!mouseDown) {
        drawing = false;
        p1 = p2 = undefined;
        return;
      }

      drawing = true;
      distance = p1 && p2 ? p1.sub(p2).abs() : 0;
      p2 = uiCanvas.resolveMousePosition(e);
    }

    function handleMouseUp(e: MouseEvent) {
      e.preventDefault();

      endStroke();
    }

    function endStroke() {
      mouseDown = false;

      if (!p1 || !p2 || distance < 100) {
        distance < 20 && p1;
        p1 = p2 = undefined;
        distance = 0;
        return;
      }

      if (!Trampofelines.testPlacement()) {
        p1 = p2 = undefined;
        return;
      }

      const cat = new Trampofeline(p2, p1, 10, {
        damping: 2,
        mass: 2,
        jointsAttraction: 220,
        jointsRepulsion: 50,
      });

      trampolines.push(cat);

      cat.joints.forEach((j) => {
        settings.gravity && j.addForce(Gravity);
        j.attachCollider(
          new CircleCollider(j.position, GAMESTATE.settings.colliderRadius)
        );

        balls.forEach((b) =>
          CollisionManager.register(
            j,
            b,
            (b1, b2) => {
              // only react if ball is in descending motion AND strictly above the joint
              const isDescending = b2.velocity.y >= 0;
              const aboveJoint = b2.position.y < b1.position.y;
              return isDescending && aboveJoint;
            },
            () => {
              console.log("hello?");
              // cat.kill();
            }
          )
        );
      });

      p1 = p2 = undefined;
    }
  }

  static testPlacement(): boolean {
    const longEnough = distance >= MIN_LENGTH;
    const belowLimit = GAMESTATE.trampolines.length < MAX_CATS;
    const intersections = GAMESTATE.trampolines.filter(({ joints }) => {
      p3 = joints.at(0).position;
      p4 = joints.at(-1).position;
      inter = Math2D.properInter(p1, p2, p3, p4);
      return inter;
    });
    const noIntersections = intersections.length === 0;
    const sep = p2.sub(p1);
    const angle = Math.abs(Math.atan2(sep.y, sep.x)) * RAD2DEG;
    const goodAngle =
      angle <= 90 - MAX_STEEPNESS_TO_90 || angle >= 90 + MAX_STEEPNESS_TO_90;
    return longEnough && belowLimit && noIntersections && goodAngle;
  }

  static draw(time: number) {
    const ctx = Stage.ctx;

    if (p1 && p2 && distance >= 20) {
      ctx.lineWidth = 10;
      ctx.setLineDash([5, 15]);
      ctx.strokeStyle = `rgba(${
        this.testPlacement() ? `0,0,0` : `255,0,0`
      },${lerp(0.6, 0.8, Math.sin(time))})`;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.setLineDash([]);
    }
  }

  static isDrawing() {
    return drawing;
  }
}

export class Trampofeline extends ElasticLine {
  private _time: timestamp = 0;
  private _transparency = 1;
  private _killed = false;

  kill() {
    // this._killed = true;
    console.log(`Killing trampoline...`);
    this.joints.forEach((j) => {
      j.state = State.Dead;
      CollisionManager.unregister(j.collisionID!);
    });
  }

  update(dt: instant): void {
    super.update(dt);
    this._killed && (this._transparency = damp(this._transparency, 0, 0.5, dt));
    this._time += dt;
  }

  draw(): void {
    const ctx = Stage.ctx;
    Palette.setTransparency(this._transparency);

    ctx.lineWidth = 25;
    ctx.strokeStyle = `${coatColor}`;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(this.joints[0].position.x, this.joints[0].position.y);
    this.joints.forEach((j) => {
      ctx.lineTo(j.position.x, j.position.y);
    });
    this.closed && ctx.closePath();
    ctx.stroke();

    // draw the face at the first joint (where the mouse motion started)
    {
      const j0 = this.joints[0].position;
      const j1 = this.joints[1].position;
      const dir = j0.sub(j1);
      const angle = Math.atan2(-dir.x, dir.y);

      ctx.save();
      ctx.translate(j0.x, j0.y);
      ctx.rotate(angle);
      drawCatFace();
      ctx.restore();
    }

    // draw the butt & the tail at the last joint (where the mouse was lifted)
    {
      const lastJoint = this.joints.at(-1)!.position;
      const sndLastJoint = this.joints.at(-2)!.position;
      const dir = lastJoint.sub(sndLastJoint).normalize();
      const angle = Math.atan2(-dir.x, dir.y);

      ctx.save();
      ctx.translate(lastJoint.x, lastJoint.y);
      ctx.rotate(angle);
      drawCatRear(this._time);
      ctx.restore();
    }

    // if (p1 && p2 && p3 && p4 && inter) {
    //   popsicle(p1, p2, "red");
    //   popsicle(p3, p4, "blue");
    //   popsicle(inter, inter, "yellow");
    // }
  }
}

export function drawCatFace() {
  const ctx = Stage.ctx;

  // arms & paws
  ctx.strokeStyle = coatColor.toString();
  ctx.lineWidth = 10;
  const pawDistance = 10;
  [pawDistance, -pawDistance].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 40);
    ctx.stroke();

    ctx.save();
    ctx.strokeStyle = detailColor.toString();
    ctx.lineWidth = 2;
    ctx.translate(x, 40);

    ctx.beginPath();
    ctx.moveTo(2, 4);
    ctx.lineTo(2, 0);
    ctx.moveTo(-2, 4);
    ctx.lineTo(-2, 0);
    ctx.stroke();
    ctx.restore();
  });

  // face
  ctx.fillStyle = coatColor.toString();
  ctx.beginPath();
  ctx.moveTo(20, -20);
  // ctx.quadraticCurveTo(0, 50, -20, -20);
  ctx.bezierCurveTo(40, 30, -40, 30, -20, -20);
  ctx.closePath();
  ctx.fill();

  // eyes
  const eyeY = -10;
  const outerEye = 5;
  const innerEye = 2;

  ctx.fillStyle = `${white}`;
  ctx.beginPath();
  circle(new Point(10, eyeY), outerEye);
  circle(new Point(-10, eyeY), outerEye);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = `${black}`;
  ctx.beginPath();
  circle(new Point(10, eyeY), innerEye);
  circle(new Point(-10, eyeY), innerEye);
  ctx.closePath();
  ctx.fill();

  // whiskers
  ctx.strokeStyle = `${white}`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const start = 5;
  const end = 20;
  [
    [-start, -end],
    [start, end],
  ].forEach(([start, end]) => {
    [-5, 0, 5].forEach((y) => {
      ctx.moveTo(start, 0);
      ctx.lineTo(end, y);
    });
  });
  ctx.stroke();

  // ears
  ctx.fillStyle = coatColor.toString();
  ctx.strokeStyle = detailColor.toString();
  const innerEarX = 10;
  const earY = -18;
  const earHeight = 10;

  ctx.beginPath();
  [innerEarX, -innerEarX].forEach((x, i) => {
    ctx.moveTo(x, earY);
    ctx.lineTo(x + (i === 1 ? -1 : 1) * 5, earY - earHeight);
    ctx.lineTo(x + (i === 1 ? -1 : 1) * 10, earY);
    ctx.stroke();
    ctx.fill();
  });

  // snout
  ctx.fillStyle = `${pink}`;
  ctx.strokeStyle = `${black}`;
  ctx.beginPath();
  circle(new Point(0, 0), 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // mouth
  ctx.strokeStyle = detailColor.toString();
  ctx.beginPath();
  const mouthY = 5;
  const mouthAngle = 5;
  const mouthWidth = 7;
  ctx.moveTo(-mouthWidth, mouthY);
  ctx.quadraticCurveTo(-mouthAngle, 10, 0, mouthY);
  ctx.quadraticCurveTo(mouthAngle, 10, mouthWidth, mouthY);
  ctx.stroke();
}

export function drawCatRear(time = 0) {
  const ctx = Stage.ctx;

  // butt
  ctx.fillStyle = coatColor.toString();
  ctx.lineWidth = 2;
  ctx.beginPath();
  circle(new Point(0, 0), 20);
  ctx.fill();

  // that part
  ctx.strokeStyle = detailColor.toString();
  ctx.beginPath();
  ctx.moveTo(2, 4);
  ctx.lineTo(-2, 0);
  ctx.moveTo(-2, 4);
  ctx.lineTo(2, 0);
  ctx.stroke();

  // arms & paws
  ctx.strokeStyle = coatColor.toString();
  ctx.lineWidth = 10;
  const pawDistance = 10;
  [pawDistance, -pawDistance].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 40);
    ctx.stroke();

    ctx.save();
    ctx.strokeStyle = detailColor.toString();
    ctx.lineWidth = 2;
    ctx.translate(x, 40);

    ctx.fillStyle = detailColor.toString();
    ctx.beginPath();
    circle(new Point(0, -3), 3);
    ctx.closePath();
    circle(new Point(4, 2), 2);
    ctx.closePath();
    circle(new Point(0, 4), 2);
    ctx.closePath();
    circle(new Point(-4, 2), 2);
    ctx.fill();

    ctx.restore();
  });

  // tail
  const tailSegmentSize = 40;
  const t = Math.sin(time * 0.1) * 0.5 + 0.5;
  const tailSwerve = lerp(-15, 15, t);
  const tailSegments = 2;
  const startY = -7;
  ctx.strokeStyle = coatColor.toString();
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (
    let i = 0, y = tailSegmentSize;
    i < tailSegments;
    i++, y += tailSegmentSize
  ) {
    ctx.quadraticCurveTo(
      (i % 2 === 0 ? -1 : 1) * tailSwerve,
      tailSegmentSize * 0.5 + i * tailSegmentSize + startY,
      0,
      y + startY
    );
  }
  ctx.stroke();
}
