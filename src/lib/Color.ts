export abstract class Color {
  abstract alpha: number;
  abstract clone(): Color;
  abstract toString(): string;
}

export class RGBColor extends Color {
  constructor(public r = 255, public g = 255, public b = 255, public alpha = 1) {
    super();
  }

  clone(): RGBColor {
    return new RGBColor(this.r, this.g, this.b, this.alpha);
  }

  toString() {
    return `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
  }
}

export class HSLColor extends Color {
  constructor(public h = 120, public s = 100, public l = 100, public alpha = 1) {
    super();
  }

  clone(): HSLColor {
    return new HSLColor(this.h, this.s, this.l, this.alpha);
  }

  lighten(fac: number): Color {
    const c = this.clone();
    c.l *= fac;
    return c;
  }

  toString() {
    return `hsla(${this.h},${this.s}%,${this.l}%,${this.alpha})`;
  }
}

export class Palette {
  public static colors: Record<string, Color> = {
    white: new RGBColor(),
    black: new RGBColor(0, 0, 0),
    pink: new RGBColor(255, 192, 203), // "#ffc0cb"
    hotPink: new HSLColor(330, 100, 71), // "hsla(330, 100%, 71%, 1.00)"
    coral: new HSLColor(16, 100, 66), // "hsla(16, 100%, 66%, 1.00)"
    fuchsia: new HSLColor(300, 100, 66), // "hsla(300, 100%, 66%, 1.00)"
    chartreuse: new HSLColor(131, 77, 44), // "hsla(131, 77%, 44%, 1.00)"
    nightBlue: new RGBColor(1, 17, 35), // "#011123"
    darkBlue: new RGBColor(17, 34, 54), // "#112236"
    blueGray: new RGBColor(85, 102, 121), // "#556679"
  };

  static setTransparency(a: number) {
    for (let color in this.colors) {
      this.colors[color].alpha = a;
    }
  }
}
