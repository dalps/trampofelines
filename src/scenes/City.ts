import palette, { HSLColor } from "../engine/color";
import Game, { State } from "../engine/GameState";
import { DynamicBody } from "../engine/Physics2D";
import { Stage } from "../engine/Stage";
import { makeGradient } from "../utils/CanvasUtils";
import { distribute, Point } from "../utils/MathUtils";
import { Basket } from "../entities/Basket";
import { Tube } from "../entities/Tube";
import type { Backdrop } from "./Backdrop";
import { CollisionManager } from "../engine/Collisions2D";
import { drawLives } from "../engine/ui";

export class City {
  static init() {
    const { cw, ch } = Stage;

    Game.baskets.push(
      new Basket(new Point(cw * 0.8, ch - 100)),
      new Basket(new Point(cw * 0.8, 100))
    );

    Game.baskets.forEach((b) => b.drawTexture());

    Game.tubes.push(new Tube(new Point(0, 100)));
  }

  static update() {
    const { cw, ch } = Stage;

    Game.tubes.forEach((tube) => tube.draw());
    Game.baskets.forEach((basket) => basket.update());

    Game.yarnballs.forEach((b, i) => {
      const threadEndPos = b.thread.at(-1).position;
      if (threadEndPos.y > ch) {
        CollisionManager.unregisterBody(b);
        // Game.state === State.Playing && zzfxP(sfx.drop);
        Game.yarnballs.delete(b.id);
        Game.lives = Math.max(0, Game.lives - 1);

        Game.state === State.Playing && drawLives();
        Game.lives <= 0 && Game.gameOver();
        return;
      }

      const threshold = b.radius * 0.5;
      if (
        b.position.x - threshold < 0 ||
        b.position.x + threshold > cw ||
        b.position.y + threshold > ch
      ) {
        b.velocity.x *= -1;
      }

      Stage.setActiveLayer("game");

      b.update();
      b.draw();
    });
  }

  static draw() {}

  static drawBackground() {
    Stage.setActiveLayer("bg");
    const { ctx, cw, ch } = Stage;

    const nightSky = makeGradient(new Point(0, 0), new Point(0, ch), {
      color1: "hsla(245, 69%, 19%, 1.00)", //
      color2: "hsla(245, 67%, 38%, 1.00)",
      shineSize: 0,
    });
    ctx.fillStyle = nightSky;
    ctx.fillRect(0, 0, cw, ch);

    // skyline
    ctx.fillStyle = makeGradient(new Point(0, ch * 0.5), new Point(0, ch), {
      color1: "#cccccc54",
      color2: "#82828254",
      shineSize: 0,
    });
    ctx.moveTo(0, ch * 0.5);
    const startHeight = ch * 0.9;
    const subs = Math.floor(cw / 70);
    distribute(0, cw, subs, (x) => {
      const h1 = Math.floor(Math.random() * 10) * 15;
      console.log(h1);
      ctx.lineTo(x, startHeight);
      ctx.lineTo(x, startHeight - h1);
      ctx.lineTo(x + cw / subs, startHeight - h1);

      const dice = Math.floor(Math.random() * 10);
      const window = dice < 5;
      if (window) {
        ctx.save();
        ctx.fillStyle = "#fffeac35";
        ctx.fillRect(
          x + 10 + dice * 10,
          startHeight - h1 + 10 + dice * 10,
          10,
          10
        );
        ctx.restore();
      }
    });

    ctx.lineTo(cw, ch);
    ctx.lineTo(0, ch);
    ctx.fill();

    // beams
    // ctx.strokeStyle = "#d62b2b";
    // ctx.fillStyle = "#e74747";
    // ctx.lineWidth = 3;
    // const wallWidth = 20;

    // [0, cw - wallWidth].forEach((x) => {
    //   ctx.fillRect(x, 200, wallWidth, ch);
    //   ctx.strokeRect(x, 200, wallWidth, ch);

    //   ctx.fillRect(x, 200, wallWidth, wallWidth);
    //   ctx.strokeRect(x, 200, wallWidth, wallWidth);
    // });
  }
}
