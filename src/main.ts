import { drawGrid } from "./lib/CanvasUtils";
import { CircleCollider, CollisionManager } from "./lib/Collisions2D";
import { ElasticShape } from "./lib/ElasticLine";
import { Attraction, Ball, Gravity, Repulsion } from "./lib/Physics2D";
import { Ripple, RippleManager } from "./lib/Ripple";
import Math2D, { lerp, Point2, resolveMousePosition } from "./lib/utils";
import { Pane } from "tweakpane";
import Trampofelines, { Trampofeline } from "./entities/Trampofeline";
import "./style.css";
import { Clock, type timestamp } from "./lib/TimeUtils";
import { drawTitle, toranporin } from "./type";
import { Tube } from "./entities/Tube";
import { GAMESTATE as state, settings } from "./GameState";
import { Ironwool } from "./entities/Ironwool";
import { JumboCat } from "./entities/JumboCat";

let cw = 480;
let ch = 480;

let container: HTMLDivElement;
let canvas: HTMLCanvasElement;
let canvasRect: DOMRect;
let ctx: CanvasRenderingContext2D;
let pane: Pane;

const { balls, lines } = state;

function setSize() {
  cw = canvas.width = container.clientWidth;
  ch = canvas.height = container.clientHeight;

  canvasRect = canvas.getBoundingClientRect();
}

function init() {
  canvas = document.createElement("canvas");
  container = document.getElementById("app");

  ctx = canvas.getContext("2d")!;

  canvas.width = cw;
  canvas.height = ch;

  container.appendChild(canvas);

  setSize();
  clear();

  Trampofelines.init(state, canvas);

  state.lines.push(new JumboCat(new Point2(500, 500), new Point2(200, 50), 7));

  //   new Trampofeline(
  //     new Point2(cw * 0.2, ch * 0.5),
  //     new Point2(cw * 0.8, ch * 0.5),
  //     10,
  //     {
  //       mass: 10,
  //       jointsAttraction: 100,
  //       jointsRepulsion: 100,
  //     }
  //   )
  // );

  window.addEventListener("resize", setSize);

  // canvas.addEventListener("click", (e) => {
  //   if (Trampofelines.isDrawing()) return;

  //   spawnBall(resolveMousePosition(e));
  // });

  setupPanes();

  state.tubes.push(
    new Tube(new Point2(0, 100)),
    new Tube(new Point2(0, 200), new Point2(40, 200)),
    new Tube(new Point2(0, 400), new Point2(80, 50))
  );

  state.enemies.push(
    new Ironwool(new Point2(200, 500)),
    new Ironwool(new Point2(350, 500)),
    new Ironwool(new Point2(500, 500))
  );

  requestAnimationFrame(draw);
}

function setupPanes() {
  pane = new Pane({ title: "Settings", expanded: false });
  pane.addBinding(settings, "showJoints");
  pane.addBinding(settings, "showForces");
  pane.addBinding(settings, "play");
  pane.addBinding(settings, "ballRadius", { min: 1, max: 20 });
  pane.addBinding(settings, "ballMass", {
    min: 0,
    max: 10,
  });
  pane.addBinding(settings, "ballVelocity");
  pane
    .addBinding(settings, "colliderRadius", { min: 0, max: 20 })
    .on("change", (ev) => {
      lines.forEach((l) => {
        l.joints.forEach((j) => {
          j.collider!.radius = ev.value;
        });
      });
    });
  pane
    .addBinding(settings, "lineMass", { min: 0, max: 20 })
    .on("change", (ev) => {
      lines.forEach((l) => {
        l.joints.forEach((j) => {
          j.mass = ev.value;
        });
      });
    });
  pane.addBinding(settings, "gravity").on("change", (ev) => {
    Gravity.magnitude = ev.value ? 9.81 : 0;
  });
  pane
    .addButton({
      title: "Reset scene",
    })
    .on("click", () => {
      balls.splice(0);
      lines.splice(0);
    });
}

function clear() {
  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, cw, ch);

  drawGrid(canvas, ctx, {
    color: "#ddd",
    lineWidth: 1,
    sep: 20,
    offsetX: 0,
    offsetY: 0,
  });

  toranporin(ctx);
}

function draw(time: timestamp) {
  time *= 0.01;
  const dt = Clock.update(time);

  clear();

  // drawTitle(ctx, time);

  state.tubes.forEach((tube) => tube.draw(ctx));
  state.enemies.forEach((e) => e.draw(ctx));

  settings.play && CollisionManager.update(dt);

  Trampofelines.draw(ctx, time);

  lines.forEach((l) => {
    settings.play && l.update(dt);

    l.draw(ctx);
    settings.showJoints && l.drawJoints(ctx);

    l.joints.forEach((j) => {
      settings.showForces && j.drawForces(ctx);
      settings.showForces && j.drawCollider(ctx);
    });
  });

  let ballsToRemove: number[] = [];

  balls.forEach((b, i) => {
    if (
      b._position.x < b.radius ||
      b._position.x > cw + b.radius ||
      b._position.y < b.radius ||
      b._position.y > ch + b.radius
    ) {
      ballsToRemove.push(i);
      return;
    }

    settings.play && b.update(dt);

    b.draw(ctx);
    settings.showForces && b.drawForces(ctx);
    settings.showForces && b.drawCollider(ctx);
  });

  ballsToRemove.forEach((idx) => {
    balls.splice(idx, 1);
    // unregister the body
  });

  RippleManager.updateAndDraw(ctx, dt * 0.1);

  requestAnimationFrame(draw);
}

init();
