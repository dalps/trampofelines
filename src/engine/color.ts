export abstract class Color {
  abstract alpha: number;

  setAlpha(v: number): this {
    this.alpha = v;
    return this;
  }

  toAlpha(v: number): Color {
    return this.clone().setAlpha(v);
  }

  abstract clone(): Color;

  abstract toString(): string;
}

export class HSLColor extends Color {
  constructor(public h = 0, public s = 0, public l = 0, public alpha = 1) {
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
  black: new HSLColor(0, 0, 0), // hsla(0, 0%, 0%, 1.00)
  white: new HSLColor(0, 0, 100), // hsla(0, 0%, 100%, 1.00)
  gray: new HSLColor(0, 0, 75), // hsla(0, 0%, 75%, 1.00)
  pink: new HSLColor(350, 100, 88), // hsla(350, 100%, 88%, 1.00)
  hotPink: new HSLColor(330, 100, 71), // hsla(330, 100%, 71%, 1.00)
  coral: new HSLColor(16, 100, 66), // hsla(16, 100%, 66%, 1.00)
  fuchsia: new HSLColor(300, 100, 66), // hsla(300, 100%, 66%, 1.00)
  chartreuse: new HSLColor(131, 77, 44), // hsla(131, 77%, 44%, 1.00)
  tube1: new HSLColor(120, 62, 45), // hsla(120, 62%, 45%, 1.00)
  tube2: new HSLColor(120, 53, 34), // hsla(120, 53%, 34%, 1.00),
  nightBlue: new HSLColor(212, 94, 7), // hsla(212, 94%, 7%, 1.00)
  darkBlue: new HSLColor(212, 52, 14), // hsla(212, 52%, 14%, 1.00)
  blueGray: new HSLColor(212, 18, 40), // hsla(212, 18%, 40%, 1.00)
  basket2: new HSLColor(26, 56, 39), // hsla(26, 56%, 39%, 1.00)
  basket1: new HSLColor(29, 54, 49), // hsla(29, 54%, 49%, 1.00)
  blue0: new HSLColor(210, 100, 35), // hsla(210, 100%, 35%, 1.00)
  blue1: new HSLColor(210, 100, 40), // hsla(210, 100%, 40%, 1.00)
  blue2: new HSLColor(210, 100, 50), // hsla(210, 100%, 50%, 1.00)
  blue3: new HSLColor(210, 100, 65), // hsla(210, 100%, 65%, 1.00)
};

export default PALETTE;

export function setTransparency(a: number) {
  for (let color of Object.values(PALETTE)) {
    color.alpha = a;
  }
}
