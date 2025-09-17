import palette from "../engine/color";
import Game, {
  BALL_MASS,
  BALL_RADIUS,
  BASKETS,
  State as GameState,
  SPAWN_RATE as LAUNCH_RATE,
  MAX_BALLS,
  TRAMPOFELINES,
  YARNBALLS,
} from "../engine/GameState";
import { Ripple } from "../engine/Ripple";
import sfx, { zzfxP } from "../engine/sfx";
import { Stage } from "../engine/Stage";
import { Tween } from "../engine/tween";
import { makeGradient, star } from "../utils/CanvasUtils";
import { lerp, pickRandom } from "../utils/MathUtils";
import { Point } from "../utils/Point";
import { Clock } from "../utils/TimeUtils";
import { YarnBall } from "./YarnBall";

export class Tube {
  public position: Point;
  public size: Point;
  public right = false;
  public shootVelocity = 50;
  private timer: number;

  constructor(
    position: Point,
    { size = new Point(100, 100), right = false, cb } = {}
  ) {
    this.position = position;
    this.size = size;
    this.right = right;

    Stage.newOffscreenLayer("tube", size.x * 1.5, size.y);
    Tube.drawTube(this.size.x, this.size.y);
  }

  intro() {
    new Tween(this.position, "x", {
      finalValue: this.right ? Stage.stage.clientWidth + 50 : -50,
      speed: 2,
      epsilon: 1,
      onComplete: () => {
        this.timer = Clock.every(LAUNCH_RATE, () => {
          if (Game.state === GameState.Playing && YARNBALLS.count < MAX_BALLS) {
            zzfxP(sfx.spawn);
            this.launch();
            // cb(ball);
          }
        });
      },
    });
  }

  outro() {
    new Tween(this.position, "x", {
      finalValue: this.right ? Stage.stage.clientWidth + 200 : -200,
      speed: 2,
      epsilon: 1,
      onComplete: () => Clock.cancelTimer(this.timer),
    });
  }

  launch() {
    let {
      size: { x: sx },
    } = this;

    const headLength = Math.max(sx * 0.1, 20);

    const color = pickRandom([
      palette.coral,
      palette.fuchsia,
      palette.chartreuse,
      palette.hotPink,
    ]);
    const startPos = this.position
      .addX((this.right ? -1 : 1) * (this.size.x + headLength))
      .addY(this.size.y * 0.5);

    const p1 = startPos.addY(-30);
    const p2 = startPos.addY(30).addX(20);

    const b = YARNBALLS.spawn(
      startPos,
      new Point(this.right ? -1 : 1, 0).scale(this.shootVelocity),
      BALL_MASS,
      BALL_RADIUS,
      color
    );

    TRAMPOFELINES.list.forEach(cat => cat.catch(b));
    BASKETS.list.forEach(bkt => bkt.catch(b));
    const nRipples = 5;
    for (let i = 0; i < nRipples; i++) {
      const startRadius = lerp(10, 20, i / nRipples);
      new Ripple(Point.random(p1, p2), {
        startRadius,
        finalRadius: startRadius + 10,
      });
    }

    return b;
  }

  public update(): void {
    const { ctx } = Stage;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    this.right && ctx.transform(-1, 0, 0, 1, 0, 0);
    ctx.drawImage(Stage.getCanvas("tube"), 0, 0);
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

    const [highlightL, highlightR] = [sx, x0].map(x2 => {
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
    [highlightL, highlightR].forEach(path => {
      ctx.strokeStyle = ctx.fillStyle = makeGradient(
        new Point(0, -overhang * 3),
        new Point(0, sy + overhang * 3),
        {
          color1: palette.white.toAlpha(0),
          color2: palette.white.toAlpha(0),
          shineSize: 0.55,
          shinePos: 0,
          shineSmoothness: 1,
        }
      );
      ctx.stroke(path);
    });
  }
}
