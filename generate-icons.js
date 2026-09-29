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

function sdRoundedBox(px, py, bx, by, r) {
  const qx = Math.abs(px) - bx + r;
  const qy = Math.abs(py) - by + r;
  return Math.min(Math.max(qx, qy), 0.0) + Math.sqrt(Math.max(qx, 0.0) ** 2 + Math.max(qy, 0.0) ** 2) - r;
}

function distSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax, pay = py - ay;
  const bax = bx - ax, bay = by - ay;
  const h = Math.max(0.0, Math.min(1.0, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  return Math.sqrt(dx * dx + dy * dy);
}

// Predefined smooth aesthetic polygon vertices for a cute chubby heart
const HEART_POINTS = [
  [0.0, -0.66],       // bottom tip
  [0.15, -0.48],
  [0.32, -0.28],
  [0.48, -0.06],
  [0.62, 0.14],       // right tangent
  [0.72, 0.32],
  [0.72, 0.50],
  [0.64, 0.64],       // right peak outer
  [0.48, 0.72],       // right peak top
  [0.28, 0.68],       // right peak inner
  [0.10, 0.56],
  [0.0, 0.44],        // softer center cleft
  [-0.10, 0.56],
  [-0.28, 0.68],      // left peak inner
  [-0.48, 0.72],      // left peak top
  [-0.64, 0.64],      // left peak outer
  [-0.72, 0.50],
  [-0.72, 0.32],
  [-0.62, 0.14],      // left tangent
  [-0.48, -0.06],
  [-0.32, -0.28],
  [-0.15, -0.48]
];

function evaluateHeartPoly(px, py) {
  // Point in polygon test (ray casting)
  let inside = false;
  let minD = 1e9;
  const n = HEART_POINTS.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = HEART_POINTS[i][0], yi = HEART_POINTS[i][1];
    const xj = HEART_POINTS[j][0], yj = HEART_POINTS[j][1];

    // Distance to edge
    const dEdge = distSegment(px, py, xi, yi, xj, yj);
    if (dEdge < minD) minD = dEdge;

    // Ray casting
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return { isInside: inside, dBoundary: minD };
}

function drawCalendarStickerIcon(x, y, w, h, isMaskable = false) {
  const nx = (x / w) * 2 - 1;
  const ny = -((y / h) * 2 - 1); // UP is positive

  // Background: Romantic Dreamy Soft Gradient (#FAF8FE -> #FFF6F9)
  const bgT = (nx - ny + 2) / 4;
  const bgR = Math.round(248 * (1 - bgT) + 254 * bgT);
  const bgG = Math.round(245 * (1 - bgT) + 248 * bgT);
  const bgB = Math.round(254 * (1 - bgT) + 252 * bgT);

  const scale = isMaskable ? 0.74 : 0.88;
  const cx = nx / scale;
  const cy = ny / scale - 0.03;

  const calW = 0.72;
  const calH = 0.62;
  const calCorner = 0.16;
  const dCal = sdRoundedBox(cx, cy, calW, calH, calCorner);

  const strokeW = 0.024;
  const strokeColor = [44, 53, 69]; // #2C3545 Slate Black
  const bannerY = 0.25;

  // Binder Rings at top
  const ringX = 0.40;
  const ringY = calH - 0.01;
  const ringW = 0.07;
  const ringH = 0.16;
  const dRing1 = sdRoundedBox(cx - ringX, cy - ringY, ringW, ringH, ringW);
  const dRing2 = sdRoundedBox(cx + ringX, cy - ringY, ringW, ringH, ringW);
  const dRings = Math.min(dRing1, dRing2);

  // Sparkles
  function sdSparkle(spX, spY, size) {
    const dx = Math.abs(cx - spX);
    const dy = Math.abs(cy - spY);
    const dArm1 = Math.max(dx - size * 0.22, dy - size);
    const dArm2 = Math.max(dx - size, dy - size * 0.22);
    return Math.min(dArm1, dArm2);
  }
  const dSparkle1 = sdSparkle(0.24, 0.78, 0.07);
  const dSparkle2 = sdSparkle(-0.64, -0.74, 0.06);
  const dSparkles = Math.min(dSparkle1, dSparkle2);

  // 1. Sparkles
  if (dSparkles <= 0.015) {
    const smooth = Math.max(0, Math.min(1, (0.015 - dSparkles) / 0.008));
    return [
      Math.round(187 * smooth + bgR * (1 - smooth)),
      Math.round(162 * smooth + bgG * (1 - smooth)),
      Math.round(227 * smooth + bgB * (1 - smooth)),
      255
    ];
  }

  // 2. Soft Calendar Drop Shadow
  if (dCal > 0 && dCal < 0.15 && cy < 0.65) {
    const shadowAlpha = (1 - dCal / 0.15) * 0.18;
    return [
      Math.round(bgR * (1 - shadowAlpha) + 160 * shadowAlpha),
      Math.round(bgG * (1 - shadowAlpha) + 140 * shadowAlpha),
      Math.round(bgB * (1 - shadowAlpha) + 200 * shadowAlpha),
      255
    ];
  }

  // 3. Binder Rings
  if (dRings <= strokeW) {
    if (dRings <= 0.0) {
      return [255, 255, 255, 255]; // Pure White Ring
    }
    const smooth = Math.max(0, Math.min(1, (strokeW - dRings) / 0.006));
    return [
      Math.round(strokeColor[0] * smooth + bgR * (1 - smooth)),
      Math.round(strokeColor[1] * smooth + bgG * (1 - smooth)),
      Math.round(strokeColor[2] * smooth + bgB * (1 - smooth)),
      255
    ];
  }

  // 4. Inside Calendar Body
  if (dCal <= 0.0) {
    // Outer border stroke
    if (dCal >= -strokeW) {
      return [strokeColor[0], strokeColor[1], strokeColor[2], 255];
    }

    // Top Header Banner
    if (cy > bannerY) {
      if (Math.abs(cy - bannerY) <= strokeW * 0.8) {
        return [strokeColor[0], strokeColor[1], strokeColor[2], 255];
      }

      // Small cute pill highlight
      const dPill = sdRoundedBox(cx + 0.30, cy - 0.44, 0.08, 0.016, 0.016);
      if (dPill <= 0.0) {
        return [255, 255, 255, 255];
      }

      // Soft Lavender Banner (#C3B1E1 to #BBA2E3)
      const bannerT = (cx + 0.6) / 1.2;
      const banR = Math.round(195 * (1 - bannerT) + 187 * bannerT);
      const banG = Math.round(175 * (1 - bannerT) + 162 * bannerT);
      const banB = Math.round(230 * (1 - bannerT) + 227 * bannerT);
      return [banR, banG, banB, 255];
    }

    // --- Interlocking Hearts on Calendar Sheet ---
    const hScale = 0.42;
    const shiftX = 0.16;
    const heartCenterY = -0.16;

    // Left Heart (Blue)
    const hLeft = evaluateHeartPoly((cx + shiftX) / hScale, (cy - heartCenterY) / hScale);
    const distLeft = hLeft.dBoundary * hScale;

    // Right Heart (Pink)
    const hRight = evaluateHeartPoly((cx - shiftX) / hScale, (cy - heartCenterY) / hScale);
    const distRight = hRight.dBoundary * hScale;

    const strokeHeartW = 0.018;

    // Color Palette:
    // Left: Aesthetic Soft Sky Pastel Blue (#8EC5FC / #98CFF9)
    const blueColor = [148, 205, 250];
    // Right: Aesthetic Soft Rose Pink (#FBB6CE / #FFACBC)
    const pinkColor = [255, 178, 198];
    // Center Intersecting: Dreamy Lilac Purple (#C3A9F5)
    const purpleColor = [205, 175, 245];

    // Cute gloss shine pill on top-left lobe of left heart
    const dDotShine = Math.sqrt((cx + 0.28) ** 2 + (cy - 0.05) ** 2) - 0.024;
    // Cute gloss shine pill on top-right lobe of right heart
    const dDotShineR = Math.sqrt((cx - 0.28) ** 2 + (cy - 0.05) ** 2) - 0.020;

    // Heart Outline Strokes (Dark Slate)
    if (distLeft <= strokeHeartW || distRight <= strokeHeartW) {
      if (hLeft.isInside || hRight.isInside || distLeft <= strokeHeartW * 0.8 || distRight <= strokeHeartW * 0.8) {
        return [strokeColor[0], strokeColor[1], strokeColor[2], 255];
      }
    }

    // Intersecting Center Region (PURPLE ♡)
    if (hLeft.isInside && hRight.isInside) {
      return [purpleColor[0], purpleColor[1], purpleColor[2], 255];
    }

    // Left Heart (BLUE ♡)
    if (hLeft.isInside) {
      if (dDotShine <= 0.0) {
        return [255, 255, 255, 255]; // Gloss shine dot
      }
      return [blueColor[0], blueColor[1], blueColor[2], 255];
    }

    // Right Heart (PINK ♡)
    if (hRight.isInside) {
      if (dDotShineR <= 0.0) {
        return [255, 255, 255, 255]; // Gloss shine dot
      }
      return [pinkColor[0], pinkColor[1], pinkColor[2], 255];
    }

    // Pure Crisp White Calendar Sheet
    return [255, 255, 255, 255];
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
  const buf = createPNG(cfg.size, cfg.size, (x, y, w, h) => drawCalendarStickerIcon(x, y, w, h, cfg.maskable));
  const outPath = path.join(iconsDir, cfg.file);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${cfg.file} (${cfg.size}x${cfg.size})`);
}
