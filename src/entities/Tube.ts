import { GAMESTATE as St } from "../GameState";
import { CollisionManager } from "../lib/Collisions2D";
import { Ripple } from "../lib/Ripple";
import { Clock } from "../lib/TimeUtils";
import { lerp, Point2 } from "../lib/utils";
import { YarnBall } from "./YarnBall";

export class Tube {
  public position: Point2;
  public size: Point2;

  constructor(position: Point2, size = new Point2(100, 100)) {
    this.position = position;
    this.size = size;
    Clock.every(50, () => {
      if (St.balls.length < 25) this.spawnYarnBall();
    });
  }

  spawnYarnBall(
    color = ["coral", "fuchsia", "chartreuse", "pink"][
      Math.floor(Math.random() * 3)
    ]
  ) {
    let {
      position: { x, y },
      size: { x: sx, y: sy },
    } = this;

    const headLength = Math.max(sx * 0.1, 20);

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
      new Ripple(Point2.random(p1, p2), startRadius, startRadius + 10);
    }

    St.balls.push(ball);

    St.lines.forEach((l) =>
      l.joints.forEach((j) => CollisionManager.register(j, ball))
    );

    return ball;
  }

  update(dt: time) {}

  draw(ctx: CanvasRenderingContext2D) {
    let {
      position: { x, y },
      size: { x: sx, y: sy },
    } = this;
    const body = new Path2D();
    const head = new Path2D();
    const lid = new Path2D();
    const hole = new Path2D();

    body.rect(x, y, sx, sy);

    const tubeEllispe = (start, size, roundness = 20) => {};

    const cpx = 20;
    const o = 10; // overhang for head
    const headLength = Math.max(sx * 0.1, 20);
    head.moveTo(x + sx + headLength, y - o);
    head.lineTo(x + sx, y - o);
    head.bezierCurveTo(
      // cp1
      x + sx - cpx,
      y - o,
      // cp2
      x + sx - cpx,
      y + sy + o,
      // end
      x + sx,
      y + sy + o
    );
    head.lineTo(x + sx + headLength, y + sy + o);
    head.closePath();

    let x2 = x + sx + headLength;
    lid.moveTo(x2, y - o);
    lid.bezierCurveTo(
      // cp1
      x2 - cpx,
      y - o,
      // cp2
      x2 - cpx,
      y + sy + o,
      // end
      x2,
      y + sy + o
    );
    lid.bezierCurveTo(
      // cp1
      x2 + cpx,
      y + sy + o,
      // cp2
      x2 + cpx,
      y - o,
      // end
      x2,
      y - o
    );

    // head.ellipse(x + sx, y + sy * 0.5, 20, sy * 0.6, 0, 0, Math.PI * 2);

    hole.ellipse(x2 + 2, y + sy * 0.5, 8, sy * 0.4, 0, 0, Math.PI * 2);

    const makeGradient = (
      cp1: Point2,
      cp2: Point2,
      {
        color1 = "#00ff00",
        color2 = "#009c00",
        shinePos = 0.1,
        shineSize = 0.2,
      } = {}
    ) => {
      const greenGradient = ctx.createLinearGradient(
        cp1.x,
        cp1.y,
        cp2.x,
        cp2.y
      );

      greenGradient.addColorStop(0, color1);
      if (shineSize > 0) {
        greenGradient.addColorStop(shinePos, color1);
        greenGradient.addColorStop(shinePos + shineSize * 0.5, "#fff");
        greenGradient.addColorStop(shinePos + shineSize, color1);
      }
      greenGradient.addColorStop(1, color2);
      return greenGradient;
    };
    // ctx.stroke(hole);

    ctx.fillStyle = makeGradient(this.position, this.position.addY(sy));
    ctx.strokeStyle = "#2cbb2c";
    ctx.fill(body);
    ctx.stroke(body);
    ctx.fillStyle = makeGradient(
      this.position.addY(-o),
      this.position.addY(sy + o),
      { shinePos: 0.05 }
    );
    ctx.fill(head);
    ctx.stroke(head);
    ctx.fillStyle = makeGradient(
      this.position.addY(-o),
      this.position.addY(sy + o),
      { shineSize: 0 }
    );
    ctx.fill(lid);
    ctx.stroke(lid);
    ctx.fillStyle = "black";
    ctx.fill(hole);
    // ctx.stroke(hole);
  }
}
