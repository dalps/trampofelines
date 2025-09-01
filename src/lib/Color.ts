export class RGBColor {
  constructor(public r = 255, public g = 255, public b = 255, public a = 1) {}

  toString() {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
}

export class HSLColor {
  constructor(public h = 120, public s = 1, public l = 1, public a = 1) {}

  toString() {
    return `hsl(${this.h},${this.s},${this.l},${this.a})`;
  }
}

export class Palette {
  public static colors = {
    white: new RGBColor(),
    black: new RGBColor(0, 0, 0),
    pink: new RGBColor(255, 192, 203), // "#ffc0cb"
    coatColor: new RGBColor(1, 17, 35), // "#011123"
    coatColor2: new RGBColor(17, 34, 54), // "#112236"
    detailColor: new RGBColor(85, 102, 121), // "#556679"
  };

  static setTransparency(a: number) {
    for (let color in this.colors) {
      this.colors[color].a = a;
    }
  }
}
