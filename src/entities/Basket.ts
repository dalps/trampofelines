import { Alert } from "../engine/Alert";
import {
  CollisionManager,
  downwardFilter,
  SegmentCollider,
} from "../engine/Collisions2D";
import palette from "../engine/color";
import { EntityManager } from "../engine/EntityManager";
import { Firework } from "../engine/Firework";
import { drawText } from "../engine/font";
import Game, {
  BASKET_COLLIDER_LENGTH,
  BASKETS,
  MAX_BASKETS,
  State,
  YARNBALLS,
} from "../engine/GameState";
import { DynamicBody } from "../engine/Physics2D";
import sfx from "../engine/sfx";
import { Stage } from "../engine/Stage";
import { Tween } from "../engine/tween";
import { drawLives } from "../engine/ui";
import { zzfxP } from "../engine/zzfx";
import { popsicle, star } from "../utils/CanvasUtils";
import { DEG2RAD, distribute, pickRandom } from "../utils/MathUtils";
import { Point } from "../utils/Point";
import { Clock } from "../utils/TimeUtils";
import { YarnBall } from "./YarnBall";

export class BasketManager extends EntityManager<Basket> {
  outro() {
    this.list.forEach(b => b.outro());
  }

  spawn() {
    const spawnPosOptionsX = distribute(100, Stage.cw - 100, 4);
    const spawnPosOptionsY = distribute(280, Stage.ch - 100, 4);
    const posY = pickRandom(
      spawnPosOptionsY.filter(y => !this.list.find(b => b.position.y === y))
    );
    const posX = pickRandom(spawnPosOptionsX);
    const wanted = Math.floor(1 + Math.random() * 5);
    const basket = new Basket(new Point(posX, posY), wanted);
    basket.drawTexture();

    this.add(basket);

    YARNBALLS.list.forEach(b => basket.catch(b));

    return basket;
  }

  update() {
    if (Game.state === State.Playing && this.count < MAX_BASKETS) {
      this.spawn();
    }

    this.list.forEach(b => b.update());
  }
}

export class Basket extends DynamicBody {
  id: string;
  filledFlag = false;
  content: YarnBall[] = [];

  constructor(pos: Point, public wanted = 5) {
    const offScreenX = pos.x <= Stage.cw * 0.5 ? -300 : Stage.cw + 300;
    super(new Point(offScreenX, pos.y));

    this.name = "BK";
    this.id = crypto.randomUUID();

    this.toggleX();
    this.toggleY();

    this.attachCollider(new SegmentCollider(pos, BASKET_COLLIDER_LENGTH));

    Stage.newOffscreenLayer(this.id, 200, 200);

    new Tween(this.position, "x", {
      finalValue: pos.x,
      epsilon: 1,
    });
  }

  get filled(): boolean {
    return this.content.length >= this.wanted;
  }

  outro() {
    new Tween(this.position, "y", {
      startValue: this.position.y,
      finalValue: -200,
      speed: 1,
      epsilon: 1,
      onComplete: () => BASKETS.delete(this),
    });
  }

  catch(b: YarnBall) {
    CollisionManager.register(this, b, {
      sensor: true,
      filter: downwardFilter,
      cb: () => {
        if (Game.state !== State.Playing) return;

        new Firework(b.position, {
          startRadius: 5,
          finalRadius: 50,
          points: 3,
          speed: 4,
          color: b.color,
          color2: palette.white,
        });

        b.die();
        this.addYarnball(b);
        drawLives();
        zzfxP(sfx.score);
      },
    });
  }

  addYarnball(b: YarnBall) {
    this.content.push(b);
    this.drawTexture();
  }

  update() {
    const { time, dt } = Clock;
    const { cw, ch } = Stage;
    const c = this.collider as SegmentCollider;

    // this.position.x = lerp(100, cw- 100, Math.cos(time * 0.05) * 0.5 + 0.5);

    const da = Math.cos(time * 0.05) * -1 * DEG2RAD * dt;
    c.dir += da;
    c.center.rotate(da);

    // Is it filled up?
    if (!this.filledFlag && this.filled) {
      this.filledFlag = true;
      Game.stock += 1;
      CollisionManager.unregisterBody(this);

      // gfx
      new Firework(this.position, {
        startRadius: 5,
        finalRadius: 100,
        speed: 3,
        finalTransparency: 1,
        color: palette.brightYellow,
        color2: palette.brightYellow,
      });
      new Alert(this.position, "nice!", {
        startRadius: 0,
        finalRadius: 50,
        finalTransparency: 1,
      });
      this.outro();

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

    const basket = new Path2D(
      `m-69,-12.5c-37.6,75.2 175.6,75.2 137.9,0 0,16.5-137.9,16.3-137.9,0z`
    );
    const empty = new Path2D(
      `m0,0c-38.2,0-69,-5.7-69,-12.5-0,-6.9 30.7,-12.5 68.7,-12.5 38.3,-0 69.3,5.6 69.3,12.5C69,-5.7 38.2,0 0,0Z`
    );
    const emptyDown = new Path2D(`m-69,-12.5c-0,16.4 137.9,16.4 137.9,0`);
    const handle = new Path2D(
      `M21.9-0.9C21.9-0.9 25.1-50.2 0-50.2C-25.1-50.2-21.9-25.1-21.9-25.1L-28.2-25.1C-28.2-25.1-31.3-56.4 0-56.4C31.3-56.4 28.2-0.9 28.2-0.9Z`
    );

    const pattern = ctx.createPattern(Stage.getLayer("pattern"), "repeat");

    ctx.lineWidth = 5;
    ctx.strokeStyle = palette.basket2;
    ctx.fillStyle = pattern;
    ctx.stroke(empty);
    ctx.fill(empty);

    ctx.fillStyle = palette.black.toAlpha(0.7);
    ctx.fill(empty);

    if (this.filled) {
      popsicle(new Point(45, 0), new Point(60, -50), palette.gray);
      popsicle(new Point(40, 0), new Point(45, -60), palette.gray);
    }

    const slots = distribute(-40, 40, this.wanted);
    this.content.forEach((b, i) =>
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

    const needed = Math.max(0, this.wanted - this.content.length);
    const pos = new Point(0, 20);
    if (needed > 0) {
      drawText(`${needed}`, {
        pos,
        fontSize: 36,
      });
    } else {
      star(pos);
    }

    ctx.restore();
  }
}
