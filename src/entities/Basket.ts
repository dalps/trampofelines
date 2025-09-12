import { Alert } from "../engine/Alert";
import { SegmentCollider } from "../engine/Collisions2D";
import palette from "../engine/color";
import { Firework } from "../engine/Firework";
import { drawText } from "../engine/font";
import { DynamicBody } from "../engine/Physics2D";
import { Stage } from "../engine/Stage";
import { Tween } from "../engine/tween";
import { popsicle } from "../utils/CanvasUtils";
import { DEG2RAD, distribute, lerp } from "../utils/MathUtils";
import { Point } from "../utils/Point";
import { Clock } from "../utils/TimeUtils";
import { YarnBall } from "./YarnBall";
import { Entity } from "./Entity";
import Game from "../engine/GameState";
import { drawLives } from "../engine/ui";

export class Basket extends DynamicBody implements Entity {
  id: string;
  content: YarnBall[] = [];
  filled = false;

  constructor(pos: Point, public wanted = 5) {
    super(pos);
    this.name = "Basket";
    this.id = crypto.randomUUID();
    const colliderWidth = 100;
    this.toggleX();
    this.toggleY();
    this.attachCollider(new SegmentCollider(pos, colliderWidth));
    Stage.newOffscreenLayer(this.id, 200, 200);
  }

  addYarnball(b: YarnBall) {
    this.content.push(b);
    this.drawTexture();
  }

  update() {
    const { time, dt } = Clock;
    const { cw, ch } = Stage;
    const c = this.collider as SegmentCollider;

    // this.position.x = lerp(100, cw - 100, Math.cos(time * 0.05) * 0.5 + 0.5);

    const da = Math.cos(time * 0.05) * -1 * DEG2RAD * dt;
    c.dir += da;
    c.center.rotate(da);

    // Is it filled up?
    if (!this.filled && this.content.length >= this.wanted) {
      new Firework(this.position, {
        startRadius: 5,
        finalRadius: 100,
        speed: 3,
        color: palette.brightYellow,
        color2: palette.white,
      });
      new Alert(this.position, `nice!`, {
        startRadius: 0,
        finalRadius: 50,
        finalTransparency: 1,
      });
      new Tween(this.position, "y", {
        startValue: this.position.y,
        finalValue: -200,
        speed: 1,
      });
      this.filled = true;
      Game.stock += 1;
      drawLives();
    }

    // draw
    Stage.setActiveLayer("game");
    const { ctx } = Stage;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(c.dir);
    ctx.drawImage(Stage.getLayer(this.id), -100, -90);
    ctx.restore();
  }

  static drawCrissCrossPattern() {
    Stage.newOffscreenLayer("pattern", 16, 16);
    Stage.setActiveLayer("pattern");
    const { ctx, cw, ch } = Stage;

    ctx.fillStyle = palette.basket1;
    ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = palette.basket2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cw, ch);
    ctx.moveTo(cw, 0);
    ctx.lineTo(0, ch);
    ctx.stroke();
  }

  drawTexture() {
    Stage.setActiveLayer(this.id);
    const { ctx } = Stage;

    ctx.save();
    ctx.translate(100, 100);
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    const basket = new Path2D(
      `m -69,-12.5 c -37.6,75.2 175.6,75.2 137.9,0 0,16.5 -137.9,16.3 -137.9,0 z`
    );
    const empty =
      new Path2D(`m 0,0 c -38.2,0 -69,-5.7 -69,-12.5 -0,-6.9 30.7,-12.5 68.7,-12.5 38.3,-0 69.3,5.6 69.3,12.5 C 69,-5.7 38.2,0 0,0
Z`);
    const emptyDown = new Path2D(`m -69,-12.5 c -0,16.4 137.9,16.4 137.9,0`);
    const handle = new Path2D(
      `M 21.9 -0.9 C 21.9 -0.9 25.1 -50.2 0 -50.2 C -25.1 -50.2 -21.9 -25.1 -21.9 -25.1 L -28.2 -25.1 C -28.2 -25.1 -31.3 -56.4 0 -56.4 C 31.3 -56.4 28.2 -0.9 28.2 -0.9 Z`
    );

    const pattern = ctx.createPattern(Stage.getLayer("pattern"), "repeat");

    ctx.lineWidth = 5;
    ctx.strokeStyle = palette.basket2;
    ctx.fillStyle = pattern;
    ctx.stroke(empty);
    ctx.fill(empty);

    ctx.fillStyle = palette.black.toAlpha(0.7);
    ctx.fill(empty);

    if (this.content.length === 5) {
      popsicle(new Point(45, 0), new Point(60, -50), palette.gray);
      popsicle(new Point(40, 0), new Point(45, -60), palette.gray);
    }

    const slots = distribute(-40, 40, this.wanted);
    this.content.slice(0, 5).forEach((b, i) =>
      YarnBall.drawTexture(new Point(slots[i], i % 2 === 0 ? -10 : -5), {
        color: b.color,
        radius: b.radius,
        lineWidth: 2,
      })
    );

    ctx.fillStyle = pattern;
    ctx.fill(basket);

    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.basket2;
    ctx.stroke(basket);

    ctx.lineWidth = 5;
    ctx.stroke(emptyDown);

    ctx.lineWidth = 2;
    ctx.fillStyle = pattern;
    ctx.fill(handle);
    ctx.stroke(handle);

    drawText(`${Math.max(0, this.wanted - this.content.length)}`, {
      pos: new Point(0, 20),
      fontSize: 36,
    });

    ctx.restore();
  }
}
