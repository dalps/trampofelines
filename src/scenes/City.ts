import { hsl, default as PALETTE, default as palette } from "../engine/color";
import { drawText, engrave, FONT } from "../engine/font";
import Game from "../engine/GameState";
import { Stage } from "../engine/Stage";
import { Tube } from "../entities/Tube";
import {
  billBoard as billboard,
  makeGradient,
  star,
} from "../utils/CanvasUtils";
import { distribute, lerp } from "../utils/MathUtils";
import { Point } from "../utils/Point";

export class City {
  static init() {
    Game.tubes.push(
      new Tube(new Point(-200, 100)),
      new Tube(new Point(Stage.stage.clientWidth + 200, 100), { right: true })
    );
  }

  static draw() {
    Stage.setActiveLayer("bg");
    const { ctx, cw, ch } = Stage;

    // sky
    const nightSky = makeGradient(new Point(0, 0), new Point(0, ch), {
      color1: hsl(245, 69, 19), // hsl(245, 69%, 19%)
      color2: hsl(245, 67, 38), // hsl(245, 67%, 38%)
      shineSize: 0,
    });
    ctx.fillStyle = nightSky;
    ctx.fillRect(0, 0, cw, ch);

    // stars
    ctx.fillStyle = makeGradient(new Point(0, 0), new Point(0, ch), {
      color1: PALETTE.white.toAlpha(0.5),
      color2: PALETTE.white.toAlpha(0),
      shineSize: 0,
    });
    for (let i = 0; i < 100; i++) {
      const x = lerp(0, cw, Math.random());
      const y = lerp(0, ch, Math.random());
      ctx.fillRect(x, y, 2, 2);
    }

    distribute(50, cw - 50, 10, (x, i) => {
      const y = lerp(0, ch * 0.6, Math.random());
      const even = i % 2 === 0;
      star(new Point(x, y), {
        points: 4,
        outerRadius: even ? 8 : 1,
        innerRadius: even ? 2 : 5,
        ctx,
        fill: even
          ? PALETTE.brightYellow.toAlpha(0.5)
          : PALETTE.blue3.toAlpha(0.5),
      });
      ctx.closePath();
    });

    // skyline
    ctx.fillStyle = makeGradient(new Point(0, ch * 0.5), new Point(0, ch), {
      color1: hsl(245, 33, 44), // hsla(246, 33%, 44%, 1.00) hsla(0, 0%, 80%, 0.33)
      color2: hsl(245, 41, 42), // hsla(245, 41%, 42%, 1.00) hsla(0, 0%, 51%, 0.33)
      shineSize: 0,
    });
    ctx.moveTo(0, ch * 0.5);
    const startHeight = ch * 0.9;
    const subs = Math.floor(cw / 70);
    const heights = [];

    distribute(0, cw, subs, x => {
      const h1 = Math.floor(Math.random() * 10) * 15;
      heights.push(h1);
      ctx.lineTo(x, startHeight);
      ctx.lineTo(x, startHeight - h1);
      ctx.lineTo(x + cw / (subs - 1), startHeight - h1);
    });

    ctx.lineTo(cw, ch);
    ctx.lineTo(0, ch);
    ctx.fill();

    const colorWindow = hsl(245, 21, 51);
    ctx.fillStyle = colorWindow; // hsla(246, 21%, 51%, 1.00) hsla(59, 100%, 84%, 0.20)
    distribute(0, cw, subs, (x, i) => {
      const dice = Math.floor(Math.random() * 10);
      if (dice < 5) {
        ctx.fillRect(
          x + 10 + dice * 10,
          startHeight - heights[i] + 10 + dice * 10,
          10,
          10
        );
      }
    });

    // beams
    {
      const color1 = hsl(245, 30, 51); // hsla(245, 29%, 51%, 1.00);
      const color2 = hsl(245, 30, 45); // hsla(245, 30%, 39%, 1.00);
      ctx.lineWidth = 3;
      const wallWidth = 20;

      [0, cw - wallWidth].forEach(x => {
        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.moveTo(x + wallWidth * 3, 300);
        ctx.lineTo(x + wallWidth * 3 + 50, 300 + 45);
        ctx.lineTo(x + wallWidth * 3 + 50, ch);
        ctx.lineTo(x + wallWidth * 3, ch);
        ctx.fill();

        ctx.fillStyle = color1;
        ctx.fillRect(x, 300, wallWidth * 3, ch);

        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.moveTo(x + wallWidth, 200);
        ctx.lineTo(x + wallWidth + 30, 200 + 45);
        ctx.lineTo(x + wallWidth + 30, ch);
        ctx.lineTo(x + wallWidth, ch);
        ctx.fill();

        ctx.fillStyle = color1;
        ctx.fillRect(x, 200, wallWidth, ch);
      });

      // const h = ch * 0.5;
      // const middle = cw * 0.5;
      // ctx.moveTo(50, h);
      // ctx.quadraticCurveTo(middle, h + 50, cw - 50, h);

      // ctx.moveTo(50, h);
      // ctx.quadraticCurveTo(middle, h + 70, cw - 50, h - 20);

      // ctx.moveTo(70, h + 100);
      // ctx.quadraticCurveTo(middle, h + 150, cw - 70, h - 20);

      // ctx.strokeStyle = color2;
      // ctx.stroke();
    }

    // billboards
    let text = "トランポリン";
    let textSize = 36;
    ctx.font = `${textSize}px sans-serif`;
    ctx.textBaseline = "ideographic";
    ctx.textAlign = "left";

    billboard(new Point(60, 350), {
      width: textSize,
      height: textSize * text.length,
      content() {
        const pos = new Point(0, 0);
        Array.from(text).forEach(m => {
          pos.incrY(textSize);
          ctx.strokeStyle = ctx.fillStyle = palette.blue3;
          ctx.strokeText(m, pos.x, pos.y);
          ctx.fillText(m, pos.x, pos.y);
        });
      },
    });

    textSize = 24;
    ctx.font = `${textSize}px Consolas,sans-serif`;
    ctx.textAlign = "left";

    billboard(new Point(cw - 100, 300), {
      right: true,
      width: 48,
      height: 24 * 6,
      content() {
        let pos = new Point(4, 0);

        Array.from("JS13K").forEach(m => {
          pos.incrY(textSize);
          ctx.strokeStyle = ctx.fillStyle = palette.white.toAlpha(0.3);
          ctx.strokeText(m, pos.x, pos.y);
          ctx.fillText(m, pos.x, pos.y);
        });

        pos = new Point(30, 0);
        Array.from("GAMES").forEach(m => {
          pos.incrY(textSize);
          ctx.strokeStyle = ctx.fillStyle = palette.hotPink.toAlpha(0.7);
          ctx.strokeText(m, pos.x, pos.y);
          ctx.fillText(m, pos.x, pos.y);
        });

        // drawText("js13k", { pos: new Point(50, 10), fontSize: 36, fill: palette.blue3 });
        drawText("2025", {
          pos: new Point(24, 24 * 5.5),
          fontSize: 18,
          fill: palette.blue3,
        });
      },
    });

    text = "弹性猫";
    const size = 80;
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ``;
    billboard(new Point(cw - size - 60, 500), {
      width: size,
      height: size,
      right: true,
      content() {
        ctx.drawImage(Stage.getLayer("catFace"), 15, -15);
        ctx.fillStyle = palette.blue3;
        ctx.fillText(text, 40, 80);
      },
    });
  }
}
