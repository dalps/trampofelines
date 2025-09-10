import { CollisionManager } from "../engine/Collisions2D";
import palette, { hsl } from "../engine/color";
import Game, { State } from "../engine/GameState";
import { Stage } from "../engine/Stage";
import { drawLives } from "../engine/ui";
import { Basket } from "../entities/Basket";
import { Tube } from "../entities/Tube";
import { circle, makeGradient } from "../utils/CanvasUtils";
import { distribute, Point } from "../utils/MathUtils";

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
        // Game.lives <= 0 && Game.gameOver();
        return;
      }

      const threshold = b.radius * 0.5;
      if (b.position.x - threshold < 0 || b.position.x + threshold > cw) {
        b.velocity.x *= -1;
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

    // skyline
    ctx.fillStyle = makeGradient(new Point(0, ch * 0.5), new Point(0, ch), {
      color1: hsl(0, 0, 80, 0.33), // hsla(0, 0%, 80%, 0.33)
      color2: hsl(0, 0, 50, 0.33), // hsla(0, 0%, 51%, 0.33)
      shineSize: 0,
    });
    ctx.moveTo(0, ch * 0.5);
    const startHeight = ch * 0.9;
    const subs = Math.floor(cw / 70);
    distribute(0, cw, subs, (x) => {
      const h1 = Math.floor(Math.random() * 10) * 15;
      ctx.lineTo(x, startHeight);
      ctx.lineTo(x, startHeight - h1);
      ctx.lineTo(x + cw / subs, startHeight - h1);

      const dice = Math.floor(Math.random() * 10);
      const window = dice < 5;
      if (window) {
        ctx.save();
        ctx.fillStyle = hsl(59, 100, 84, 0.2); // hsla(59, 100%, 84%, 0.20)
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
    {
      ctx.strokeStyle = hsl(0, 68, 50); //hsla(0, 68%, 50%, 1.00);
      ctx.fillStyle = hsl(0, 77, 59); //hsla(0, 77%, 59%, 1.00);
      ctx.lineWidth = 3;
      const wallWidth = 20;

      [0, cw - wallWidth].forEach((x) => {
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
      [padding * 3, textSize * text.length - padding * 2].forEach((y) => {
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
      Array.from(text).forEach((m) => {
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
      [padding * 3, size - padding * 2].forEach((y) => {
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
