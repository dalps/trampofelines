import { Basket } from "./entities/Basket";
import { BasketballCourt } from "./entities/BasketballCourt";
import TrampofelineManager from "./entities/Trampofeline";
import { Tube } from "./entities/Tube";
import {
  drawLives,
  gameOver,
  GAMESTATE,
  settings,
  State,
  title,
} from "./GameState";
import { CollisionManager } from "./lib/Collisions2D";
import { Point } from "./lib/MathUtils";
import { RippleManager } from "./lib/Ripple";
import { Stage } from "./lib/Stage";
import { Clock, type timestamp } from "./lib/TimeUtils";
import sfx from "./sfx";
import { drawTitle } from "./type";
import { zzfxP } from "./zzfx";

const { balls } = GAMESTATE;

function init() {
  Stage.init(document.getElementById("stage"));

  BasketballCourt.init(new Point(Stage.cw * 0.5, Stage.ch * 0.5));
  TrampofelineManager.init();

  // title();
  GAMESTATE.state = State.Playing;

  requestAnimationFrame(draw);
}

function clear() {
  const { ctx, cw, ch } = Stage;
  ctx.clearRect(0, 0, cw, ch);
}

/**
 * The game loop
 */
function draw(time: timestamp) {
  time *= 0.01;
  Clock.update(time);
  const { dt } = Clock;

  switch (GAMESTATE.state) {
    case State.Title:
      Stage.setActiveLayer("background");
      drawTitle();
      break;
    case State.GameOver:
    case State.Playing:
      Stage.setActiveLayer("game");
      const { cw, ch } = Stage;

      clear();

      GAMESTATE.tubes.forEach((tube) => tube.draw());
      GAMESTATE.basket?.update();

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

      settings.showForces && GAMESTATE.basket?.drawCollider();

      balls.forEach((b, i) => {
        const threadEndPos = b.thread.at(-1).position;
        if (threadEndPos.x < 0 || threadEndPos.x > cw || threadEndPos.y > ch) {
          CollisionManager.unregisterBody(b);
          GAMESTATE.state === State.Playing && zzfxP(sfx.drop);
          GAMESTATE.balls.delete(b.id);
          GAMESTATE.lives = Math.max(0, GAMESTATE.lives - 1);

          GAMESTATE.state === State.Playing && drawLives();
          GAMESTATE.lives <= 0 && gameOver();
          return;
        }

        Stage.setActiveLayer("game");

        settings.play && b.update();

        b.draw();
        settings.showForces && b.drawForces();
        settings.showForces && b.drawCollider();
      });

      settings.showForces && BasketballCourt.backBoard.collider.draw();
      settings.showForces && BasketballCourt.hoop.collider.draw();

      RippleManager.updateAndDraw();

      break;
  }

  requestAnimationFrame(draw);
}

init();
