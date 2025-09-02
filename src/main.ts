import { Stage } from "./lib/Stage";
import Trampofelines from "./entities/Trampofeline";
import { Tube } from "./entities/Tube";
import { settings, GAMESTATE as state } from "./GameState";
import { CollisionManager } from "./lib/Collisions2D";
import { Palette } from "./lib/Color";
import { RippleManager } from "./lib/Ripple";
import { Clock, type timestamp } from "./lib/TimeUtils";
import { Point2 } from "./lib/MathUtils";

const { balls, trampolines } = state;

function init() {
  Stage.init(document.getElementById("stage"));

  {
    const { ctx, width: cw, height: ch } = Stage.setActiveLayer("background");
    ctx.fillStyle = Palette.colors.cardboard.toString();
    ctx.fillRect(0, 0, cw, ch);
  }

  {
    const { ctx, width: cw, height: ch } = Stage.setActiveLayer("ui");
    ctx.fillStyle = "blue";
    ctx.clearRect(0, 0, cw, ch);
  }

  Stage.setActiveLayer("game");

  Trampofelines.init();

  state.tubes.push(new Tube(new Point2(0, 100)));

  clear();

  requestAnimationFrame(draw);
}

function clear() {
  const { ctx, width: cw, height: ch } = Stage.layers.get("game");

  ctx.clearRect(0, 0, cw, ch);
}

function draw(time: timestamp) {
  const { width: cw, height: ch } = Stage.layers.get("game");

  time *= 0.01;
  const dt = Clock.update(time);

  clear();

  // drawTitle(ctx, time);

  state.tubes.forEach((tube) => tube.draw());
  state.enemies.forEach((e) => e.draw());

  settings.play && CollisionManager.update(dt);

  Trampofelines.draw(time);

  trampolines.forEach((l) => {
    settings.play && l.update(dt);

    l.draw();
    settings.showJoints && l.drawJoints();

    l.joints.forEach((j) => {
      settings.showForces && j.drawForces();
      settings.showForces && j.drawCollider();
    });
  });

  let ballsToRemove: number[] = [];

  balls.forEach((b, i) => {
    if (
      b._position.x < b.radius ||
      b._position.x > cw + b.radius ||
      // b._position.y < b.radius ||
      b._position.y > ch + b.radius
    ) {
      ballsToRemove.push(i);
      return;
    }

    settings.play && b.update(dt);

    b.draw();
    settings.showForces && b.drawForces();
    settings.showForces && b.drawCollider();
  });

  ballsToRemove.forEach((idx) => {
    balls.splice(idx, 1);
    // unregister the body
  });

  RippleManager.updateAndDraw(dt * 0.1);

  requestAnimationFrame(draw);
}

init();
