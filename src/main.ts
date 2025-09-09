import { drawTitle } from "./scenes/Title";
import { CollisionManager } from "./engine/Collisions2D";
import {
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
import { City } from "./scenes/City";
import { BasketballCourt } from "./scenes/BasketballCourt";
import { Point } from "./utils/MathUtils";
import { Clock, type timestamp } from "./utils/TimeUtils";
import { drawLives } from "./engine/ui";
import { TweenManager } from "./engine/tween";

function init() {
  Stage.init(document.getElementById("stage"));

  TrampofelineManager.init();

  City.init();

  restart();

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

      City.update();

      CollisionManager.update();

      TrampofelineManager.trampolines.forEach((l) => {
        l.update();
        l.draw();
        l.drawJoints();
      });

      TrampofelineManager.drawGuides(time);

      break;
  }

  TweenManager.update();

  requestAnimationFrame(draw);
}

init();
