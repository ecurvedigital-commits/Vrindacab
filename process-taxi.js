const sharp = require('sharp');
const fs = require('fs');

async function processTaxi() {
  const inputPath = 'd:/Websites/Vrindacab/assets/indian-taxi-dzire.jpg';
  const outputPath = 'd:/Websites/Vrindacab/assets/indian-taxi-dzire.png';

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function addPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;

    const offset = idx * channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    // Background is near white
    if (r > 235 && g > 235 && b > 235) {
      queue.push(idx);
    }
  }

  // Seed borders
  for (let x = 0; x < width; x++) {
    addPixel(x, 0);
    addPixel(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    addPixel(0, y);
    addPixel(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    const offset = idx * channels;
    data[offset + 3] = 0; // Set alpha to 0

    const x = idx % width;
    const y = Math.floor(idx / width);

    const neighbors = [
      [x + 1, y], [x - 1, y],
      [x, y + 1], [x, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx]) {
          visited[nIdx] = 1;
          const nOffset = nIdx * channels;
          const nr = data[nOffset];
          const ng = data[nOffset + 1];
          const nb = data[nOffset + 2];
          // Background threshold
          if (nr > 230 && ng > 230 && nb > 230) {
            queue.push(nIdx);
          }
        }
      }
    }
  }

  // Save trimmed transparent PNG
  await sharp(data, {
    raw: { width, height, channels }
  })
  .png()
  .toFile(outputPath);

  console.log('Successfully created transparent Indian taxi PNG:', outputPath);
}

processTaxi().catch(err => {
  console.error(err);
  process.exit(1);
});
