import { drawCatFace } from "../entities/Trampofeline";
import { YarnBall } from "../entities/YarnBall";
import { billboard, circle, star } from "../utils/CanvasUtils";
import { lerp } from "../utils/MathUtils";
import { Point } from "../utils/Point";
import palette, { hsl, HSLColor } from "./color";
import { drawText } from "./font";
import Game, { TOTAL_LIVES } from "./GameState";
import { Stage } from "./Stage";

const LANGUAGES = ["en", "it"];
const MESSAGES = {
  "go!": {
    it: "via!",
  },
  "felines!": {
    it: "felini!",
  },
  "again": {
    it: "di nuovo",
  },
  "bye": {
    it: "basta",
  },
  "score": {
    en: stock => `${stock} basket${stock === 1 ? "" : "s"}`,
    it: stock => `${stock} cestin${stock === 1 ? "o" : "i"}`,
  },
  "final-score": {
    en: stock => `you filled ${stock} basket${stock === 1 ? "" : "s"}`,
    it: stock => `hai riempito ${stock} cestin${stock === 1 ? "o" : "i"}`,
  },
  "new record!": {
    it: `nuovo record!`,
  },
  "help": {
    en: [
      `draw trampofelines on the screen`,
      `to make the yarn balls bounce`,
      ``,
      `fill up the baskets to capacity`,
      ``,
      `game over if you drop three balls`,
    ],
    it: [
      `disegna trampofelini sullo schermo`,
      `per far rimbalzare i gomitoli`,
      ``,
      `riempi i cestini fino al numero indicato`,
      ``,
      `perdi se fai cadere tre gomitoli`,
    ],
  },
  "how to play": {
    it: "come si gioca",
  },
  "nice!": {
    it: "ottimo!",
  },
  "missed": {
    en: n => `missed ${n}`,
    it: n => `perso ${n}`,
  },
};

export function getLanguage() {
  const browserLang = window.navigator.language.split("-").at(0);
  return LANGUAGES.includes(browserLang) ? browserLang : "en";
}

export function getMessage(key: keyof typeof MESSAGES) {
  return MESSAGES[key][Game.language] ?? key;
}

export function drawHelp() {
  Stage.setActiveLayer("info");
  const center = new Point(Stage.cw * 0.5, Stage.ch * 0.3);
  const lines = getMessage("help") as string[];
  const fontSize = 14;
  const padding = 5;
  const size = new Point(
    Math.min(400, Stage.cw * 0.9),
    (lines.length + 2) * fontSize
  );

  billboard(center.sub(size.scale(0.5).addX(padding)), {
    width: size.x,
    height: size.y,
    color1: palette.white,
    color2: palette.gray,
    padding,
    beamLength: 0,
    content() {
      lines.forEach((line, i) => {
        drawText(line, {
          fontSize,
          pos: size
            .scale(0.5)
            .addY(-lines.length * fontSize * 0.5 + i * fontSize + padding * 2),
          fill: palette.blueGray,
        });
      });
    },
  });
}

export function drawLives() {
  Stage.setActiveLayer("info");
  Stage.clearLayer();
  const { ctx, cw } = Stage;

  const sectionSize = 55;
  const radius = 20;
  const pos = new Point(cw * 0.5 - 1.5 * sectionSize, 20);
  const center = new Point(sectionSize * 0.5, sectionSize * 0.5);

  ctx.lineCap = ctx.lineJoin = "round";

  const cross = (lineWidth: number, color: HSLColor) => {
    ctx.lineWidth = lineWidth;
    star(pos.add(center), {
      points: 4,
      innerRadius: 0,
      outerRadius: 18,
      ctx,
      stroke: color, // hsla(0, 100%, 50%, 1.00)
      angle: Math.PI / 4,
    });
  };

  for (let i = 0; i < TOTAL_LIVES - Game.lives; i++) {
    cross(8, palette.white);
    cross(4, hsl(0, 100, 50));
    pos.incrX(sectionSize);
  }

  for (let i = 0; i < Game.lives; i++) {
    YarnBall.drawTexture(pos.add(center), {
      radius,
      color: palette.fuchsia,
      lineWidth: 2,
      decoration: true,
    });

    pos.incrX(sectionSize);
  }

  drawText(getMessage("score")(Game.stock), {
    pos: new Point(cw * 0.5, 100),
    fontSize: 18,
    fill: Game.stock > Game.prevRecord ? palette.brightYellow : palette.white,
  });
}

export function drawGameoverUI(newRecord = false) {
  Stage.setActiveLayer("info");
  // no clear, draw on top of the old UI
  const { ctx, cw, ch } = Stage;

  ctx.fillStyle = palette.black.toAlpha(0.5);
  ctx.fillRect(0, 0, cw, ch);

  ctx.lineWidth = 3;
  let fontSize = 56; // lerp(20, 80, ...);
  drawText(`game over`, {
    pos: new Point(cw * 0.5, ch * 0.5 - fontSize),
    fill: palette.blue3,
    stroke: palette.blue0,
    fontSize,
  });

  fontSize = 24; // lerp(20, 28, ...);
  drawText(getMessage("final-score")(Game.stock), {
    pos: new Point(cw * 0.5, ch * 0.5),
    fontSize,
  });

  if (newRecord) {
    drawText(getMessage("new-record"), {
      pos: new Point(cw * 0.5, ch * 0.5 + 28),
      fontSize,
      fill: palette.brightYellow,
    });
  }
}

export function drawFavicon() {
  const originalSize = 50;
  const size = 50;
  const scale = size / originalSize;
  const pos = new Point(size * 0.5, size * 0.625);

  Stage.newOffscreenLayer("cat", size, size);
  Stage.setActiveLayer("cat");
  Stage.debugOffscreenLayer("cat");
  const { ctx, activeLayer } = Stage;

  ctx.translate(pos.x, pos.y);
  ctx.scale(scale, scale);

  drawCatFace({ drawPaws: false });

  const url = activeLayer.toDataURL("image/png", 0); // can only set quality for image/jpeg
  console.log(url);
  console.log(url.length);
}
