const sharp = require('sharp');
const fs = require('fs');

async function testPath() {
  const mapBuffer = await sharp('d:/Websites/Vrindacab/assets/delhi-agra-gps-map.webp').toBuffer();
  
  const points = [
    {x: 140, y: 32},
    {x: 230, y: 32},
    {x: 310, y: 32},
    {x: 350, y: 104},
    {x: 390, y: 100},
    {x: 430, y: 138},
    {x: 470, y: 174},
    {x: 510, y: 198},
    {x: 550, y: 210},
    {x: 590, y: 230},
    {x: 630, y: 272},
    {x: 670, y: 310},
    {x: 710, y: 334},
    {x: 750, y: 362},
    {x: 790, y: 388},
    {x: 830, y: 420},
    {x: 870, y: 456},
    {x: 910, y: 480},
    {x: 950, y: 502},
    {x: 1030, y: 512},
    {x: 1070, y: 532},
    {x: 1110, y: 556},
    {x: 1150, y: 596},
    {x: 1180, y: 618},
    {x: 1240, y: 635},
    {x: 1450, y: 645}
  ];

  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    pathD += ` Q ${p0.x},${p0.y} ${mx},${my}`;
  }
  const last = points[points.length - 1];
  pathD += ` L ${last.x},${last.y}`;

  console.log('Smooth Path D:');
  console.log(pathD);

  const svgOverlay = Buffer.from(`
    <svg width="1440" height="684" viewBox="0 0 1440 684" xmlns="http://www.w3.org/2000/svg">
      <path d="${pathD}" fill="none" stroke="#10b981" stroke-width="6" opacity="0.9" />
    </svg>
  `);

  await sharp(mapBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .toFile('d:/Websites/Vrindacab/assets/path-overlay-verified.jpg');

  console.log('Verified overlay image created!');
}

testPath().catch(console.error);
