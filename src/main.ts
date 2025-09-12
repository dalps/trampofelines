import Game from "./engine/GameState";
import { Stage } from "./engine/Stage";
import { TweenManager } from "./engine/tween";
import { City } from "./scenes/City";
import { Clock, type timestamp } from "./utils/TimeUtils";

function init() {
  Stage.init();
  Game.init();
  City.init();

  City.draw();

  Game.title();

  requestAnimationFrame(draw);
}

/**
 * The game loop
 */
function draw(time: timestamp) {
  Clock.update(time * 0.01);
  Game.update();
  TweenManager.update();

  requestAnimationFrame(draw);
}

init();
