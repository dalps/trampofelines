import type { Point2 } from "./utils";
import Math2D from "./utils";

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: Point2,
  to: Point2,
  color = "black"
) {
  ctx.lineCap = "round";
  ctx.strokeStyle = color;

  const arrowSize = 4;
  const dy = to.y - from.y;
  const dx = to.x - from.x;
  const perpDir = dx === 0 ? "V" : dy === 0 ? "H" : -dx / dy;

  const p = Math2D.lerp2(from, to, 0.8);
  const p1 = Math2D.linePoint(p, -arrowSize, perpDir);
  const p2 = Math2D.linePoint(p, arrowSize, perpDir);

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(to.x, to.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  ctx.closePath();
}

export function popsicle(
  ctx: CanvasRenderingContext2D,
  from: Point2,
  to: Point2,
  color = "black"
) {
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

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

export function drawGrid(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  sep: number,
  width = 2
) {
  const majorColor = "#cacaca";
  const minorColor = "#d4d4d4";

  ctx.lineWidth = width;
  ctx.strokeStyle = majorColor;

  const h = Math.floor(canvas.width / sep);
  const v = Math.floor(canvas.height / sep);
  for (let i = 0, x = 0; i < h; i++, x += sep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let i = 0, y = 0; i < v; i++, y += sep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}
