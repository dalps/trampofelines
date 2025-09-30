import { DEG2RAD, lerp } from "../utils/MathUtils";
import { Point } from "./Point";
import { Stage } from "../engine/Stage";
import PALETTE, { hsl } from "../engine/color";

export function star(
  pos: Point,
  {
    innerRadius = 5,
    outerRadius = 10,
    points = 5,
    angle = 0,
    fill = undefined,
    stroke = undefined,
    ctx = undefined,
    cb = undefined,
  } = {}
) {
  const dphi = (Math.PI * 2) / (points * 2);

  ctx?.beginPath();

  for (let i = 0, phi = 0; i < points * 2; i++, phi += dphi) {
    let p = new Point(Math.cos(phi), Math.sin(phi)).scale(
      i % 2 === 0 ? outerRadius : innerRadius
    );
    p = p.rotate(angle);
    p = p.add(pos);

    ctx?.lineTo(p.x, p.y);
    cb && cb(p, i);
  }

  ctx?.closePath();

  if (ctx) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }
}

export function makeGradient(
  cp1: Point,
  cp2: Point,
  {
    color1 = hsl(120, 100, 50), // hsla(120, 100%, 50%, 1.00),
    color2 = hsl(120, 100, 31), // hsla(120, 100%, 31%, 1.00)
    shineColor = hsl(120, 100, 88), // hsla(120, 100%, 88%, 1.00),
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

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  const arrowSize = 4;

  ctx.beginPath();
  ctx.arc(from.x, from.y, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(to.x, to.y, arrowSize, 0, Math.PI * 2);
  ctx.fill();
}

export function circle(p: Point, r: number) {
  const { ctx } = Stage;

  ctx.beginPath();
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

export function drawSector(
  position: Point,
  radius: number,
  {
    subs = 10,
    n = 90 / subs,
    slices = 3,
    theta = 360 / slices,
    col1 = "white",
    col2 = "black",
  } = {}
) {
  const { ctx } = Stage;
  for (let i = 0; i < n; i++) {
    const dStart = theta + subs * i;
    const dEnd = theta + 180 - subs * i;

    ctx.beginPath();
    ctx.arc(
      position.x,
      position.y,
      radius,
      dStart * DEG2RAD,
      dEnd * DEG2RAD,
      false
    );
    ctx.closePath();
    ctx.closePath();

    ctx.fillStyle = i % 2 === 0 ? col1 : col2;
    ctx.fill();
  }
}

export function billboard(
  pos: Point,
  {
    padding = 5,
    width = 50,
    height = 200,
    color1 = PALETTE.blue1,
    color2 = PALETTE.blue3,
    right = false,
    beamLength = 30,
    content = () => {},
  }
) {
  const { ctx } = Stage;

  ctx.lineWidth = 4;

  ctx.strokeStyle = color1;
  [pos.y + padding * 2, pos.y + height].forEach(y => {
    ctx.beginPath();
    ctx.moveTo(pos.x, y);
    ctx.lineTo(
      pos.x + (right ? width + padding * 2 + beamLength : -beamLength),
      y
    );
    ctx.stroke();
  });

  const billboard = new Path2D();
  const billboard2 = new Path2D();

  billboard.roundRect(
    pos.x,
    pos.y,
    width + padding * 2,
    height + padding * 2,
    10
  );

  billboard2.roundRect(
    pos.x - padding,
    pos.y - padding,
    width + padding * 4,
    height + padding * 4,
    5
  );

  ctx.fillStyle = color1;
  ctx.fill(billboard2);

  ctx.lineWidth = 2;
  ctx.strokeStyle = color2;
  ctx.stroke(billboard);

  ctx.save();
  ctx.translate(pos.x + padding, pos.y + padding);
  content();
  ctx.restore();
}

export function imageToBase64(url: string) {
  const img = new Image();
  img.src = url;

  img.onload = () => {
    const { width, height } = img;
    Stage.newOffscreenLayer("base64ify", width, height);
    const { ctx, activeLayer } = Stage;
    // Stage.debugOffscreenLayer("base64ify");

    ctx.drawImage(img, 0, 0);
    console.log(url)
    console.log(activeLayer.canvas.toDataURL());
  };
}
