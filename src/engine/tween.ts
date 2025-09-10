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

/**
 * A tween over a one-dimensional property of an object.
 */
export class Tween<T> {
  private value: number;
  private startValue: number;
  private targetValue: number;
  public speed: number;
  private ref: WeakRef<this>;
  private onUpdate?: Function;
  private onComplete?: Function;

  constructor(
    public obj: T,
    public property: keyof T,
    {
      startValue = undefined,
      finalValue = 1,
      speed = 7,
      onUpdate = undefined,
      onComplete = undefined,
    } = {}
  ) {
    this.startValue = startValue ?? this.obj[property];
    this.value = this.startValue;
    this.targetValue = finalValue;
    this.speed = speed;
    this.ref = TweenManager.add(this);
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  update() {
    const dt = Clock.dt * 0.1;

    this.obj[this.property] = this.value = damp(
      this.value,
      this.targetValue,
      this.speed,
      dt
    );

    this.onUpdate && this.onUpdate();

    if (Math.abs(this.value - this.targetValue) <= EPSILON) {
      this.onComplete && this.onComplete();
      TweenManager.delete(this.ref);
      return;
    }
  }
}
