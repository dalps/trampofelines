import { drawTitle } from "../backdrops/Title";
import { City } from "../entities/City";
import { drawCatFace, drawCatRear } from "../entities/Trampofeline";
import { Point } from "../utils/MathUtils";
import PALETTE from "./color";
import { drawText, engrave } from "./font";
import { GAMESTATE, restart, State, title } from "./GameState";
import { drawGameoverUI, drawLives } from "./ui";

export const BUTTONS = {
  retry: { text: "Retry", onclick: restart },
  play: { text: "Play!", onclick: restart },
  quit: { text: "Quit", onclick: title },
};

export const titleElements = document.getElementById("title");
export const gameoverElements = document.getElementById("gameover");

const CANVASES = ["bg-static", "bg", "game", "game-info", "ui"];

export class MyCanvas extends HTMLCanvasElement {
  private _ctx: CanvasRenderingContext2D;
  private _rect: DOMRect;

  constructor(public name: string, public width = 480, public height = 480) {
    super();

    this.setSize(width, height);
  }

  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  get ctx(): CanvasRenderingContext2D {
    if (!this._ctx) this._ctx = this.getContext("2d")!;

    return this._ctx;
  }

  get rect(): DOMRect {
    return this._rect ?? (this._rect = this.getBoundingClientRect());
  }

  resolveMousePosition(e: MouseEvent): Point {
    if (e.offsetX) {
      return new Point(e.offsetX, e.offsetY);
    }

    return new Point(e.layerX, e.layerY);
  }

  resolveTouchPosition(e: Touch): Point {
    return new Point(e.clientX - this.rect.x, e.clientY - this.rect.y);
  }
}

customElements.define("my-canvas", MyCanvas, {
  extends: "canvas",
});

export type LayerName = "bg" | "game" | "ui" | string;

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
  public static clearLayer(layer: LayerName) {
    const { ctx, width, height } = Stage.getLayer(layer);

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

  static init(stage: HTMLElement) {
    this.stage = stage;

    // Create the buttons and draw their textures
    Object.entries(BUTTONS).forEach(([name, data]) => {
      const id = `${name}`;
      const node = document.getElementById(id);
      data["ref"] = node;
      this.newOffscreenLayer(id, 200, 48);
      this.setActiveLayer(id);
      const { cw, ch } = this;
      drawText(data.text, { pos: new Point(cw * 0.5, ch * 0.5), fontSize: 24 });
      node.appendChild(this.getLayer(id));
      node.onclick = data.onclick;
    });

    // Create the game's layers and add them to the DOM
    CANVASES.forEach((name, i) => {
      const layer = document.createElement("canvas", {
        is: "my-canvas",
      });
      layer.id = name;
      layer.style.zIndex = `${i}`;
      this._layers.set(name, layer as MyCanvas);
      stage.appendChild(layer);
    });

    this.setActiveLayer("game");

    const { white, blue0, blue1, blue2, blue3 } = PALETTE;
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
    const newLayer = document.createElement("canvas", { is: "my-canvas" });
    newLayer.width = width;
    newLayer.height = height;
    this._layers.set(name, newLayer as MyCanvas);
  }

  // I should probably stop resizing: it results in the game breaking, more code, wanky experience
  static fitLayersToStage() {
    CANVASES.forEach((layer) => {
      this.getLayer(layer).setSize(
        this.stage.clientWidth,
        this.stage.clientHeight
      );
    });

    // Redraw backgrounds
    switch (GAMESTATE.state) {
      case State.Title:
        drawTitle();
        break;
      case State.Playing:
        City.drawBackground();
        drawLives();
        break;
      case State.GameOver:
        drawGameoverUI();
        break;
    }
  }

  static debugOffscreenLayer(name: string) {
    const canvas = Stage.getLayer(name);
    Stage.stage.appendChild(canvas);
    canvas.style.border = "1px solid blue";
    canvas.style.zIndex = "9999";
  }
}
