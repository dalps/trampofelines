import { GAMESTATE } from "../engine/GameState";
import { circle } from "../utils/CanvasUtils";
import {
  CircleCollider,
  CollisionManager,
  downwardFilter,
} from "../engine/Collisions2D";
import palette, { setTransparency } from "../engine/color";
import { ElasticLine } from "../engine/ElasticLine";
import Math2D, { damp, lerp, Point, RAD2DEG } from "../utils/MathUtils";
import { Gravity, State } from "../engine/Physics2D";
import { Ripple } from "../engine/Ripple";
import { Stage } from "../engine/Stage";
import { Clock } from "../utils/TimeUtils";
import { zzfxP } from "../engine/zzfx";
import sfx from "../engine/sfx";

let p1: Point | undefined;
let p2: Point | undefined;
let p3: Point | undefined;
let p4: Point | undefined;
let inter: Point | undefined;
let mouseDown = false;
let distance = 0;
let drawing = false;
let valid = true;
let soundInterval: number;
let mouseSpeed = 0;

const { nightBlue: coatColor, blueGray: detailColor } = palette;
const MAX_CATS = 3;
const MIN_LENGTH = 100;
const MAX_STEEPNESS_TO_90 = 25;

export default class TrampofelineManager {
  private static entities: Map<string, Trampofeline> = new Map();

  public static get trampolines() {
    return Array.from(this.entities.values());
  }

  static enableUI() {
    Stage.stage.appendChild(Stage.getLayer("ui"));
  }

  static disableUI() {
    p1 = p2 = undefined;
    soundInterval && clearInterval(soundInterval);

    const ui = Stage.getLayer("ui");
    if (ui.parentElement) {
      Stage.stage.removeChild(ui);
    }
  }

  static init() {
    Stage.setActiveLayer("game");

    const ui = Stage.getLayer("ui");

    ui.addEventListener("mousedown", handleMouseDown, false);
    ui.addEventListener("mousemove", handleMouseMove, false);
    ui.addEventListener("mouseup", handleMouseUp, false);

    ui.addEventListener("touchstart", handleTouchStart, false);
    ui.addEventListener("touchmove", handleTouchMove, false);
    ui.addEventListener("touchend", handleTouchEnd, false);

    function handleTouchStart(e: TouchEvent) {
      p1 = ui.resolveTouchPosition(e.touches[0]);
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
      p2 = ui.resolveTouchPosition(e.touches[0]);
    }

    function handleTouchEnd(e: TouchEvent) {
      e.preventDefault();

      endStroke();
    }

    function handleMouseDown(e: MouseEvent) {
      e.preventDefault();

      p1 = ui.resolveMousePosition(e);

      Stage.setActiveLayer("game");

      soundInterval = setInterval(
        () => mouseSpeed > 2 && zzfxP(sfx.drawing),
        50
      );

      mouseDown = true;
    }

    function handleMouseMove(e: MouseEvent) {
      e.preventDefault();

      mouseSpeed = Math.hypot(e.movementX, e.movementY);

      if (!mouseDown || e.buttons === 0) {
        mouseDown = false;
        drawing = false;
        p1 = p2 = undefined;
        clearInterval(soundInterval);
        return;
      }

      drawing = true;
      distance = p1 && p2 ? p1.sub(p2).abs() : 0;
      p2 = ui.resolveMousePosition(e);
    }

    function handleMouseUp(e: MouseEvent) {
      e.preventDefault();

      endStroke();
    }

    function endStroke() {
      mouseDown = false;
      clearInterval(soundInterval);

      if (!p1 || !p2 || distance < 100) {
        distance < 20 && p1;
        p1 = p2 = undefined;
        distance = 0;
        return;
      }

      valid && TrampofelineManager.makeCat();
      console.log(valid);
      valid && zzfxP(sfx.meow);
      !valid && zzfxP(sfx.badPlacement);

      p1 = p2 = undefined;
    }
  }

  static makeCat() {
    if (!p1 || !p2 || p1.equals(p2)) return;

    console.log("hello?");

    const cat = new Trampofeline(p2, p1, 10, {
      damping: 2,
      mass: 2,
      jointsAttraction: 220,
      jointsRepulsion: 50,
    });

    cat.id = crypto.randomUUID();
    this.entities.set(cat.id, cat);

    cat.joints.forEach((j) => {
      GAMESTATE.settings.gravity && j.addForce(Gravity);

      j.attachCollider(
        new CircleCollider(j.position, GAMESTATE.settings.colliderRadius)
      );

      GAMESTATE.balls.forEach((b) =>
        CollisionManager.register(j, b, {
          filter: downwardFilter,
          cb: () => {
            new Ripple(j.position, 15, 30, 0.3, 0);
            zzfxP(sfx.bounce);
            TrampofelineManager.killCat(cat);
          },
        })
      );
    });
  }

