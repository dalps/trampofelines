import { drawTitle } from "./backdrops/Title";
import { CollisionManager } from "./engine/Collisions2D";
import {
  drawLives,
  gameOver,
  GAMESTATE,
  restart,
  settings,
  State,
  title,
} from "./engine/GameState";
import { RippleManager } from "./engine/Ripple";
import sfx from "./engine/sfx";
import { Stage } from "./engine/Stage";
import { zzfxP } from "./engine/zzfx";
import { Basket } from "./entities/Basket";
import TrampofelineManager from "./entities/Trampofeline";
import { City } from "./entities/City";
import { BasketballCourt } from "./levels/BasketballCourt";
import { Point } from "./utils/MathUtils";
import { Clock, type timestamp } from "./utils/TimeUtils";
const { balls } = GAMESTATE;

function init() {
  Stage.init(document.getElementById("stage"));

  TrampofelineManager.init();

  // BasketballCourt.init(new Point(Stage.cw * 0.5, Stage.ch * 0.5));
  City.init();

  title();

  requestAnimationFrame(draw);
}

/**
 * The game loop
 */
function draw(time: timestamp) {
  time *= 0.01;
  Clock.update(time);

  switch (GAMESTATE.state) {
    case State.Title:
      Stage.setActiveLayer("bg");
      drawTitle();
      break;
    case State.GameOver:
    case State.Playing:
      Stage.setActiveLayer("game");
      Stage.clearLayer("game");

      const { cw, ch } = Stage;

      GAMESTATE.tubes.forEach((tube) => tube.draw());
      GAMESTATE.baskets.forEach((basket) => basket.updateAndDraw());

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
        if (threadEndPos.y > ch) {
          CollisionManager.unregisterBody(b);
          GAMESTATE.state === State.Playing && zzfxP(sfx.drop);
          GAMESTATE.balls.delete(b.id);
          GAMESTATE.lives = Math.max(0, GAMESTATE.lives - 1);

          GAMESTATE.state === State.Playing && drawLives();
          GAMESTATE.lives <= 0 && gameOver();
          return;
        }

        const threshold = b.radius * 0.5;
        if (b.position.x - threshold < 0 || b.position.x + threshold > cw) {
          b.velocity.x *= -1;
        }

        Stage.setActiveLayer("game");

        settings.play && b.updateAndDraw();

        b.draw();
        settings.showForces && b.drawForces();
        settings.showForces && b.drawCollider();
      });

      // settings.showForces && BasketballCourt.backBoard.collider.draw();
      // settings.showForces && BasketballCourt.hoop.collider.draw();

      RippleManager.updateAndDraw();

      break;
  }

  requestAnimationFrame(draw);
}

init();
