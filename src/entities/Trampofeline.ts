import { CircleCollider, CollisionManager } from "../lib/Collisions2D";
import { ElasticLine } from "../lib/ElasticLine";
import { Ball, Gravity } from "../lib/Physics2D";
import {
  lerp,
  Point2,
  resolveMousePosition,
  resolveTouchPosition,
} from "../lib/utils";
import type { GameState } from "../main";

let canvasRect: DOMRect;

let p1: Point2 | undefined;
let p2: Point2 | undefined;
let mouseDown = false;
let distance = 0;
let drawing = false;

export default class Trampofelines {
  static init(state: GameState, canvas: HTMLCanvasElement) {
    const { lines, balls, settings } = state;

    canvasRect = canvas.getBoundingClientRect();

    canvas.addEventListener("mousedown", handleMouseDown, false);
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);

    canvas.addEventListener("touchstart", handleTouchStart, false);
    canvas.addEventListener("touchmove", handleTouchMove, false);
    canvas.addEventListener("touchend", handleTouchEnd, false);

    function handleTouchStart(e: TouchEvent) {
      p1 = resolveTouchPosition(canvasRect, e.touches[0]);
      mouseDown = true;
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();

      if (!mouseDown) {
        p1 = p2 = undefined;
        return;
      }

      drawing = true;
      distance = p1 && p2 ? p1.sub(p2).l2() : 0;
      p2 = resolveTouchPosition(canvasRect, e.touches[0]);
    }

    function handleTouchEnd(e: TouchEvent) {
      e.preventDefault();

      endStroke();
    }

    function handleMouseDown(e: MouseEvent) {
      e.preventDefault();

      p1 = resolveMousePosition(e);
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
      distance = p1 && p2 ? p1.sub(p2).l2() : 0;
      p2 = resolveMousePosition(e);
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

      const line = new ElasticLine(p1, p2, 10, {
        damping: 2,
        mass: 2,
        jointsAttraction: 220,
        jointsRepulsion: 50,
      });

      lines.push(line);

      line.joints.forEach((j) => {
        j.addForce(Gravity);
        j.attachCollider(
          new CircleCollider(j.position, state.settings.colliderRadius)
        );
        balls.forEach((b) => CollisionManager.register(j, b));
      });

      p1 = p2 = undefined;
    }
  }

  static draw(ctx: CanvasRenderingContext2D, time: number) {
    if (p1 && p2 && distance >= 20) {
      ctx.lineWidth = 10;
      ctx.strokeStyle = `rgba(${
        distance < 100 ? `255,0,0` : `255,255,255`
      },${lerp(0.3, 0.4, Math.sin(time))})`;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  static isDrawing() {
    return drawing;
  }
}
