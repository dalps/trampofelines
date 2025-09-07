import { circle, popsicle } from "../utils/CanvasUtils";
import { SegmentCollider } from "../engine/Collisions2D";
import { Palette } from "../engine/Color";
import { DEG2RAD, Point } from "../utils/MathUtils";
import { DynamicBody } from "../engine/Physics2D";
import { Stage } from "../engine/Stage";
import { Clock, instant, timestamp } from "../utils/TimeUtils";
import { YarnBall } from "./YarnBall";

Stage.newOffscreenLayer("pattern", 16, 16);
Stage.newOffscreenLayer("basket", 200, 200);

const basketColor2 = "#9d5d2cff";
const basketColor1 = "#c07b3aff";

export class Basket extends DynamicBody {
  constructor(center: Point) {
    super(center);
    this.name = "Basket";
    this.collider = new SegmentCollider(center.addX(-75), center.addX(75));
  }

  update() {
    const { time, dt } = Clock;
    const c = this.collider as SegmentCollider;

    const da = Math.cos(time * 0.1) * 1 * DEG2RAD * dt;
    this.orientation += da;
    c.a.rotateAboutI(this.position, da);
    c.b.rotateAboutI(this.position, da);

    const { ctx, cw, ch } = Stage;

    ctx.save();
    ctx.translate(this.collider.center.x, this.collider.center.y);
    ctx.rotate(this.orientation);
    ctx.drawImage(Stage.getLayer("basket"), -100, -90);
    ctx.restore();
  }

  static drawPattern() {
    Stage.setActiveLayer("pattern");
    const { ctx, cw, ch } = Stage;

    ctx.fillStyle = basketColor1;
    ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = basketColor2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cw, ch);
    ctx.moveTo(cw, 0);
    ctx.lineTo(0, ch);
    ctx.stroke();
  }

  static drawBasket() {
    Stage.setActiveLayer("basket");
    const { ctx } = Stage;

    ctx.save();
    ctx.translate(100, 100);
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    const basket = new Path2D(`m -69,-12.5
c -37.6,75.2 175.6,75.2 137.9,0 0,16.5 -137.9,16.3 -137.9,0
z`);
    const empty = new Path2D(`m 0,0
c -38.2,0 -69,-5.7 -69,-12.5 -0,-6.9 30.7,-12.5 68.7,-12.5 38.3,-0 69.3,5.6 69.3,12.5
C 69,-5.7 38.2,0 0,0
Z`);
    const emptyDown = new Path2D(`m -69,-12.5
c -0,16.4 137.9,16.4 137.9,0`);
    const handle = new Path2D(`M 21.9 -0.9
      C 21.9 -0.9 25.1 -50.2 0 -50.2
      C -25.1 -50.2 -21.9 -25.1 -21.9 -25.1
      L -28.2 -25.1
      C -28.2 -25.1 -31.3 -56.4 0 -56.4
      C 31.3 -56.4 28.2 -0.9 28.2 -0.9
      Z`);

    const pattern = ctx.createPattern(Stage.getLayer("pattern"), "repeat");

    ctx.lineWidth = 5;
    ctx.strokeStyle = basketColor2;
    ctx.fillStyle = pattern;
    ctx.stroke(empty);
    ctx.fill(empty);

    ctx.fillStyle = "#00000077";
    ctx.fill(empty);

    popsicle(new Point(30, 0), new Point(30, -70), "#bbb");
    popsicle(new Point(20, 0), new Point(50, -60), "#bbb");

    YarnBall.drawYarnball(new Point(30, -10), {
      radius: 20,
      color: Palette.colors.fuchsia,
      lineWidth: 2,
      rotation: 45 * DEG2RAD,
    });
    YarnBall.drawYarnball(new Point(50, -5), {
      radius: 20,
      color: Palette.colors.chartreuse,
      lineWidth: 2,
    });
    YarnBall.drawYarnball(new Point(-48, -5), {
      radius: 20,
      color: Palette.colors.coral,
      lineWidth: 2,
      rotation: 30 * DEG2RAD,
    });

    ctx.fillStyle = pattern;
    ctx.fill(basket);

    ctx.strokeStyle = basketColor2;
    ctx.stroke(basket);

    ctx.strokeStyle = basketColor2;
    ctx.lineWidth = 5;
    ctx.stroke(emptyDown);

    ctx.lineWidth = 2;
    ctx.fillStyle = pattern;
    ctx.fill(handle);
    ctx.stroke(handle);

    ctx.restore();
  }
}

Basket.drawPattern();
Basket.drawBasket();
