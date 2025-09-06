import { BasketballCourt } from "../entities/BasketballCourt";
import { drawCatFace, drawCatRear } from "../entities/Trampofeline";
import { drawGameoverUI, GAMESTATE, restart, State, title } from "../GameState";
import { drawTitle } from "../type";
import { Point } from "./MathUtils";

export const restartBtn = document.getElementById("restart-btn");
export const playBtn = document.getElementById("play-btn");
export const quitBtn = document.getElementById("quit-btn");
export const playInfiniteBtn = document.getElementById("play-infinite-btn");
export const titleElements = document.getElementById("title");
export const gameoverElements = document.getElementById("gameover");

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

export type LayerName = "background" | "game" | "ui" | string;

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

    restartBtn.addEventListener("click", restart);
    playInfiniteBtn.addEventListener("click", restart);
    quitBtn.addEventListener("click", title);

    const liveLayers = ["background", "game", "ui"];
    liveLayers.forEach((name, i) => {
      const layer = document.createElement("canvas", {
        is: "my-canvas",
      });
      layer.id = name;
      layer.style.zIndex = `${i}`;
      this._layers.set(name, layer as MyCanvas);
      stage.appendChild(layer);
    });

    this.setActiveLayer("game");

    Stage.newOffscreenLayer("catFace", 50, 100);
    Stage.setActiveLayer("catFace");
    Stage.ctx.translate(25, 50);
    drawCatFace();
    
    Stage.newOffscreenLayer("catRear", 50, 100);
    Stage.setActiveLayer("catRear");
    Stage.ctx.translate(25, 50);
    drawCatRear();

    this.fitLayersToStage(liveLayers);

    window.addEventListener("resize", () =>
      this.fitLayersToStage(["game", "ui", "background"])
    );
  }

  static newOffscreenLayer(name: string, width: number, height: number) {
    const newLayer = document.createElement("canvas", { is: "my-canvas" });
    newLayer.width = width;
    newLayer.height = height;
    this._layers.set(name, newLayer as MyCanvas);
  }

  static fitLayersToStage(layers: LayerName[]) {
    layers.forEach((layer) => {
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
        BasketballCourt.draw();
        break;
      case State.GameOver:
        BasketballCourt.draw();
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
