export default class Clock {
  private static _then: number;
  private static _now: number = 0;
  private static _id = 0;
  private static _timers = new Map<
    number,
    { _elapsed: number; interval: number; cb: () => void }
  >();

  static get dt() {
    return this._now - this._then;
  }

  static update(time: number): number {
    this._then = this._now;
    this._now = time;

    this._timers.forEach((t) => {
      t._elapsed += this.dt;

      if (t._elapsed >= t.interval) {
        t.cb();
        t._elapsed = 0;
      }
    });

    return this.dt;
  }

  static cancelTimer(id: number) {
    this._timers.delete(id);
  }

  static every(interval: number, cb: () => void): number {
    const id = this._id;
    this._timers.set(id, {
      _elapsed: 0,
      interval,
      cb,
    });

    this._id++;
    return id;
  }
}
