import { Point2 } from "../lib/utils";

export class Tube {
  public position: Point2;
  public size: Point2;

  constructor(position: Point2, size = new Point2(100, 100)) {
    this.position = position;
    this.size = size;
  }

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

    const cpx = 20;
    const dy = 10;
    const headLength = Math.max(sx * 0.1, 20);
    head.moveTo(x + sx + headLength, y - dy);
    head.lineTo(x + sx, y - dy);
    head.bezierCurveTo(
      // cp1
      x + sx - cpx,
      y - dy,
      // cp2
      x + sx - cpx,
      y + sy + dy,
      // end
      x + sx,
      y + sy + dy
    );
    head.lineTo(x + sx + headLength, y + sy + dy);
    head.closePath();

    let x2 = x + sx + headLength;
    lid.moveTo(x2, y - dy);
    lid.bezierCurveTo(
      // cp1
      x2 - cpx,
      y - dy,
      // cp2
      x2 - cpx,
      y + sy + dy,
      // end
      x2,
      y + sy + dy
    );
    lid.bezierCurveTo(
      // cp1
      x2 + cpx,
      y + sy + dy,
      // cp2
      x2 + cpx,
      y - dy,
      // end
      x2,
      y - dy
    );

    // head.ellipse(x + sx, y + sy * 0.5, 20, sy * 0.6, 0, 0, Math.PI * 2);

    hole.ellipse(x2 + 2, y + sy * 0.5, 8, sy * 0.4, 0, 0, Math.PI * 2);

    const makeGradient = (
      cp1: Point2,
      cp2: Point2,
      shinePos = 0.1,
      shineSize = 0.2
    ) => {
      const greenGradient = ctx.createLinearGradient(
        cp1.x,
        cp1.y,
        cp2.x,
        cp2.y
      );

      greenGradient.addColorStop(0, "#00ff00");
      greenGradient.addColorStop(shinePos, "#00ff00");
      greenGradient.addColorStop(shinePos + shineSize * 0.5, "#ffffff");
      greenGradient.addColorStop(shinePos + shineSize, "#00ff00");
      greenGradient.addColorStop(1, "#009c00");
      return greenGradient;
    };
    // ctx.stroke(hole);

    ctx.fillStyle = makeGradient(this.position, this.position.addY(sy));
    ctx.strokeStyle = "black";
    ctx.fill(body);
    // ctx.stroke(body);
    ctx.fillStyle = makeGradient(this.position, this.position.addY(sy), 0.05);
    ctx.fill(head);
    // ctx.stroke(head);
    ctx.fillStyle = "#009c00";
    ctx.strokeStyle = "black";
    ctx.fill(lid);
    // ctx.stroke(lid);
    ctx.fillStyle = "black";
    ctx.fill(hole);
  }
}
