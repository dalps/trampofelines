import { Stage } from "./Stage";

interface Letter {
  path?: string;
  size?: number;
}

function Letter(path: string, size = 75): Letter {
  return { path, size };
}

const KUROKANE: Record<string, Letter> = {
  A: {
    path: `m 76,73 -1,-1 -3,-4 -5,-6 -6,-8 H 31 L 24,72 10,67 37,0 H 60 L 90,65 76,73 M 53,40 48,30 45,19 37,40 h 16`,
    size: 75,
  },
  B: {
    path: `M 24,71 V 0 h 30 l 6,1 6,3 5,6 2,9 -5,14 5,6 2,9 -2,10 -4,7 -8,6 h -39 m 31,-57 h -13 v 14 h 13 V 14 m 0,28 h -13 v 14 h 13 V 43`,
    size: 70,
  },
  C: {
    path: `m 49,71 -7,-2 -8,-6 -6,-11 -3,-17 3,-17 6,-11 8,-6 L 49,0 h 26 v 14 h -24 v 43 h 24 v 14 h -26`,
    size: 65,
  },
  D: {
    path: `M 20,71 V 0 h 40 l 5,2 7,6 6,12 3,18 c -0,4 -1,9 -2,13 L 73,62 64,71 H 20 m 37,-57 h -19 v 43 h 19 V 14`,
    size: 75,
  },
  E: {
    path: `M 24,71 V 0 h 52 v 14 h -33 v 12 h 31 v 14 h -31 v 16 h 33 v 14 h -52`,
    size: 65,
  },
  F: {
    path: `M 43,41 V 71 H 24 V 0 h 52 v 14 h -33 v 12 h 31 v 14 h -31`,
    size: 75,
  },
  G: {
    path: `m 36,71 -4,-2 -6,-7 -6,-11 -3,-15 3,-17 7,-11 8,-6 L 40,0 h 37 v 14 h -35 v 43 h 21 v -21 h 20 c 1,2 0,4 1,6 l -0,6 -1,7 -3,8 -5,9 h -38`,
    size: 75,
  },
  H: {
    path: `m 65,71 v -30 H 35 v 30 h -19 V 0 h 19 V 27 H 65 V 0 h 19 v 71 h -19`,
    size: 75,
  },
  I: {
    path: `M 41,71 V 0 H 59 V 71 H 41`,
    size: 60,
  },
  J: {
    path: `M 41,71 V 0 h 19 v 39 l -1,12 -2,10 -2,7 -1,3 h -13`,
    size: 75,
  },
  K: {
    path: `m 67,75 -2,-2 -4,-5 -5,-9 -4,-13 h -12 l -1,11 -2,9 c -1,3 -2,5 -3,8 H 20 V 2 h 19 v 32 h 0 L 61,0 l 16,11 -10,13 -9,10 h 7 l 13,35 -13,6`,
    size: 75,
  },
  L: {
    path: `M 24,71 V 0 h 18 v 56 l 8,-2 8,-1 17,-1 2,0 v 20 h -53`,
    size: 65,
  },
  M: {
    path: `M 69,71 V 44 l -5,8 -4,6 -4,6 H 43 C 42,62 42,62 39,58 l -4,-7 -5,-8 V 71 H 13 V 0 H 31 L 50,48 69,0 h 18 v 71 h -18`,
    size: 70,
  },
  N: {
    path: `m 64,71 c -3,-3 -6,-6 -9,-9 l -4,-5 -5,-6 -10,-13 v 33 h -18 V 0 h 18 l 27,45 V 0 h 18 v 71 h -18`,
    size: 75,
  },
  O: {
    path: `m 41,71 -7,-2 -9,-6 -8,-11 -3,-17 3,-17 8,-11 9,-6 L 41,0 h 18 l 7,2 9,6 8,11 3,17 -3,17 -8,11 -9,6 -7,2 h -18 m 21,-57 h -24 v 43 h 24 V 14`,
    size: 75,
  },
  P: {
    path: `m 41,42 -1,12 -2,9 -2,6 -1,2 H 22 V 0 h 43 l 3,1 5,4 5,6 2,8 -3,10 -9,12 h -26 m 16,-27 h -16 v 13 h 16 V 14`,
    size: 75,
  },
  Q: {
    path: `m 40,0 -7,2 -9,6 -8,11 -3,17 3,17 8,11 9,6 7,2 H 57 l 6,7 6,6 5,4 2,2 L 88,81 75,64 82,53 85,36 82,18 74,7 65,2 58,0 Zm -5,14 h 27 v 43 h -27 z`,
    size: 75,
  },
  R: {
    path: `M 65,73 65,73 63,71 58,66 52,56 46,42 H 41 l -1,12 -2,9 -2,6 -1,2 H 22 V 0 h 40 l 3,1 5,4 5,6 2,8 -2,10 -9,12 12,25 -12,7 M 54,14 H 41 V 27 H 54 V 14`,
    size: 70,
  },
  S: {
    path: `M 27,71 V 57 h 27 L 39,44 28,31 25,20 32,5 45,0 h 28 v 14 h -29 l 9,9 8,8 8,8 5,14 -2,9 -6,9 h -40`,
    size: 60,
  },
  T: {
    path: `M 41,71 V 14 H 24 V 0 h 52 v 14 h -17 v 57 h -18`,
    size: 75,
  },
  U: {
    path: `m 60,0 h 18 v 47 l -0,1 -0,3 c -1,3 -2,6 -3,9 L 66,68 50,72 34,69 25,61 22,52 22,48 21,47 V 0 H 40 V 58 H 60 V 0`,
    size: 70,
  },
  V: {
    path: `M 22,71 V 0 h 18 v 57 h 21 V 0 h 18 v 45 l -1,6 -5,9 -10,8 -16,4 z`,
    size: 70,
  },
  W: {
    path: `m 41,71 v -4 l -6,3 -8,1 H 7 V 0 h 19 v 57 h 14 V 0 h 18 v 57 h 15 V 0 h 19 v 45 l -1,6 -5,9 -10,8 -16,4 h -20`,
    size: 75,
  },
  X: {
    path: `m 60,71 -0,-29 h -20 l -1,29 H 20 V 59 l 0,-3 1,-6 3,-7 5,-7 -5,-6 -3,-6 -1,-5 -0,-2 -0,-1 V 0 h 19 l 0,28 h 22 L 61,0 h 19 v 16 l -0,3 -1,5 -3,6 -5,6 5,7 3,7 1,6 0,3 v 12 h -20`,
    size: 75,
  },
  Y: {
    path: `m 40,71 v -30 l -11,-5 -6,-8 -3,-7 -0,-3 -0,-1 V 0 H 39 V 28 H 61 V 0 h 19 v 17 l -0,3 -0,1 -2,7 -6,8 -11,6 V 71 H 40`,
    size: 75,
  },
  Z: {
    path: `M 22,71 V 57 L 51,14 H 23 V 0 h 53 l 0,2 -0,3 -1,4 -4,11 -5,7 -7,9 -9,10 -12,11 H 78 V 71 H 22`,
    size: 75,
  },
  1: {
    path: `M 46,71 V 13 H 36 V 0 h 28 v 71 h -18`,
    size: 75,
  },
  2: {
    path: `M 25,71 V 57 L 55,13 H 29 V 0 h 29 l 7,5 3,6 1,8 -5,17 -8,10 -12,11 h 30 v 14 h -50`,
    size: 75,
  },
  3: {
    path: `M 42,69 54,40 H 26 V 27 H 46 L 52,13 H 27 V 0 h 28 l 8,5 5,12 -4,11 6,5 3,10 -4,14 -14,17 -14,-5`,
    size: 75,
  },
  4: {
    path: `M 52,73 V 59 H 24 L 24,46 29,31 32,23 35,16 42,0 58,7 l -2,7 -2,6 h 16 v 25 H 76 V 59 H 69 V 73 H 52 m 0,-48 -5,9 -4,6 -3,4 -1,1 H 52 V 25`,
    size: 75,
  },
  5: {
    path: `m 43,68 11,-31 h -27 V 0 h 42 V 13 H 44 V 25 h 18 l 7,5 3,5 1,7 -4,14 -14,17 -14,-5`,
    size: 75,
  },
  6: {
    path: `m 32,71 -4,-9 -2,-12 -1,-6 -0,-5 -0,-5 2,-16 5,-11 6,-6 L 43,0 h 25 v 14 h -25 v 13 h 24 l 1,2 3,4 3,7 1,9 -1,10 -5,12 h -37 m 26,-30 h -15 v 16 h 15 V 41`,
    size: 75,
  },
  7: {
    path: `M 34,67 53,13 H 26 V 0 H 74 l 0,1 0,4 -1,9 -3,14 -7,19 -6,11 -7,13 -16,-5`,
    size: 75,
  },
  8: {
    path: `m 32,71 c -1,-2 -2,-4 -3,-5 l -2,-6 -1,-8 1,-7 2,-8 -2,-12 1,-11 L 32,0 h 35 c 1,2 3,4 4,6 l 2,7 1,9 -3,14 2,6 1,8 -1,10 -5,12 h -37 m 26,-57 h -15 v 14 h 15 V 14 m 0,29 h -15 v 14 h 15 V 43`,
    size: 75,
  },
  9: {
    path: `M 28,71 V 57 h 29 V 44 h -26 l -5,-8 -2,-10 1,-10 2,-8 2,-6 1,-2 h 34 l 6,9 3,12 1,6 1,8 c 0,2 -0,4 -0,5 l -1,4 -1,5 -4,12 -8,10 h -34 m 29,-57 h -16 V 30 h 16 V 14`,
    size: 75,
  },
  0: {
    path: `M 32,71 C 30,68 29,64 28,61 L 26,49 25,35 26,18 31,0 h 36 c 2,3 3,6 4,9 l 3,11 1,15 -1,17 -5,20 H 32 M 55,14 H 45 V 57 h 10 V 14`,
    size: 75,
  },
  " ": {
    size: 35,
  },
};

export function drawText(
  text: string,
  { fill = "white", stroke = undefined, lineWidth = 2 } = {}
) {
  const { ctx } = Stage;

  let totalLength = 0;
  let char: Letter;

  ctx.save();
  ctx.translate(-10, 0);
  for (let i = 0, x = 0; i < text.length; i++, x += char?.size ?? 0) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    char = KUROKANE[text[i].toUpperCase()];
    totalLength += char?.size ?? 0;
    const p = new Path2D(char?.path ?? ``);
    p.closePath();
    fill && ctx.fill(p);
    stroke && ctx.stroke(p);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    // ctx.strokeRect(0, 0, char?.size ?? 0, 100);
    ctx.translate(char?.size, 0);
  }
  ctx.restore();
}

export function engrave(text: string): { path: Path2D; length: number } {
  let length = 0;
  const acc = new Path2D();
  const mat = new DOMMatrix();

  Array.from(text)
    .map((c) => KUROKANE[c.toUpperCase()])
    .forEach(({ size = 0, path = "" }) => {
      const p = new Path2D(path);
      p.closePath();
      acc.addPath(p, mat);
      length += size;
      mat.translateSelf(size, 0, 0);
    });

  return { path: acc, length };
}
