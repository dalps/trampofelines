import { drawGrid } from "./lib/CanvasUtils";
import { CircleCollider, CollisionManager } from "./lib/Collisions2D";
import { ElasticLine, ElasticShape } from "./lib/ElasticLine";
import { Attraction, Ball, Gravity, Repulsion } from "./lib/Physics2D";
import { Ripple, RippleManager } from "./lib/Ripple";
import Math2D, { lerp, Point2 } from "./lib/utils";
import { Pane } from "tweakpane";
import Clock from "./lib/Clock";
import "./style.css";

let cw = 480;
let ch = 480;

let container: HTMLDivElement;
let canvas: HTMLCanvasElement;
let canvasRect: DOMRect;
let ctx: CanvasRenderingContext2D;
let pane: Pane;

let balls: Ball[] = [];
let lines: ElasticLine[] = [];

let p1: Point2 | undefined;
let p2: Point2 | undefined;
let mouseDown = false;
let distance = 0;
let drawing = false;

const settings = {
  showJoints: true,
  showForces: false,
  play: true,
  colliderRadius: 20,
  lineMass: 2,
  ballMass: 3,
  ballRadius: 10,
  ballVelocity: new Point2(0, 5),
  gravity: true,
};

function setSize() {
  // canvas.width = innerWidth;
  // canvas.height = innerHeight;

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

  // canvas.style.border = "1px solid #444";

  container.appendChild(canvas);

  setSize();
  clear();

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

  function resolveMousePosition(e: MouseEvent) {
    if (e.offsetX) {
      return new Point2(e.offsetX, e.offsetY);
    }

    return new Point2(e.layerX, e.layerY);
  }

  canvasRect = canvas.getBoundingClientRect();

  function resolveTouchPosition(e: Touch) {
    // get canvas relative coordinates
    const canvasPos = new Point2(canvasRect.left, canvasRect.top);
    const touchPos = new Point2(e.clientX, e.clientY);

    return touchPos.subI(canvasPos);
  }

  canvas.addEventListener("mousedown", handleMouseDown, false);
  canvas.addEventListener("mousemove", handleMouseMove, false);
  canvas.addEventListener("mouseup", handleMouseUp, false);

  canvas.addEventListener("touchstart", handleTouchStart, false);
  canvas.addEventListener("touchmove", handleTouchMove, false);
  canvas.addEventListener("touchend", handleTouchEnd, false);

  function handleTouchStart(e: TouchEvent) {
    p1 = resolveTouchPosition(e.touches[0]);
    mouseDown = true;
  }

  function handleTouchMove(e: TouchEvent) {
    e.preventDefault();

    if (!mouseDown) {
      p1 = p2 = undefined;
      return;
    }

    distance = p1 && p2 ? p1.sub(p2).l2() : 0;
    p2 = resolveTouchPosition(e.touches[0]);
  }

  function handleTouchEnd(e: TouchEvent) {
    e.preventDefault();

    endStroke();
  }

  function handleMouseDown(e: MouseEvent) {
    p1 = resolveMousePosition(e);
    mouseDown = true;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!mouseDown) {
      p1 = p2 = undefined;
      return;
    }

    distance = p1 && p2 ? p1.sub(p2).l2() : 0;
    p2 = resolveMousePosition(e);
  }

  function handleMouseUp() {
    endStroke();
  }

  function endStroke() {
    mouseDown = false;
    drawing = false;

    if (!p1 || !p2 || distance < 100) {
      distance < 20 && p1 && spawnBall(p1);
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
      j.attachCollider(new CircleCollider(j.position, settings.colliderRadius));
      balls.forEach((b) => CollisionManager.register(j, b));
    });

    p1 = p2 = undefined;
  }

  window.addEventListener("resize", setSize);

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
    ocoGravity.magnitude = ev.value ? 9.81 : 0;
  });
  pane
    .addButton({
      title: "Reset scene",
    })
    .on("click", () => {
      balls = [];
      lines = [];
    });

  requestAnimationFrame(draw);
}

function clear() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, cw, ch);

  drawGrid(canvas, ctx, {
    color: "#444",
    lineWidth: 1,
    sep: 20,
    offsetX: -10,
    offsetY: -10,
  });
}

function draw(time: number) {
  time *= 0.01;
  const dt = Clock.update(time);

  clear();

  settings.play && CollisionManager.update(dt);

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

  lines.forEach((l) => {
    settings.play && l.update(dt);

    l.draw(ctx, { color: "white", lineWidth: 10 });
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
