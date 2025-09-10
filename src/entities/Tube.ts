import Game, { game, State as GameState } from "../engine/GameState";
import { makeGradient } from "../utils/CanvasUtils";
import { CollisionManager, downwardFilter } from "../engine/Collisions2D";
import palette, { HSLColor, RGBColor } from "../engine/color";
import { lerp, Point } from "../utils/MathUtils";
import { State } from "../engine/Physics2D";
import { Ripple } from "../engine/Ripple";
import { MyCanvas, Stage } from "../engine/Stage";
import { Clock } from "../utils/TimeUtils";
import sfx, { zzfxP } from "../engine/sfx";
import TrampofelineManager from "./Trampofeline";
import { YarnBall } from "./YarnBall";
import { drawLives } from "../engine/ui";

export class Tube {
  public position: Point;
  public size: Point;
  public direction = 0;
  public shootVelocity = 50;

  constructor(
    position: Point,
    { size = new Point(100, 100), cb = (b: YarnBall) => {} } = {}
  ) {
    this.position = position;
    this.size = size;

    Stage.newOffscreenLayer("tube", size.x * 1.5, size.y);
    Tube.drawTube(this.size.x, this.size.y);

    Clock.every(20, () => {
      if (Game.state === GameState.Playing && Game.yarnballs.size < 3) {
        zzfxP(sfx.spawn);
        const ball = this.spawnYarnBall();
        cb(ball);
      }
    });
  }

  spawnYarnBall() {
    let {
      size: { x: sx },
    } = this;

    const headLength = Math.max(sx * 0.1, 20);

    const colorOptions = ["coral", "fuchsia", "chartreuse", "hotPink"];
    const color = palette[
      colorOptions[Math.floor(Math.random() * colorOptions.length)]
    ] as HSLColor;

    const startPos = this.position
      .clone()
      .addX(this.size.x + headLength)
      .addY(this.size.y * 0.5);

    const p1 = startPos.addY(-30);
    const p2 = startPos.addY(30).addX(20);

    const b = new YarnBall(
      startPos,
      new Point(1, 0).multiplyScalar(this.shootVelocity).rotate(this.direction),
      Game.settings.ballMass,
      Game.settings.ballRadius,
      color
    );
    b.name = "YarnBall";

    const nRipples = 5;
    for (let i = 0; i < nRipples; i++) {
      const startRadius = lerp(10, 20, i / nRipples);
      new Ripple(Point.random(p1, p2), {
        startRadius,
        finalRadius: startRadius + 10,
      });
    }

    Game.yarnballs.set(b.id, b);

    TrampofelineManager.trampolines.forEach((cat) =>
      cat.joints.forEach((j) =>
        CollisionManager.register(j, b, {
          filter: downwardFilter,
          cb: () => {
            new Ripple(j.position, {
              startRadius: 15,
              finalRadius: 30,
              startTransparency: 0.3,
              finalTransparency: 0,
            });
            zzfxP(sfx.bounce);
            TrampofelineManager.killCat(cat);
          },
        })
      )
    );

    Game.baskets.forEach((basket) =>
      CollisionManager.register(basket, b, {
        sensor: true,
        filter: downwardFilter,
        cb: () => {
          if (Game.state !== GameState.Playing) return;

          Game.score += 1;
          CollisionManager.unregisterBody(b);
          b.state = State.Dead;
          drawLives();
          zzfxP(sfx.score);
          basket.addYarnball(b);
          Stage.setActiveLayer("game");
          Game.yarnballs.delete(b.id);
          new Ripple(b.position.clone(), {
            startRadius: 25,
            finalRadius: 50,
            startTransparency: 0.3,
            finalTransparency: 0,
            fillColor: b.color,
          });
        },
      })
    );

    return b;
  }

  draw() {
    const { ctx } = Stage;

    ctx.save();
    ctx.drawImage(Stage.getLayer("tube"), this.position.x, this.position.y);
    ctx.restore();
  }

  static drawTube(sx: number, sy: number) {
    Stage.setActiveLayer("tube");
    const { ctx } = Stage;

    const body = new Path2D();
    const head = new Path2D();
    const lid = new Path2D();
    const hole = new Path2D();

    const cpx = 20;
    const overhang = 10;
    const thickness = Math.max(sx * 0.1, 20);

    body.rect(0, overhang, sx, sy - overhang * 2);

    let x0 = sx + thickness;
    let x1 = sx;
    head.moveTo(x0, 0);
    head.lineTo(x1, 0);
    head.bezierCurveTo(
      // cp1
      sx - cpx,
      -overhang,
      // cp2
      sx - cpx,
      sy + overhang,
      // end
      sx,
      sy
    );
    head.lineTo(sx + thickness, sy);
    head.closePath();

    lid.moveTo(x0, 0);
    lid.bezierCurveTo(
      // cp1
      x0 - cpx,
      -overhang,
      // cp2
      x0 - cpx,
      sy + overhang,
      // end
      x0,
      sy
    );
    lid.bezierCurveTo(
      // cp1
      x0 + cpx,
      sy + overhang,
      // cp2
      x0 + cpx,
      -overhang,
      // end
      x0,
      0
    );

    // head.ellipse(x + sx, y + sy * 0.5, 20, sy * 0.6, 0, 0, Math.PI * 2);

    hole.ellipse(x0 + 2, sy * 0.5, 8, sy * 0.4, 0, 0, Math.PI * 2);

    const [highlightL, highlightR] = [sx, x0].map((x2) => {
      const p = new Path2D();
      p.moveTo(x2, 0);
      p.bezierCurveTo(
        // cp1
        x2 - cpx,
        -overhang,
        // cp2
        x2 - cpx,
        sy + overhang,
        // end
        x2,
        sy
      );

      return p;
    });

    ctx.fillStyle = makeGradient(new Point(0, 0), new Point(0, sy), {
      shineSize: 0.2,
    });
    ctx.fillRect;
    ctx.strokeStyle = palette.tube1;
    ctx.fill(body);

    // ctx.stroke(body);
    ctx.fillStyle = makeGradient(
      new Point(0, -overhang),
      new Point(0, sy + overhang),
      {
        shinePos: 0.05,
      }
    );
    ctx.fill(head);
    // ctx.stroke(head);
    ctx.fillStyle = makeGradient(
      new Point(0, -overhang),
      new Point(0, sy + overhang),
      {
        shineSize: 0,
      }
    );
    ctx.fill(lid);

    ctx.fillStyle = makeGradient(new Point(0, 0), new Point(0, sy), {
      color1: palette.black,
      color2: palette.tube2,
      shineSize: 0,
    });
    ctx.fill(hole);

    ctx.lineWidth = 3;
    [highlightL, highlightR].forEach((path) => {
      ctx.strokeStyle = ctx.fillStyle = makeGradient(
        new Point(0, -overhang * 3),
        new Point(0, sy + overhang * 3),
        {
          color1: palette.white.clone().setAlpha(0),
          color2: new RGBColor(255, 2, 2, 0),
          shineSize: 0.55,
          shinePos: 0,
          shineSmoothness: 1,
        }
      );
      ctx.stroke(path);
    });
  }
}
