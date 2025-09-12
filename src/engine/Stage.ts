import { Basket } from "../entities/Basket";
import { drawCatFace, drawCatRear } from "../entities/Trampofeline";
import { City } from "../scenes/City";
import { Title2 } from "../scenes/Title2";
import { Point } from "../utils/Point";
import PALETTE, { HSLColor } from "./color";
import { drawText } from "./font";
import Game, { State } from "./GameState";
import { MyCanvas } from "./MyCanvas";
import { drawGameoverUI, drawLives } from "./ui";

export type LayerName = string;

export const titleElements = document.getElementById("title");
export const gameoverElements = document.getElementById("gameover");

const CANVASES = ["bg", "game", "info", "ui"];
let BUTTONS: HTMLButtonElement[];

export class Stage {
  private static _layers: Map<LayerName, MyCanvas> = new Map();
  public static stage: HTMLElement;
  private static _activeLayer: MyCanvas;

  /**
   *  Set the active layer.
   */
  public static setActiveLayer(layer: LayerName) {
    this._activeLayer = this._layers.get(layer);
  }

  public static getLayer(layer: LayerName): MyCanvas {
    return this._layers.get(layer);
  }

  /**
   * Clear the specified layer without affecting the active layer.
   */
  public static clearLayer(layer?: LayerName) {
    const { ctx, width, height } = layer
      ? Stage.getLayer(layer)
      : Stage.activeLayer;

    ctx.clearRect(0, 0, width, height);
  }

  /**
   *  The active layer.
   */
  public static get activeLayer(): MyCanvas {
    return this._activeLayer;
  }

  /**
   *  The width of the active layer.
   */
  public static get cw(): number {
    return this.activeLayer.width;
  }

  /**
   *  The height of the active layer.
   */
  public static get ch(): number {
    return this.activeLayer.height;
  }

  /**
   *  The working context of the active layer.
   */
  public static get ctx(): CanvasRenderingContext2D {
    return this.activeLayer.ctx;
  }

  static init() {
    this.stage = document.getElementById("stage");

    Basket.drawCrissCrossPattern();

    // Create the buttons with their textures
    BUTTONS = [
      ["retry", () => Game.restart(), PALETTE.coral],
      ["bye", () => Game.title(), PALETTE.blue2],
      ["start", () => Game.restart(), PALETTE.blue2],
    ].map(([id, action, color]: [string, () => void, HSLColor]) => {
      const btn = document.getElementById(id) as HTMLButtonElement;
      const { x: w, y: h } = new Point(200, 48);

      this.newOffscreenLayer(id, w, h);
      btn.style.width = `${w}px`;
      btn.style.height = `${h}px`;
      btn.style.background = color;

      this.setActiveLayer(id);

      drawText(id, { pos: new Point(w * 0.5, h * 0.5), fontSize: 24 });
      btn.appendChild(this.getLayer(id));
      btn.onclick = action;

      return btn;
    });

    // Create the game's layers and add them to the DOM
    CANVASES.forEach((name, i) => {
      const layer = new MyCanvas(name);

      layer.id = name;
      layer.style.zIndex = `${i}`;

      this._layers.set(name, layer);
      this.stage.appendChild(layer);
    });

    const { blue0, blue1, blue3 } = PALETTE;
    Stage.newOffscreenLayer("catFace", 50, 100);
    Stage.setActiveLayer("catFace");
    Stage.ctx.translate(25, 50);
    drawCatFace({
      coatColor: blue1,
      detailColor: blue0,
      white: blue3,
      black: blue0,
      pink: blue3,
      drawPaws: false,
    });

    this.fitLayersToStage();

    window.addEventListener("resize", this.fitLayersToStage.bind(this));
  }

  static newOffscreenLayer(name: string, width: number, height: number) {
    const newLayer = new MyCanvas(name, width, height);
    this._layers.set(name, newLayer);
  }

  static fitLayersToStage() {
    const [cw, ch] = [this.stage.clientWidth, this.stage.clientHeight];

    CANVASES.forEach(layer => {
      this.getLayer(layer).setSize(cw, ch);
    });

    if (ch / cw < 0.65) {
      BUTTONS[0].style.bottom = BUTTONS[1].style.bottom;
      BUTTONS[0].style.left = `${cw * 0.5 - 220}px`;
      BUTTONS[1].style.left = `${cw * 0.5 + 20}px`;
    } else {
      BUTTONS[0].style.bottom = "30%";
      BUTTONS[0].style.left = `${cw * 0.5 - 100}px`;
      BUTTONS[1].style.left = `${cw * 0.5 - 100}px`;
    }

    // Redraw backgrounds
    City.draw();

    switch (Game.state) {
      case State.Title:
        break;
      case State.Playing:
        drawLives();
        break;
      case State.GameOver:
        drawGameoverUI();
        break;
    }
  }

  // static debugOffscreenLayer(name: string) {
  //   const canvas = Stage.getLayer(name);
  //   Stage.stage.appendChild(canvas);
  //   canvas.style.border = "1px solid blue";
  //   canvas.style.zIndex = "9999";
  // }
}
