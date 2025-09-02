import type { Point } from "./MathUtils";
import { Stage } from "./Stage";

export function popsicle(from: Point, to: Point, color = "black") {
  const ctx = Stage.ctx;

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
  const ctx = Stage.ctx;

  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
}

export function drawGrid(
  canvas: HTMLCanvasElement,

  { sep = 20, lineWidth = 2, color = "#ccc", offsetX = 0, offsetY = 0 } = {}
) {
  const ctx = Stage.ctx;

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
