export class MyCanvas extends HTMLCanvasElement {
  private _ctx: CanvasRenderingContext2D;
  private _rect: DOMRect;

  constructor(public name: string, public width = 480, public height = 480) {
    super();

    const ctx = this.getContext("2d");

    if (!ctx) {
      throw new Error(`Context not available :(`);
    }

    this._ctx = ctx;
  }

  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  get ctx(): CanvasRenderingContext2D {
    return this._ctx ?? this.getContext("2d")!;
  }

  get rect(): DOMRect {
    return this._rect ?? (this._rect = this.getBoundingClientRect());
  }
}

export type LayerName = "background" | "game" | "ui";

export class Stage {
  public static stage: HTMLElement;
  private static _activeLayer: MyCanvas;

  /**
   *  Set the active layer.
   */
  public static setActiveLayer(layer: LayerName) {
    this._activeLayer = this.layers.get(layer);
    return this._activeLayer;
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

  public static layers: Map<LayerName, MyCanvas> = new Map();

  static init(stage: HTMLElement) {
    this.stage = stage;

    console.log("Setting the stage...");

    customElements.define("my-canvas", MyCanvas, {
      extends: "canvas",
    });

    ["background", "game", "ui"].forEach((name, i) => {
      const layer = document.createElement("canvas", {
        is: "my-canvas",
      });
      layer.id = name;
      layer.style.zIndex = `${i}`;
      this.layers.set(name as LayerName, layer as MyCanvas);
      stage.appendChild(layer);
    });

    this.setActiveLayer("game");
    this.setSizes();
    window.addEventListener("resize", this.setSizes.bind(this));
  }

  static setSizes() {
    this.layers.forEach((layer) => {
      layer.setSize(this.stage.clientWidth, this.stage.clientHeight);
    });
  }
}
