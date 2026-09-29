import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(typeStr, dataBuf) {
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(dataBuf.length, 0);

    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, dataBuf]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);

    return Buffer.concat([lenBuf, toCrc, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrBuf = Buffer.alloc(13);
  ihdrBuf.writeUInt32BE(width, 0);
  ihdrBuf.writeUInt32BE(height, 4);
  ihdrBuf[8] = 8;
  ihdrBuf[9] = 6;
  ihdrBuf[10] = 0;
  ihdrBuf[11] = 0;
  ihdrBuf[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdrBuf);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Distance to quadratic Bezier curve
function sdBezier(pos, A, B, C) {
  let minD2 = 1e9;
  const STEPS = 32;
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const omt = 1 - t;
    const px = omt * omt * A.x + 2 * omt * t * B.x + t * t * C.x;
    const py = omt * omt * A.y + 2 * omt * t * B.y + t * t * C.y;
    const dx = pos.x - px;
    const dy = pos.y - py;
    const d2 = dx * dx + dy * dy;
    if (d2 < minD2) minD2 = d2;
  }
  return Math.sqrt(minD2);
}

// Distance to doodle heart stroke loop
function doodleHeartDist(pos, cx, cy, size, angleRad) {
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const dx = pos.x - cx;
  const dy = pos.y - cy;
  const lx = (dx * cosA + dy * sinA) / size;
  const ly = (-dx * sinA + dy * cosA) / size;
  const lPos = { x: lx, y: ly };

  // 4 smooth segments defining cute playful doodle heart
  const pBottom = { x: -0.01, y: 0.46 };
  const pLeftCtrl = { x: -0.56, y: 0.12 };
  const pLeftLobe = { x: -0.45, y: -0.45 };
  const pLeftMid = { x: (pLeftCtrl.x + pLeftLobe.x) / 2, y: (pLeftCtrl.y + pLeftLobe.y) / 2 };

  const pCenterDip = { x: -0.01, y: -0.16 };
  const pRightLobe = { x: 0.44, y: -0.45 };
  const pRightCtrl = { x: 0.56, y: 0.14 };
  const pRightMid = { x: (pRightLobe.x + pRightCtrl.x) / 2, y: (pRightLobe.y + pRightCtrl.y) / 2 };

  const d1 = sdBezier(lPos, pBottom, pLeftCtrl, pLeftMid);
  const d2 = sdBezier(lPos, pLeftMid, pLeftLobe, pCenterDip);
  const d3 = sdBezier(lPos, pCenterDip, pRightLobe, pRightMid);
  const d4 = sdBezier(lPos, pRightMid, pRightCtrl, pBottom);

  return Math.min(d1, d2, d3, d4) * size;
}

const HEARTS = [
  { cx: 0.48, cy: 0.43, size: 0.33, angle: -0.12, stroke: 0.038 }, // Main center
  { cx: 0.17, cy: 0.25, size: 0.15, angle: -0.22, stroke: 0.022 }, // Top-left
  { cx: 0.83, cy: 0.16, size: 0.14, angle: 0.18, stroke: 0.021 },  // Top-right
  { cx: 0.21, cy: 0.76, size: 0.20, angle: -0.15, stroke: 0.027 }, // Bottom-left
  { cx: 0.52, cy: 0.83, size: 0.12, angle: 0.08, stroke: 0.020 },  // Bottom-middle
  { cx: 0.81, cy: 0.76, size: 0.20, angle: 0.22, stroke: 0.027 }   // Bottom-right
];

function drawWhiteDoodleIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background: Romantic Dreamy Gradient
  // Soft Lavender (#BBA2E3) top-left -> Gentle Rose/Peach (#F4CFDF / #ECA7C3) bottom-right
  const gradT = (nx + ny) / 2;
  const bgR = Math.round(180 * (1 - gradT) + 242 * gradT);
  const bgG = Math.round(160 * (1 - gradT) + 195 * gradT);
  const bgB = Math.round(228 * (1 - gradT) + 220 * gradT);

  // Maskable scale adjustment
  const scale = isMaskable ? 0.76 : 0.90;
  const centeredX = (nx - 0.5) / scale + 0.5;
  const centeredY = (ny - 0.5) / scale + 0.5;
  const pos = { x: centeredX, y: centeredY };

  let minStrokeDist = 1e9;
  let strokeWidth = 0.025;

  for (let i = 0; i < HEARTS.length; i++) {
    const hInfo = HEARTS[i];
    const d = doodleHeartDist(pos, hInfo.cx, hInfo.cy, hInfo.size, hInfo.angle);
    if (d < minStrokeDist) {
      minStrokeDist = d;
      strokeWidth = hInfo.stroke;
    }
  }

  let r = bgR;
  let g = bgG;
  let b = bgB;

  // Soft Drop Shadow with offset (down and right slightly for 3D sticker look)
  const shadowDist = minStrokeDist - strokeWidth;
  if (shadowDist > 0 && shadowDist < 0.04) {
    const shadowAlpha = (1 - shadowDist / 0.04) * 0.18;
    r = Math.round(r * (1 - shadowAlpha) + 120 * shadowAlpha);
    g = Math.round(g * (1 - shadowAlpha) + 100 * shadowAlpha);
    b = Math.round(b * (1 - shadowAlpha) + 160 * shadowAlpha);
  }

  // Crisp, luminous white doodle heart stroke with subtle smooth antialiasing
  if (minStrokeDist <= strokeWidth) {
    const edge = strokeWidth - minStrokeDist;
    const smooth = Math.min(1, edge / 0.006);

    const strokeR = 255;
    const strokeG = 255;
    const strokeB = 255;

    r = Math.round(strokeR * smooth + r * (1 - smooth));
    g = Math.round(strokeG * smooth + g * (1 - smooth));
    b = Math.round(strokeB * smooth + b * (1 - smooth));
  }

  return [Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b)), 255];
}

const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const configs = [
  { file: 'icon-192x192.png', size: 192, maskable: false },
  { file: 'icon-512x512.png', size: 512, maskable: false },
  { file: 'icon-maskable-192x192.png', size: 192, maskable: true },
  { file: 'icon-maskable-512x512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
  { file: 'favicon.png', size: 64, maskable: false }
];

for (const cfg of configs) {
  const buf = createPNG(cfg.size, cfg.size, (x, y, w, h) => drawWhiteDoodleIcon(x, y, w, h, cfg.maskable));
  const outPath = path.join(iconsDir, cfg.file);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${cfg.file} (${cfg.size}x${cfg.size})`);
}
