import { star } from "../utils/CanvasUtils";
import Math2D, { lerp, Point } from "../utils/MathUtils";
import { Stage } from "../engine/Stage";

export class Space {
  static init() {}

  static draw() {
    const { ctx, cw, ch } = Stage;
    for (let i = 0; i < 10; i++) {
      const p = Math2D.lerp2(new Point(0, 0), new Point(cw, ch), Math.random());
      star(p);
    }
  }
}
