import { CollisionManager } from "../engine/Collisions2D";
import PALETTE from "../engine/color";
import palette, { hsl } from "../engine/color";
import Game, { State } from "../engine/GameState";
import { Stage } from "../engine/Stage";
import { drawLives } from "../engine/ui";
import { Basket } from "../entities/Basket";
import { Tube } from "../entities/Tube";
import { circle, makeGradient, star } from "../utils/CanvasUtils";
import Math2D, { distribute, lerp } from "../utils/MathUtils";
import { Point } from "../utils/Point";
import { Alert } from "../engine/Alert";

export class City {
  static init() {
    const { cw, ch } = Stage;

    Game.baskets.push(
      new Basket(new Point(cw * 0.8, ch - 100)),
      new Basket(new Point(cw * 0.8, 100))
    );

    Game.baskets.forEach(b => b.drawTexture());

    Game.tubes.push(new Tube(new Point(0, 100)));
  }

  static update() {
    Stage.setActiveLayer("game");
    const { cw, ch } = Stage;

    Game.tubes.forEach(tube => tube.draw());
    Game.baskets.forEach(basket => basket.update());

    Game.yarnballs.forEach((b, i) => {
      const threadEndPos = b.thread.at(-1).position;
      if (threadEndPos.y > ch) {
        new Alert(
          new Point(b.position.x, ch),
          `Missed ${Game.TOTAL_LIVES - Game.lives + 1}`,
          {
            startRadius: 0,
            finalRadius: 50,
            finalTransparency: 1,
          }
        );

        b.die();

        // Game.state === State.Playing && zzfxP(sfx.drop);
        Game.lives = Math.max(0, Game.lives - 1);
        Game.state === State.Playing && drawLives();
        Game.lives <= 0 && Game.gameOver();

        return;
      }

      const threshold = b.radius * 0.5;
      if (b.position.x - threshold < 0 || b.position.x + threshold > cw) {
        b.velocity.x *= -1.1;
      }

      Stage.setActiveLayer("game");

      b.update();
      b.draw();
    });
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

    ctx.fillStyle = hsl(245, 21, 51); // hsla(246, 21%, 51%, 1.00) hsla(59, 100%, 84%, 0.20)
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
      ctx.strokeStyle = hsl(0, 68, 50); //hsla(0, 68%, 50%, 1.00);
      ctx.fillStyle = hsl(0, 77, 59); //hsla(0, 77%, 59%, 1.00);
      ctx.lineWidth = 3;
      const wallWidth = 20;

      [0, cw - wallWidth].forEach(x => {
        ctx.fillRect(x, 200, wallWidth, ch);
        ctx.strokeRect(x, 200, wallWidth, ch);

        ctx.fillRect(x, 200, wallWidth, wallWidth);
        ctx.strokeRect(x, 200, wallWidth, wallWidth);
      });
    }

    // billboard 1
    {
      const pos = new Point(30, 300);
      const billboard = new Path2D();
      const billboard2 = new Path2D();
      const text = "トランポリン";
      const textSize = 36;
      const padding = 5;
      [padding * 3, textSize * text.length - padding * 2].forEach(y => {
        ctx.lineWidth = 4;
        ctx.strokeStyle = palette.blue0;
        ctx.beginPath();
        ctx.moveTo(0, pos.y + y);
        ctx.lineTo(30, pos.y + y);
        ctx.stroke();
      });
      billboard.roundRect(
        pos.x,
        pos.y,
        textSize + padding * 2,
        textSize * text.length + padding * 2,
        10
      );
      billboard2.roundRect(
        pos.x - padding,
        pos.y - padding,
        textSize + padding * 4,
        textSize * text.length + padding * 4,
        5
      );
      ctx.fillStyle = palette.blue1;
      ctx.fill(billboard2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = palette.blue3;
      ctx.stroke(billboard);

      ctx.font = `${textSize}px sans-serif`;
      ctx.textBaseline = "ideographic";
      ctx.textAlign = "left";

      pos.incrX(padding).incrY(padding);
      Array.from(text).forEach(m => {
        pos.incrY(textSize);
        ctx.strokeStyle = palette.blue3;
        ctx.strokeText(m, pos.x, pos.y);
        ctx.fillStyle = palette.blue3;
        ctx.fillText(m, pos.x, pos.y);
      });
    }

    // right billboard
    {
      const billboard = new Path2D();
      const billboard2 = new Path2D();
      const text = "弹性猫";
      const size = 80;
      const padding = 5;
      const totalSize = size + padding * 2;
      const pos = new Point(cw - totalSize - 30, 500);
      [padding * 3, size - padding * 2].forEach(y => {
        ctx.lineWidth = 4;
        ctx.strokeStyle = palette.blue0;
        ctx.beginPath();
        ctx.moveTo(pos.x + totalSize, pos.y + y);
        ctx.lineTo(pos.x + totalSize + 30, pos.y + y);
        ctx.stroke();
      });
      billboard.roundRect(pos.x, pos.y, totalSize, totalSize, 10);
      billboard2.roundRect(
        pos.x - padding,
        pos.y - padding,
        size + padding * 4,
        size + padding * 4,
        5
      );
      ctx.fillStyle = palette.blue1;
      ctx.fill(billboard2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = palette.blue3;
      ctx.stroke(billboard);

      ctx.drawImage(Stage.getLayer("catFace"), pos.x + 20, pos.y - 14);
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = palette.blue3;
      ctx.fillText(text, pos.x + 44, pos.y + 84);
    }
  }
}
