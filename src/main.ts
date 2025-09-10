import Game from "./engine/GameState";
import { Stage } from "./engine/Stage";
import { TweenManager } from "./engine/tween";
import TrampofelineManager from "./entities/Trampofeline";
import { City } from "./scenes/City";
import { Clock, type timestamp } from "./utils/TimeUtils";
import { Title2 } from "./scenes/Title2";

function init() {
  Stage.init();
  TrampofelineManager.init();
  City.init();
  City.draw()
  Title2.intro();
  
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
