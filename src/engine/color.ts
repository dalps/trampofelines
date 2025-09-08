export abstract class Color {
  abstract alpha: number;
  setAlpha(v: number): this {
    this.alpha = v;
    return this;
  }
  abstract clone(): Color;
  abstract toString(): string;
}

export class RGBColor extends Color {
  constructor(
    public r = 255,
    public g = 255,
    public b = 255,
    public alpha = 1
  ) {
    super();
  }

  lighten(fac: number): Color {
    throw new Error("TODO");
  }

  clone(): RGBColor {
    return new RGBColor(this.r, this.g, this.b, this.alpha);
  }

  toString() {
    return `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
  }
}

export class HSLColor extends Color {
  constructor(
    public h = 120,
    public s = 100,
    public l = 100,
    public alpha = 1
  ) {
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

const PALETTE = {
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
  cardboard: new HSLColor(56, 38, 58), // "hsla(56, 38%, 58%, 1.00)"
  blue0: new HSLColor(210, 100, 35), // "hsla(210, 100%, 35%, 1.00)";
  blue1: new HSLColor(210, 100, 40), // "hsla(210, 100%, 40%, 1.00)",
  blue2: new HSLColor(210, 100, 50), // "hsla(210, 100%, 50%, 1.00)",
  blue3: new HSLColor(210, 100, 65), // "hsla(210, 100%, 65%, 1.00)",
};

export default PALETTE;

export function setTransparency(a: number) {
  for (let color of Object.values(PALETTE)) {
    color.alpha = a;
  }
}
