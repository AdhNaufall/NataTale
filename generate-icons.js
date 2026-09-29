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

// Inigo Quilez 2D Heart Signed Distance Function
function sdHeart(x, y) {
  // x in [-1, 1], y in [-1, 1], y positive is UP
  x = Math.abs(x);
  if (y + x > 1.0) {
    return Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) - Math.SQRT1_2;
  }
  const dotVal = (x * 0.5 + (y - 0.5) * 0.5);
  const proj = Math.max(0.0, Math.min(1.0, dotVal / 0.5));
  const dx = x - 0.5 * proj;
  const dy = y - 0.5 * proj;
  return Math.sqrt(dx * dx + dy * dy) * Math.sign(x - y);
}

// Robust heart SDF using standard polynomial
function evalHeart(px, py) {
  // py is UP
  const x = px * 1.25;
  const y = py * 1.25 - 0.1;
  // (x^2 + y^2 - 1)^3 - x^2 * y^3
  const a = x * x + y * y - 0.95;
  return a * a * a - x * x * y * y * y;
}

function drawNataTaleIcon(x, y, w, h, isMaskable = false) {
  const nx = (x / w) * 2 - 1; // [-1, 1]
  const ny = -((y / h) * 2 - 1); // [-1, 1], UP is positive

  // Background romantic gradient
  // #F8F6FD (top lavender tint) to #FAF6F8 (bottom rose tint)
  const bgT = (nx - ny + 2) / 4;
  const bgR = Math.round(248 * (1 - bgT) + 252 * bgT);
  const bgG = Math.round(246 * (1 - bgT) + 248 * bgT);
  const bgB = Math.round(254 * (1 - bgT) + 250 * bgT);

  const scale = isMaskable ? 0.65 : 0.82;
  // Shift center slightly down so heart visually balances
  const hVal = evalHeart(nx / scale, (ny + 0.12) / scale);

  const edgeSmooth = 0.05 / scale;

  if (hVal <= 0.0) {
    // Inside heart: Luxurious gradient from Soft Lavender (#BBA2E3) to Blossom Rose (#F4CFDF)
    const t = (nx / scale + (ny / scale) * 0.7) / 2 * 0.5 + 0.5;
    
    // Lavender: (187, 162, 227) -> Rose: (244, 185, 215)
    let hr = Math.round(187 * (1 - t) + 244 * t);
    let hg = Math.round(162 * (1 - t) + 185 * t);
    let hb = Math.round(227 * (1 - t) + 215 * t);

    // Subtle gentle highlight
    const highlightDist = Math.sqrt((nx / scale + 0.35) ** 2 + (ny / scale - 0.25) ** 2);
    const highlight = Math.max(0, 1 - highlightDist / 0.5) * 0.15;

    const r = Math.min(255, Math.round(hr + 255 * highlight));
    const g = Math.min(255, Math.round(hg + 255 * highlight));
    const b = Math.min(255, Math.round(hb + 255 * highlight));

    // Antialiasing on inner edge
    if (hVal > -edgeSmooth) {
      const alpha = -hVal / edgeSmooth;
      return [
        Math.round(r * alpha + bgR * (1 - alpha)),
        Math.round(g * alpha + bgG * (1 - alpha)),
        Math.round(b * alpha + bgB * (1 - alpha)),
        255
      ];
    }
    return [r, g, b, 255];
  } else if (hVal <= 0.08 && !isMaskable) {
    // Soft drop shadow
    const shadowAlpha = (0.08 - hVal) / 0.08 * 0.12;
    return [
      Math.round(bgR * (1 - shadowAlpha) + 160 * shadowAlpha),
      Math.round(bgG * (1 - shadowAlpha) + 140 * shadowAlpha),
      Math.round(bgB * (1 - shadowAlpha) + 190 * shadowAlpha),
      255
    ];
  }

  return [bgR, bgG, bgB, 255];
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
  const buf = createPNG(cfg.size, cfg.size, (x, y, w, h) => drawNataTaleIcon(x, y, w, h, cfg.maskable));
  const outPath = path.join(iconsDir, cfg.file);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${cfg.file} (${cfg.size}x${cfg.size})`);
}
