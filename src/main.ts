import { Basket } from "./entities/Basket";
import { BasketballCourt } from "./entities/BasketballCourt";
import TrampofelineManager from "./entities/Trampofeline";
import { Tube } from "./entities/Tube";
import {
  drawLives,
  gameOver,
  settings,
  State,
  GAMESTATE as state,
} from "./GameState";
import { star } from "./lib/CanvasUtils";
import { CollisionManager } from "./lib/Collisions2D";
import { DEG2RAD, Point } from "./lib/MathUtils";
import { RippleManager } from "./lib/Ripple";
import { Stage } from "./lib/Stage";
import { Clock, type timestamp } from "./lib/TimeUtils";
import sfx from "./sfx";
import { zzfxP } from "./zzfx";

const { balls } = state;

function init() {
  Stage.init(document.getElementById("stage"));
  const { ctx, cw, ch } = Stage;
  
  {
    Stage.setActiveLayer("background");
    BasketballCourt.draw();
  }

  {
    Stage.setActiveLayer("ui");
    ctx.clearRect(0, 0, cw, ch);
    drawLives();
  }

  TrampofelineManager.init();

  state.basket = new Basket(new Point(cw * 0.5, ch * 0.5));
  state.tubes.push(new Tube(new Point(0, 100)));
  state.tubes.push(new Tube(new Point(0, 500)));

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
  Clock.update(time);
  const { dt } = Clock;

  Stage.setActiveLayer("game");
  const { ctx, cw, ch } = Stage;

  clear();

  // drawTitle(ctx, time);

  state.tubes.forEach((tube) => tube.draw());
  state.basket.update();

  settings.play && CollisionManager.update();

  TrampofelineManager.trampolines.forEach((l) => {
    settings.play && l.update();

    l.draw();
    settings.showJoints && l.drawJoints();

    l.joints.forEach((j) => {
      settings.showForces && j.drawForces();
      settings.showForces && j.drawCollider();
    });
  });

  TrampofelineManager.drawGuides(time);

  let ballsToRemove: number[] = [];

  settings.showForces && state.basket.drawCollider();

  balls.forEach((b, i) => {
    const threadEndPos = b.thread.at(-1).position;
    if (threadEndPos.x < 0 || threadEndPos.x > cw || threadEndPos.y > ch) {
      CollisionManager.unregisterBody(b);
      state.state === State.Playing && zzfxP(sfx.drop);
      state.balls.delete(b.id);
      state.lives = Math.max(0, state.lives - 1);

      state.state === State.Playing && drawLives();
      state.lives <= 0 && gameOver();
      return;
    }

    Stage.setActiveLayer("game");

    settings.play && b.update();

    b.draw();
    settings.showForces && b.drawForces();
    settings.showForces && b.drawCollider();
  });

  RippleManager.updateAndDraw();

  requestAnimationFrame(draw);
}

init();
