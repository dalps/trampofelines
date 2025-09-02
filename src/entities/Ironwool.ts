import { DEG2RAD, Point2 } from "../lib/utils";

export class Ironwool {
  constructor(public position: Point2) {}

  draw() {
    const { x, y } = this.position;
    let path = new Path2D();
    path.addPath(
      new Path2D(`M 9,16 4.1,15 1.1,19 -2.5,15.5
l -4.7,1.7 -1.1,-4.9 -4.9,-1.1 1.7,-4.7 -3.5,-3.6 4,-3 -1,-4.9 5,-0.4 1.8,-4.7 4.4,2.3 4,-2.9 2.4,4.3 5,-0.3 -0.3,5 4.4,2.4 -2.9,4 2.3,4.4 -4.7,1.8
z`),
      new DOMMatrix().translate(x + 25, y + 17.5).scale(2, 2)
    );

    ctx.lineWidth = 3;
    ctx.fillStyle = "#b5b5b5ff";
    ctx.strokeStyle = "#6f6f6fff";
    ctx.fill(path);
    ctx.stroke(path);

    // eyes
    ctx.save();
    ctx.translate(x + 25, y + 20);

    const eyeDistance = 10;
    const innerEye = 3;
    const outerEye = 6;
    [eyeDistance, -eyeDistance].forEach((x, i) => {
      ctx.fillStyle = "rgba(174, 255, 0, 1)";
      ctx.beginPath();
      ctx.arc(x, 0, outerEye, 0 * DEG2RAD, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // ctx.fillStyle = "black";
      // ctx.beginPath();
      // ctx.arc(x, 0, innerEye, 0 * DEG2RAD, Math.PI);
      // ctx.fill();
    });

    // mouth
    path = new Path2D();
    path.addPath(
      new Path2D(`m 0,-5 5,-5 5,5 5,-5 5,5 5,-5 5,5`),
      new DOMMatrix().translate(-15, 20)
    );
    ctx.stroke(path);

    ctx.restore();
  }
}
