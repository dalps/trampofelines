import { star } from "../lib/CanvasUtils";
import { Palette } from "../lib/Color";
import { Point, DEG2RAD } from "../lib/MathUtils";
import { Stage } from "../lib/Stage";

export class BasketballCourt {
  constructor(public position: Point) {}

  static draw() {
    Stage.setActiveLayer("background");
    const { ctx, cw, ch } = Stage;
    const scale = 2;

    const floorHeight = 0.6;

    ctx.fillStyle = "#aae0ffff";
    ctx.fillRect(0, 0, cw, ch * floorHeight);

    ctx.fillStyle = Palette.colors.coral.toString();
    ctx.fillRect(0, ch * floorHeight, cw, ch * (1 - floorHeight));

    ctx.strokeStyle = "white";
    ctx.lineWidth = 10;
    const lineHeight = 0.62;
    ctx.moveTo(0, ch * lineHeight);
    ctx.lineTo(cw, ch * lineHeight);
    ctx.stroke();

    ctx.moveTo(cw * 0.3, ch * lineHeight);
    ctx.lineTo(cw * 0.2, ch + 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cw * 0.2, ch + 10, 200, 150, -20 * DEG2RAD, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "yellow";
    ctx.fillStyle = "#d7ff72ff";
    ctx.lineWidth = 3;

    star(new Point(200, 200), { points: 5, outerRadius: 30, innerRadius: 10 });
    ctx.fill();

    star(new Point(cw * 0.8, ch * 0.1), {
      points: 4,
      outerRadius: 30,
      innerRadius: 10,
    });
    ctx.fill();

    star(new Point(600, 300), {
      points: 5,
      outerRadius: 50,
      innerRadius: 20,
      angle: 30 * DEG2RAD,
    });
    ctx.fill();

    star(new Point(cw * 0.5, 100), {
      points: 5,
      outerRadius: 20,
      innerRadius: 10,
      angle: -30 * DEG2RAD,
    });
    ctx.fill();

    ctx.save();
    ctx.translate(cw * 0.8, 300);
    ctx.scale(scale, scale);

    // pole
    ctx.lineCap = "round";
    ctx.lineJoin = "bevel";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 10;

    const pole1 = new Path2D(`M 27 42 L 70 84`);
    ctx.stroke(pole1);

    ctx.lineCap = "butt";
    const pole2 = new Path2D(`M 70 84 L 70 173`);
    ctx.stroke(pole2);

    const tabShadow = new Path2D(`M 4 62
      L 64 54
      C 64 54 66 -3 33 0
      C 6 2 0 36 0 60
      Z`);
    ctx.fillStyle = "#ccc";
    ctx.fill(tabShadow);

    const tab = new Path2D(`M 0 60
        L 60 52
        C 60 24 56 -4 28 0
        C 0 4 0 36 0 60
        Z`);
    ctx.fillStyle = "#eee";
    ctx.fill(tab);

    const square = new Path2D(`M 44 48
          L 12 52
          L 12 24
          L 44 20
          Z`);
    ctx.lineWidth = 3;
    ctx.lineJoin = "miter";
    ctx.strokeStyle = "#aaa";
    ctx.stroke(square);

    const hoop = new Path2D(`M 34 46
            C 34 49 28 50 20 50
            C 12 50 6 49 6 46
            C 6 44 12 42 20 42
            C 28 42 34 44 34 46`);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.stroke(hoop);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const net = new Path2D(`m 10,77.4 -4,-31

M 9.9,72.2 13,77.4 16.3,72.2

m -6.4,0 2.6,-5.2 3.9,5.2

M 12.4,67 16,62.4
l -5,-19 -2.6,19
z

M 20,42 16,62.4 20,67 16.3,72.2 20,77.4

m 10,0 4,-31

M 30.1,72.2 27,77.4 23.7,72.2

m 6.4,0 -2.6,-5.2 -3.9,5.2

M 27.6,67 24,62.4
l 5,-19 2.6,19
z

M 20,42 24,62.4 20,67 23.7,72.2 20,77.4`);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.stroke(net);

    ctx.restore();
  }
}
