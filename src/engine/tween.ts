import { damp } from "../utils/MathUtils";
import { Clock } from "../utils/TimeUtils";

const EPSILON = 0.001;

interface Drawable {
  draw(): void;
}

export class TweenManager {
  private static activeTweens: Set<WeakRef<any>> = new Set();

  static add(tween) {
    const ref = new WeakRef(tween);
    this.activeTweens.add(ref);
    return ref;
  }

  static delete(ref: WeakRef<any>) {
    this.activeTweens.delete(ref);
  }

  static update() {
    for (let ref of this.activeTweens.values()) {
      ref.deref()?.update();
    }
  }
}

export class Tween<T> {
  private value: number;
  private startValue: number;
  private targetValue: number;
  public speed: number;
  private ref: WeakRef<this>;
  private cb?: Function;

  constructor(
    public obj: T,
    public property: keyof T,
    { startValue = 0, finalValue = 1, speed = 7, cb = undefined } = {}
  ) {
    this.value = startValue;
    this.startValue = startValue;
    this.targetValue = finalValue;
    this.speed = speed;
    this.ref = TweenManager.add(this);
    this.cb = cb;
  }

  update() {
    const dt = Clock.dt * 0.1;

    this.obj[this.property] = this.value = damp(
      this.value,
      this.targetValue,
      this.speed,
      dt
    );

    if (Math.abs(this.value - this.targetValue) <= EPSILON) {
      this.cb && this.cb();
      TweenManager.delete(this.ref);
    }

    this.obj.draw && this.obj.draw();
  }
}
