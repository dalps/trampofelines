import { BasketballCourt } from "./entities/Basket";
import Trampofelines from "./entities/Trampofeline";
import { Tube } from "./entities/Tube";
import { settings, GAMESTATE as state } from "./GameState";
import { CollisionManager } from "./lib/Collisions2D";
import { Point } from "./lib/MathUtils";
import { RippleManager } from "./lib/Ripple";
import { Stage } from "./lib/Stage";
import { Clock, type timestamp } from "./lib/TimeUtils";

const { balls, trampolines } = state;

function init() {
  Stage.init(document.getElementById("stage"));

  {
    Stage.setActiveLayer("background");
    const { ctx, cw, ch } = Stage;
    ctx.fillStyle = "#F5DEB3";
    ctx.fillRect(0, 0, cw, ch);
    BasketballCourt.draw();
  }

  {
    Stage.setActiveLayer("ui");
    const { ctx, cw, ch } = Stage;
    ctx.clearRect(0, 0, cw, ch);
  }

  Stage.setActiveLayer("game");

  Trampofelines.init();

  state.tubes.push(new Tube(new Point(0, 100)));

  clear();

  requestAnimationFrame(draw);
}

function clear() {
  Stage.setActiveLayer("game");
  const { ctx, cw, ch } = Stage;

  ctx.clearRect(0, 0, cw, ch);
}

function draw(time: timestamp) {
  time *= 0.01;
  const dt = Clock.update(time);

  Stage.setActiveLayer("game");
  const { ctx, cw, ch } = Stage;

  clear();

  ctx.drawImage(
    Stage.getLayer("basket"),
    200 + Math.cos(time * 0.1) * 50,
    200 + Math.sin(time * 0.1) * 200
  );

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
      b.position.x < b.radius ||
      b.position.x > cw + b.radius ||
      // b.position.y < b.radius ||
      b.position.y > ch + b.radius
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