  static killCat(cat: Trampofeline) {
    cat.joints.forEach((j) => {
      j.state = State.Dead;
      CollisionManager.unregisterBody(j);
    });
    cat.kill();
    setTimeout(() => this.entities.delete(cat.id), 500);
  }

  static testPlacement(): boolean {
    let sep: Point;
    let angle: number;
    valid =
      distance >= MIN_LENGTH &&
      TrampofelineManager.entities.size < MAX_CATS &&
      Array.from(TrampofelineManager.entities.values()).filter(({ joints }) => {
        p3 = joints.at(0).position;
        p4 = joints.at(-1).position;
        inter = Math2D.properInter(p1, p2, p3, p4);
        return inter;
      }).length === 0;
    return valid;
  }

  static drawGuides(time: number) {
    Stage.setActiveLayer("ui");
    Stage.clearLayer("ui");

    const { ctx } = Stage;

    if (!p1 || !p2) return;

    ctx.lineWidth = 10;
    ctx.lineDashOffset = -time * 5;
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

  static isDrawing() {
    return drawing;
  }
}

export class Trampofeline extends ElasticLine {
  private _transparency = 1;
  public id: string;
  private _killed = false;

  update() {
    super.update();
    this._killed &&
      (this._transparency = damp(this._transparency, 0, 0.5, Clock.dt));
  }

  kill() {
    this._killed = true;
  }

  draw() {
    const { ctx } = Stage;
    setTransparency(this._transparency);

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
      drawCatRear();
      ctx.restore();
    }

    // if (p1 && p2 && p3 && p4 && inter) {
    //   popsicle(p1, p2, "red");
    //   popsicle(p3, p4, "blue");
    //   popsicle(inter, inter, "yellow");
    // }

    setTransparency(1);
  }
}

export function drawCatFace({
  coatColor = palette.nightBlue,
  detailColor = palette.blueGray,
  pink = palette.pink,
  white = palette.white,
  black = palette.black,
  drawPaws = true,
} = {}) {
  const { ctx } = Stage;

  if (drawPaws) {
    // arms & paws
    ctx.strokeStyle = coatColor;
    ctx.lineCap = "round";
    ctx.lineWidth = 10;
    const pawDistance = 10;
    [pawDistance, -pawDistance].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 40);
      ctx.stroke();

      ctx.save();
      ctx.strokeStyle = detailColor;
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
  }

  // face
  const innerEarX = 10;
  const earY = -20;
  const earHeight = 10;

  ctx.lineWidth = 2;
  ctx.fillStyle = coatColor;
  ctx.strokeStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(20, -20);
  // ctx.quadraticCurveTo(0, 50, -20, -20);
  ctx.bezierCurveTo(40, 30, -40, 30, -20, -20);

  // ears
  [innerEarX, -innerEarX].forEach((x, i) => {
    ctx.moveTo(x, earY);
    ctx.lineTo(x + (i === 1 ? -1 : 1) * 5, earY - earHeight);
    ctx.lineTo(x + (i === 1 ? -1 : 1) * 10, earY);
  });
  ctx.stroke();
  ctx.fill();

  // stripes
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, -15);
  ctx.moveTo(-3, -20);
  ctx.lineTo(-3, -17);
  ctx.moveTo(3, -20);
  ctx.lineTo(3, -17);
  ctx.stroke();

  // eyes
  const eyeY = -10;
  const outerEye = 5;
  const innerEye = 2;

  ctx.fillStyle = white;
  circle(new Point(10, eyeY), outerEye);
  ctx.fill();
  circle(new Point(-10, eyeY), outerEye);
  ctx.fill();

  ctx.fillStyle = black;
  circle(new Point(10, eyeY), innerEye);
  ctx.fill();
  circle(new Point(-10, eyeY), innerEye);
  ctx.fill();

  // whiskers
  ctx.strokeStyle = white;
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

  // snout
  ctx.fillStyle = pink;
  ctx.strokeStyle = black;
  ctx.beginPath();
  circle(new Point(0, 0), 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // mouth
  ctx.strokeStyle = detailColor;
  ctx.beginPath();
  const mouthY = 5;
  const mouthAngle = 5;
  const mouthWidth = 7;
  ctx.moveTo(-mouthWidth, mouthY);
  ctx.quadraticCurveTo(-mouthAngle, 10, 0, mouthY);
  ctx.quadraticCurveTo(mouthAngle, 10, mouthWidth, mouthY);
  ctx.stroke();
}

export function drawCatRear() {
  const { time } = Clock;
  const { ctx } = Stage;

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

    circle(new Point(0, -3), 3);
    ctx.fill();
    circle(new Point(4, 2), 2);
    ctx.fill();
    circle(new Point(0, 4), 2);
    ctx.fill();
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
