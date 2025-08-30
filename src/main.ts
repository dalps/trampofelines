import { drawGrid } from "./lib/CanvasUtils";
import { CircleCollider, CollisionManager } from "./lib/Collisions2D";
import { ElasticLine, ElasticShape } from "./lib/ElasticLine";
import { Attraction, Ball, Gravity, Repulsion } from "./lib/Physics2D";
import { Ripple, RippleManager } from "./lib/Ripple";
import Math2D, { lerp, Point2, resolveMousePosition } from "./lib/utils";
import { Pane } from "tweakpane";
import Trampofelines, { Trampofeline } from "./entities/Trampofeline";
import "./style.css";
import { Clock, type timestamp } from "./lib/TimeUtils";
import { drawTitle, toranporin } from "./type";

let cw = 480;
let ch = 480;

let container: HTMLDivElement;
let canvas: HTMLCanvasElement;
let canvasRect: DOMRect;
let ctx: CanvasRenderingContext2D;
let pane: Pane;

const settings = {
  showJoints: false,
  showForces: false,
  play: true,
  colliderRadius: 20,
  lineMass: 2,
  ballMass: 3,
  ballRadius: 10,
  ballVelocity: new Point2(0, 5),
  gravity: false,
};

export interface GameState {
  balls: Ball[];
  lines: ElasticLine[];
  settings: typeof settings;
}

let state: GameState = {
  balls: [],
  lines: [],
  settings,
};

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

  // lines.push(
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

  function makeBall(
    startPos: Point2,
    color = ["coral", "fuchsia", "chartreuse", "pink"][
      Math.floor(Math.random() * 3)
    ]
  ) {
    const ball = new Ball(startPos.clone(), settings.ballRadius, color);

    ball.attachCollider(new CircleCollider(ball.position, ball.radius));
    ball.velocity.set(settings.ballVelocity.x, settings.ballVelocity.y);
    ball.mass = settings.ballMass;
    ball.addForce(Gravity);

    balls.push(ball);

    return ball;
  }

  function spawnBall(pos: Point2) {
    const ball = makeBall(pos.clone());

    new Ripple(pos.clone(), 20, 30);

    lines.forEach((l) =>
      l.joints.forEach((j) => CollisionManager.register(j, ball))
    );
  }

  window.addEventListener("resize", setSize);

  canvas.addEventListener("click", (e) => {
    if (Trampofelines.isDrawing()) return;

    spawnBall(resolveMousePosition(e));
  });

  // Set up panes
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

  requestAnimationFrame(draw);
}

function clear() {
  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, cw, ch);

  drawGrid(canvas, ctx, {
    color: "#ddd",
    lineWidth: 1,
    sep: 20,
    offsetX: -10,
    offsetY: -10,
  });

  toranporin(ctx);
  drawTitle(ctx);
}

function draw(time: timestamp) {
  time *= 0.01;
  const dt = Clock.update(time);

  clear();

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

  balls.forEach((b) => {
    settings.play && b.update(dt);

    b.draw(ctx);
    settings.showForces && b.drawForces(ctx);
    settings.showForces && b.drawCollider(ctx);
  });

  RippleManager.updateAndDraw(ctx, dt * 0.1);

  requestAnimationFrame(draw);
}

init();
