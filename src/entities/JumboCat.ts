import { GAMESTATE as St, GAMESTATE as state } from "../GameState";
import { CircleCollider, CollisionManager } from "../lib/Collisions2D";
import { Palette } from "../lib/Color";
import { ElasticShape } from "../lib/ElasticLine";
import { Stage } from "../lib/Stage";
import Math2D, { Point } from "../lib/MathUtils";
import { drawCatFace } from "./Trampofeline";

export class JumboCat extends ElasticShape {
  constructor(public position: Point, public size: Point, public subs = 7) {
    const points: Point[] = [];

    const cornerTL = position;
    const cornerTR = position.addX(size.x);
    const cornerBL = position.addY(size.y);
    const cornerBR = cornerBL.addX(size.x);

    const subsY = Math.floor(subs * (size.y / size.x));

    const clampIndeces: number[] = [];

    let idx = 0;

    (
      [
        [cornerTR, cornerTL, subs],
        [cornerTL, cornerBL, subsY],
        [cornerBL, cornerBR, subs],
        [cornerBR, cornerTR, subsY],
      ] as [Point, Point, number][]
    ).forEach(([c1, c2, subs]) => {
      for (let i = 0; i < subs; i++) {
        i === 0 && clampIndeces.push(idx);
        idx = points.push(Math2D.lerp2(c1, c2, i / subs));
      }
    });

    super(points, {
      closed: true,
      jointsAttraction: 200,
      mass: 2,
      damping: 10,
    });

    clampIndeces.forEach((i) => {
      this.joints.at(i)?.clearForces();
      this.joints.at(i)?.toggleFixed();
    });

    this.joints.forEach((j) => {
      j.attachCollider(
        new CircleCollider(j.position, St.settings.colliderRadius)
      );
      state.balls.forEach((b) => CollisionManager.register(j, b));
    });
  }

  draw() {
    const { ctx } = Stage;

    super.draw({ fillColor: Palette.colors.nightBlue.toString() });

    let {
      position: { x, y },
      size: { x: sx, y: sy },
    } = this;

    const p = new Path2D();

    p.roundRect(x, y, sx, sy, 5);

    const jl = this.joints.at(Math.floor(this.subs * 0.5))!.position;
    const jr = this.joints.at(Math.floor(this.subs * 0.5 + 1))!.position;
    const center = Math2D.lerp2(jl, jr, 0.5).addY(sy * 0.5);

    ctx.save();
    ctx.translate(center.x, center.y);
    drawCatFace();
    ctx.restore();

    // ctx.fillStyle = Palette.coatColor;
    // ctx.fill(p);
  }
}
