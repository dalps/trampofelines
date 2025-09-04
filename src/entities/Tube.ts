import { GAMESTATE as St } from "../GameState";
import { MyCanvas, Stage } from "../lib/Stage";
import { CollisionManager } from "../lib/Collisions2D";
import { HSLColor, Palette } from "../lib/Color";
import { Ripple } from "../lib/Ripple";
import { Clock, timestamp } from "../lib/TimeUtils";
import { lerp, Point } from "../lib/MathUtils";
import { YarnBall } from "./YarnBall";
import { makeGradient } from "../lib/CanvasUtils";

export class Tube {
  public position: Point;
  public size: Point;
  private canvas: MyCanvas;

  constructor(position: Point, size = new Point(100, 100)) {
    this.position = position;
    this.size = size;
    this.canvas = Stage.getLayer("tube");

    Stage.newOffscreenLayer("tube", size.x * 1.5, size.y);
    Tube.drawTube(this.size.x, this.size.y);

    Clock.every(10, () => {
      if (St.balls.length < 25) this.spawnYarnBall();
    });
  }

  spawnYarnBall() {
    let {
      position: { x, y },
      size: { x: sx, y: sy },
    } = this;

    const headLength = Math.max(sx * 0.1, 20);

    const colorOptions = ["coral", "fuchsia", "chartreuse", "hotPink"];
    const color = Palette.colors[
      colorOptions[Math.floor(Math.random() * colorOptions.length)]
    ] as HSLColor;

    const startPos = this.position
      .clone()
      .addX(this.size.x + headLength)
      .addY(this.size.y * 0.5);

    const p1 = startPos.addY(-30);
    const p2 = startPos.addY(30).addX(20);

    const ball = new YarnBall(
      startPos,
      St.settings.ballVelocity,
      St.settings.ballMass,
      St.settings.ballRadius,
      color
    );

    const nRipples = 5;
    for (let i = 0; i < nRipples; i++) {
      const startRadius = lerp(10, 20, i / nRipples);
      new Ripple(Point.random(p1, p2), startRadius, startRadius + 10);
    }

    St.balls.push(ball);

    St.trampolines.forEach((l) =>
      l.joints.forEach((j) => CollisionManager.register(j, ball))
    );

    return ball;
  }

  update(dt: timestamp) {}

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

    const tubeEllispe = (start, size, roundness = 20) => {};

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
    ctx.strokeStyle = "#2cbb2c";
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
    // ctx.stroke(lid);

    ctx.fillStyle = makeGradient(new Point(0, 0), new Point(0, sy), {
      color1: "black",
      color2: "#298529ff",
      shineSize: 0,
    });
    ctx.fill(hole);
    // ctx.stroke(hole);

    ctx.lineWidth = 3;
    [highlightL, highlightR].forEach((path) => {
      ctx.strokeStyle = ctx.fillStyle = makeGradient(
        new Point(0, -overhang * 3),
        new Point(0, sy + overhang * 3),
        {
          color1: "rgba(255, 255, 255, 0)",
          color2: "rgba(255, 2, 2, 0)",
          shineSize: 0.55,
          shinePos: 0,
          shineSmoothness: 1,
        }
      );
      ctx.stroke(path);
    });
  }
}
