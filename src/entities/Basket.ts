import { Palette } from "../lib/Color";
import { DEG2RAD, Point } from "../lib/MathUtils";
import { MyCanvas, Stage } from "../lib/Stage";
import { timestamp } from "../lib/TimeUtils";

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

    ctx.save();
    ctx.translate(cw * 0.8, 100);
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
    const poleHeight = 200;

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

const pcanvas = document.createElement("canvas");
const pcw = 16;
const pch = 16;
pcanvas.width = pcw;
pcanvas.height = pch;
const pctx = pcanvas.getContext("2d");

const basketColor2 = "#9d5d2cff";
const basketColor1 = "#c07b3aff";

export class Basket {
  static drawPattern(time: timestamp) {
    time *= 0.001;

    pctx.clearRect(0, 0, pcw, pch);
    pctx.fillStyle = basketColor1;

    pctx.fillRect(0, 0, pcw, pch);
    pctx.strokeStyle = basketColor2;
    pctx.lineWidth = 2;
    pctx.beginPath();
    pctx.moveTo(0, 0);
    pctx.lineTo(pcw, pch);
    pctx.moveTo(pcw, 0);
    pctx.lineTo(0, pch);
    pctx.stroke();
  }

  static draw(time: timestamp) {
    const { ctx, cw, ch } = Stage;

    ctx.save();
    ctx.translate(500, 500);
    ctx.strokeStyle = basketColor2;
    ctx.lineWidth = 2;
    let basket = new Path2D(`M -69 -12.5
      C -106.6 62.7 106.6 62.7 69 -12.5`);
    const empty = new Path2D(`m 0,0
c -38.2,0 -69,-5.7 -69,-12.5 -0,-6.9 30.7,-12.5 68.7,-12.5 38.3,-0 69.3,5.6 69.3,12.5
C 69,-5.7 38.2,0 0,0
Z`);

    ctx.fillStyle = ctx.createPattern(pcanvas, "repeat");
    ctx.fill(basket);
    ctx.stroke(basket);
    ctx.fill(empty);
    ctx.lineWidth = 5;

    ctx.fillStyle = "#00000077";
    ctx.fill(empty);
    ctx.stroke(empty);

    const handle = new Path2D(`M 21.9 -0.9
      C 21.9 -0.9 25.1 -50.2 0 -50.2
      C -25.1 -50.2 -21.9 -25.1 -21.9 -25.1
      L -28.2 -25.1
      C -28.2 -25.1 -31.3 -56.4 0 -56.4
      C 31.3 -56.4 28.2 -0.9 28.2 -0.9
      Z`);
    ctx.lineWidth = 2;
    ctx.fillStyle = ctx.createPattern(pcanvas, "repeat");
    ctx.fill(handle);
    ctx.stroke(handle);
    ctx.restore();
  }
}

Basket.drawPattern();
