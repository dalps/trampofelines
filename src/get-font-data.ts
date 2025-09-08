// 1. Add the svg with the font characters in index.html
// 2. Import this script in main.ts and the code below will run
// 3. Grab the output from the console: right click > Copy Object
(() => {
  const fontData: Record<string, { path: string; size: number }> = {};
  const svg = document.querySelectorAll("path");

  Array.from(svg)
    .reverse()
    .forEach((char) => {
      const path = char
        .getAttribute("d")!
        .replaceAll(/\d+(\.\d+)?/g, (str) => Number.parseFloat(str).toFixed(1));
      const size = Math.round(char.getBBox().width);
      fontData[char.id.toUpperCase()] = { path, size };
    });

  console.log(fontData);
})();
