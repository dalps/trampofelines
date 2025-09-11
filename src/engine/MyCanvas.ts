import { Point } from "../utils/MathUtils";

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
