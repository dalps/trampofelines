import { CollisionManager, downwardFilter } from "../engine/Collisions2D";
import palette, { hsl, setTransparency } from "../engine/color";
import { ElasticLine } from "../engine/ElasticLine";
import { EntityManager } from "../engine/EntityManager";
import { Firework } from "../engine/Firework";
import Game, {
  MAX_CATS,
  MIN_CAT_LENGTH,
  TRAMPOFELINES,
  YARNBALLS,
} from "../engine/GameState";
import { Ripple } from "../engine/Ripple";
import sfx from "../engine/sfx";
import { Stage } from "../engine/Stage";
import { Tween } from "../engine/tween";
import { zzfxP } from "../engine/zzfx";
import { circle } from "../utils/CanvasUtils";
import * as Math2D from "../utils/MathUtils";
import { Point } from "../utils/Point";
import { Clock } from "../utils/TimeUtils";
import { YarnBall } from "./YarnBall";

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
let guideColor = hsl(0, 100, 0); // hsla(0, 100%, 0%, 1.00)

const { nightBlue: coatColor, blueGray: detailColor } = palette;

export default class TrampofelineManager extends EntityManager<Trampofeline> {
  enableUI() {
    Stage.stage.appendChild(Stage.getCanvas("ui"));
  }

  disableUI() {
    p1 = p2 = undefined;
    soundInterval && clearInterval(soundInterval);

    const ui = Stage.getCanvas("ui");
    if (ui.parentElement) {
      Stage.stage.removeChild(ui);
    }
  }

  constructor() {
    super();

    const uiLayer = Stage.getLayer("ui");
    const ui = Stage.getCanvas("ui");

    ui.addEventListener("mousedown", handleMouseDown, false);
    ui.addEventListener("mousemove", handleMouseMove, false);
    ui.addEventListener("mouseup", handleMouseUp, false);

    ui.addEventListener("touchstart", handleTouchStart, false);
    ui.addEventListener("touchmove", handleTouchMove, false);
    ui.addEventListener("touchend", handleTouchEnd, false);

    function handleTouchStart(e: TouchEvent) {
      p1 = uiLayer.resolveTouchPosition(e.touches[0]);
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
      p2 = uiLayer.resolveTouchPosition(e.touches[0]);
    }

    function handleTouchEnd(e: TouchEvent) {
      e.preventDefault();

      endStroke();
    }

    function handleMouseDown(e: MouseEvent) {
      e.preventDefault();

      p1 = uiLayer.resolveMousePosition(e);

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
      p2 = uiLayer.resolveMousePosition(e);
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

      valid && TRAMPOFELINES.spawn();
      valid && zzfxP(sfx.meow);
      !valid && zzfxP(sfx.badPlacement);

      p1 = p2 = undefined;
    }
  }

  update() {
    this.list.forEach(l => {
      l.update();
      l.draw();
    });

    this.drawGuides();
  }

  spawn() {
    if (!p1 || !p2 || p1.equals(p2)) return;

    const cat = new Trampofeline(p2, p1, 10, {
      damping: 2,
      mass: 2,
      jointsAttraction: 220,
    });

    this.add(cat);

    YARNBALLS.list.forEach(b => cat.catch(b));

    return cat;
  }

  testPlacement(): boolean {
    valid =
      distance >= MIN_CAT_LENGTH &&
      this.count < MAX_CATS &&
      this.list.filter(({ joints, dead }) => {
        if (dead) return false;

        p3 = joints.at(0).position;
        p4 = joints.at(-1).position;
        inter = Math2D.properInter(p1, p2, p3, p4);

        return inter;
      }).length === 0;
    return valid;
  }

  drawGuides() {
    const { time } = Clock;
    Stage.setActiveLayer("ui");
    Stage.clearLayer();

    const { ctx } = Stage;

    if (!p1 || !p2) return;

    ctx.lineWidth = 10;
    ctx.lineDashOffset = -time * 5;
    ctx.setLineDash([5, 15]);

    guideColor.l = this.testPlacement() ? 0 : 50;
    guideColor.alpha = Math2D.lerp(0.6, 0.8, Math.sin(time));

    ctx.strokeStyle = guideColor;
    ctx.lineCap = ctx.lineJoin = "round";

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
  alpha = 1;
  dead = false;
  public id: string;

  catch(b: YarnBall) {
    this.joints.forEach(j =>
      CollisionManager.register(j, b, {
        // filter: downwardFilter,
        cb: () => {
          new Firework(b.position, {
            points: 2,
            startRadius: 15,
            finalRadius: 50,
            startTransparency: 1,
            color: palette.brightYellow,
            color2: palette.brightYellow,
          });
          zzfxP(sfx.bounce);
          this.die();
        },
      })
    );
  }

  die() {
    this.dead = true;
    this.joints.forEach(j => j.die());

    new Tween(this, "alpha", {
      finalValue: 0,
      onComplete: () => TRAMPOFELINES.delete(this),
    });
  }

  draw() {
    const { ctx } = Stage;
    setTransparency(this.alpha);

    ctx.lineWidth = 25;
    ctx.strokeStyle = coatColor;

    ctx.beginPath();
    ctx.moveTo(this.joints[0].position.x, this.joints[0].position.y);
    this.joints.forEach(j => {
      ctx.lineTo(j.position.x, j.position.y);
    });
    ctx.stroke();

    // draw the face at the first joint (where the pointer landed)
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

    // draw the butt & the tail at the last joint (where the pointer lifted off)
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

  ctx.lineCap = "round";

  if (drawPaws) {
    // arms & paws
    ctx.strokeStyle = coatColor;
    ctx.lineWidth = 10;
    const pawDistance = 10;
    [pawDistance, -pawDistance].forEach(x => {
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

  ctx.lineWidth = 3;
  ctx.fillStyle = coatColor;
  ctx.strokeStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(20, -20);
  // ctx.quadraticCurveTo(0, 50, -20, -20);
  ctx.bezierCurveTo(40, 30, -40, 30, -20, -20);
  ctx.closePath();

  // ears
  [innerEarX, -innerEarX].forEach((x, i) => {
    ctx.moveTo(x, earY);
    ctx.lineTo(x + (i === 1 ? -1 : 1) * 5, earY - earHeight);
    ctx.lineTo(x + (i === 1 ? -1 : 1) * 10, earY);
  });
  ctx.stroke();
  ctx.fill();

  // stripes
  ctx.lineWidth = 2;
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
    [-5, 0, 5].forEach(y => {
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

  ctx.lineCap = "round";

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
  [pawDistance, -pawDistance].forEach(x => {
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
  const tailSwerve = Math2D.lerp(-15, 15, t);
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
