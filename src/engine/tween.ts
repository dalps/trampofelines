import { damp } from "../utils/MathUtils";
import { Clock } from "../utils/TimeUtils";
import { EntityManager } from "./EntityManager";

const EPSILON = 0.001;

interface Drawable {
  draw(): void;
}

export class TweenManager {
  private static activeTweens: Map<string, Tween<any>> = new Map();

  static add(t: Tween<any>) {
    // Cancel any existing tweens running on the same object and property
    [...this.activeTweens.values()].forEach(otherTween => {
      if (otherTween.obj === t.obj && otherTween.property === t.property) {
        this.activeTweens.delete(otherTween.id);
      }
    });

    t.id = crypto.randomUUID();
    this.activeTweens.set(t.id, t);
  }

  static delete(t: Tween<any>) {
    this.activeTweens.delete(t.id);
  }

  static update() {
    this.activeTweens.forEach(t => t.update());
  }
}

/**
 * A tween over a one-dimensional property of an object.
 */
export class Tween<T> {
  public id: string;
  private value: number;
  private startValue: number;
  private targetValue: number;
  public speed: number;
  private onUpdate?: Function;
  private onComplete?: Function;
  private epsilon: number;

  constructor(
    public obj: T,
    public property: keyof T,
    {
      startValue = undefined,
      finalValue = 1,
      speed = 7,
      onUpdate = obj.draw?.bind(obj) ?? undefined,
      onComplete = undefined,
      epsilon = EPSILON,
    } = {}
  ) {
    this.startValue = startValue ?? this.obj[property];
    this.value = this.startValue;
    this.targetValue = finalValue;
    this.speed = speed;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.epsilon = epsilon;

    TweenManager.add(this);
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

    if (Math.abs(this.value - this.targetValue) < this.epsilon) {
      this.obj[this.property] = this.targetValue;
      this.onComplete && this.onComplete();
      TweenManager.delete(this);
      return;
    }
  }
}
