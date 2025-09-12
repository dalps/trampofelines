import { Basket } from "../entities/Basket";
import { drawCatFace, drawCatRear } from "../entities/Trampofeline";
import { City } from "../scenes/City";
import { Title2 } from "../scenes/Title2";
import { Point } from "../utils/Point";
import PALETTE from "./color";
import { drawText } from "./font";
import Game, { State } from "./GameState";
import { MyCanvas } from "./MyCanvas";
import { drawGameoverUI, drawLives } from "./ui";

export type LayerName = string;

export const titleElements = document.getElementById("title");
export const gameoverElements = document.getElementById("gameover");

const CANVASES = ["bg", "game", "info", "ui"];

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
    [
      ["retry", () => Game.restart()],
      ["start", () => Game.restart()],
      ["bye", () => Game.title()],
    ].forEach(([id, action]: [string, () => void]) => {
      const btn = document.getElementById(id);
      const { x: w, y: h } = new Point(200, 48);

      this.newOffscreenLayer(id, w, h);
      btn.style.width = `${w}px`;
      btn.style.height = `${h}px`;

      this.setActiveLayer(id);

      drawText(id, { pos: new Point(w * 0.5, h * 0.5), fontSize: 24 });
      btn.appendChild(this.getLayer(id));
      btn.onclick = action;
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

    Stage.newOffscreenLayer("catRear", 50, 100);
    Stage.setActiveLayer("catRear");
    Stage.ctx.translate(25, 50);
    drawCatRear();

    this.fitLayersToStage();

    window.addEventListener("resize", this.fitLayersToStage.bind(this));
  }

  static newOffscreenLayer(name: string, width: number, height: number) {
    const newLayer = new MyCanvas(name, width, height);
    this._layers.set(name, newLayer);
  }

  static fitLayersToStage() {
    CANVASES.forEach(layer => {
      this.getLayer(layer).setSize(
        this.stage.clientWidth,
        this.stage.clientHeight
      );
    });

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
