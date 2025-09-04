import { lerp, Point } from "./MathUtils";
import { Stage } from "./Stage";

export function star(
  pos: Point,
  { innerRadius = 5, outerRadius = 10, points = 5 } = {}
) {
  const { ctx } = Stage;
  const dphi = (Math.PI * 2) / (points * 2);

  ctx.beginPath();
  for (let i = 0, phi = 0; i < points * 2; i++, phi += dphi) {
    const p = new Point(Math.cos(phi), Math.sin(phi)).multiplyScalar(
      i % 2 === 0 ? outerRadius : innerRadius
    );
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();

  const p = new Path2D()
}

export function makeGradient(
  cp1: Point,
  cp2: Point,
  {
    color1 = "#00ff00",
    color2 = "#009c00",
    shineColor = "#c4ffc4",
    shinePos = 0.1,
    shineSize = 0.2,
    shineSmoothness = 0.5,
  } = {}
) {
  const { ctx } = Stage;
  const g = ctx.createLinearGradient(cp1.x, cp1.y, cp2.x, cp2.y);

  g.addColorStop(0, color1);
  if (shineSize > 0) {
    g.addColorStop(shinePos, color1);
    g.addColorStop(
      shinePos + lerp(0, shineSize * 0.5, shineSmoothness),
      shineColor
    );
    g.addColorStop(
      shinePos + shineSize - lerp(0, shineSize * 0.5, shineSmoothness),
      shineColor
    );
    g.addColorStop(shinePos + shineSize, color1);
  }
  g.addColorStop(1, color2);

  return g;
}

export function popsicle(from: Point, to: Point, color = "black") {
  const { ctx } = Stage;

  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  const arrowSize = 4;

  ctx.beginPath();
  ctx.arc(from.x, from.y, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(to.x, to.y, arrowSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

export function circle(p: Point, r: number) {
  const { ctx } = Stage;

  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
}

export function grid(
  canvas: HTMLCanvasElement,

  { sep = 20, lineWidth = 2, color = "#ccc", offsetX = 0, offsetY = 0 } = {}
) {
  const { ctx } = Stage;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;

  const h = Math.floor((canvas.width + Math.abs(offsetX) * 2) / sep);
  const v = Math.floor((canvas.height + Math.abs(offsetY) * 2) / sep);
  for (let i = 0, x = offsetX; i < h; i++, x += sep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let i = 0, y = offsetY; i < v; i++, y += sep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}
