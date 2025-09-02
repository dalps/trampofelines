import type { timestamp } from "./lib/TimeUtils";
import { Point2 } from "./lib/utils";

export function toranporin() {
  const text = "猫のトランポリン";
  const textSize = 48;
  ctx.font = `${textSize}px sans-serif`;
  ctx.textBaseline = "ideographic";
  ["purple", "red"].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillText(text, (i + 1) * 2, textSize + (i + 1) * 2);
  });
  ctx.fillStyle = "#222";
  ctx.fillText(text, 0, 48);
  // ctx.strokeStyle = "blue";
  // ctx.strokeText(text, 0, 48);
}

export function drawTitle() {
  const path = new Path2D();
  const textPath = new Path2D(
    `M 6.4 2.1  L 4.5 2.1  L 4.5 8.2  L 1.9 8.2  L 1.9 2.1  L 0 2.1  L 0 0  L 6.4 0  L 6.4 2.1    M 14.7 8.2  L 11.8 8.2  L 10.8 5.8  L 10.2 5.8  L 10.2 8.2  L 7.6 8.2  L 7.6 0  L 11.7 0  L 13.8 0.7  L 14.5 2.9  L 13.3 5.5  L 14.7 8.2    M 10.2 2.1  L 10.2 3.7  L 10.8 3.7  L 11.5 3.6  L 11.7 3.2  L 11.7 2.6  L 11.5 2.2  L 10.8 2.1  L 10.2 2.1    M 18 8.2  L 15.2 8.2  L 17.4 0  L 21.4 0  L 23.6 8.2  L 20.8 8.2  L 20.5 6.9  L 18.3 6.9  L 18 8.2    M 19.3 2.5  L 18.8 4.8  L 20 4.8  L 19.5 2.5  L 19.3 2.5    M 26.9 8.2  L 24.1 8.2  L 24.6 0  L 28.1 0  L 29.1 4.2  L 29.2 4.2  L 30.2 0  L 33.6 0  L 34.1 8.2  L 31.4 8.2  L 31.2 4.2  L 31.1 4.2  L 30.1 8.2  L 28.1 8.2  L 27.1 4.2  L 27 4.2  L 26.9 8.2    M 39.9 6.2  L 38.1 6.2  L 38.1 8.2  L 35.5 8.2  L 35.5 0  L 39.6 0  L 41.8 0.8  L 42.5 3  L 41.7 5.5  L 41 6  L 39.9 6.2  L 39.9 6.2    M 38.1 2.1  L 38.1 4.1  L 38.8 4.1  L 39.4 4  L 39.6 3.6  L 39.6 2.6  L 39.4 2.2  L 38.8 2.1  L 38.1 2.1    M 43.3 4.1  L 44.1 0.8  L 47.1 -0.2  L 50.2 0.8  L 51 4.1  L 50.8 6  L 50.2 7.3  L 49 8.2  L 47.1 8.4  L 45.3 8.2  L 44.1 7.3  L 43.5 6  L 43.3 4.1  L 43.3 4.1    M 46.1 2.8  L 46.1 6.2  L 47.2 6.2  L 48 6  L 48.2 5.5  L 48.2 2  L 47.1 2  L 46.3 2.2  L 46.1 2.8  L 46.1 2.8    M 57.2 5.2  L 55 5.2  L 55 8.2  L 52.4 8.2  L 52.4 0  L 57.7 0  L 57.4 2.1  L 55 2.1  L 55 3.2  L 57.2 3.2  L 57.2 5.2    M 64.2 5.1  L 61.6 5.1  L 61.6 6.1  L 64.8 6.1  L 64.8 8.2  L 58.9 8.2  L 58.9 0  L 64.7 0  L 64.4 2.1  L 61.6 2.1  L 61.6 3.2  L 64.2 3.2  L 64.2 5.1    M 71.5 8.2  L 66.3 8.2  L 66.3 -0  L 68.9 -0  L 68.9 6.1  L 71.5 6.1  L 71.5 8.2    M 72.7 8.2  L 72.7 -0  L 75.3 -0  L 75.3 8.2  L 72.7 8.2    M 81.8 8.2  L 79.8 5.3  L 79.7 4.7  L 79.7 4.7  L 79.7 8.2  L 77 8.2  L 77 0  L 79.5 0  L 81.5 2.9  L 81.6 3.5  L 81.7 3.5  L 81.7 0  L 84.3 0  L 84.3 8.2  L 81.8 8.2    M 91.3 5.1  L 88.7 5.1  L 88.7 6.1  L 91.9 6.1  L 91.9 8.2  L 86 8.2  L 86 0  L 91.8 0  L 91.5 2.1  L 88.7 2.1  L 88.7 3.2  L 91.3 3.2  L 91.3 5.1    M 93.1 8.1  L 93.4 5.9  L 95.6 6.2  L 97.2 6.1  L 97.2 5.5  L 96 5.4  L 93.8 4.6  L 93.2 2.8  L 93.9 0.4  L 96.4 -0.2  L 99.5 0.1  L 99.2 2.2  L 97.3 2  L 96 2.1  L 96 2.8  L 97 2.8  L 99.3 3.7  L 100 5.5  L 99.8 6.9  L 99.2 7.7  L 98.4 8.2  L 97.4 8.4  L 96.2 8.4  L 93.1 8.1  L 93.1 8.1`
  );
  const textScale = 5;
  const pos = new Point2(200, 0);
  const mat = new DOMMatrix([textScale, 0, 0, textScale, pos.x, pos.y]);
  // mat.rotateAxisAngleSelf(0, 0, 1, Math.sin(time) * 45);

  path.addPath(textPath, mat);
  ctx.lineWidth = 2;

  ctx.fill(path);
  ctx.stroke(path);
}
