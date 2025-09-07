export interface Backdrop {
  drawStatic(): () => void;
  draw(): () => void;
}
