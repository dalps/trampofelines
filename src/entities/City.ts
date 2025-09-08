import { HSLColor, Palette } from "../engine/Color";
import { GAMESTATE } from "../engine/GameState";
import { DynamicBody } from "../engine/Physics2D";
import { Stage } from "../engine/Stage";
import { makeGradient } from "../utils/CanvasUtils";
import { distribute, Point } from "../utils/MathUtils";
import { Basket } from "./Basket";
import { Tube } from "./Tube";

export class City {
  static init() {
    const { cw, ch } = Stage;
    Basket.drawTexture();
    GAMESTATE.baskets.push(
      new Basket(new Point(cw * 0.8, ch - 100)),
      new Basket(new Point(cw * 0.8, 100))
    );

    GAMESTATE.tubes.push(new Tube(new Point(0, 100)));
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
    // ctx.strokeStyle = "#d62b2bff";
    // ctx.fillStyle = "#e74747ff";
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
