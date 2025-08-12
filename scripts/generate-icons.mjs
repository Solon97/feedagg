#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

let createCanvas;
try {
  const canvasModule = await import("canvas");
  createCanvas = canvasModule.createCanvas;
} catch (error) {
  console.log("⚠️  Skipping icon generation (canvas dependency not available)");
  console.log("   Please install: pnpm install canvas");
  console.log("   Or manually add icon files to public/icons/");
  process.exit(0);
}

const sizes = [192, 256, 384, 512];
const maskableSizes = [192, 512];

// Simple icon generator - creates solid color circles with "FA" text
function generateIcon(size, isMaskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  const bgColor = isMaskable ? "#0EA5E9" : "#0B0F14";
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Circle for maskable icons (safe area)
  if (isMaskable) {
    const radius = size * 0.4; // 80% diameter, 40% radius
    const centerX = size / 2;
    const centerY = size / 2;

    ctx.fillStyle = "#0B0F14";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Text "FA"
  const fontSize = size * 0.35;
  ctx.fillStyle = "#0EA5E9";
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("FA", size / 2, size / 2);

  return canvas.toBuffer("image/png");
}

async function generateIcons() {
  const iconsDir = path.join(process.cwd(), "public", "icons");

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate regular icons
  for (const size of sizes) {
    const iconBuffer = generateIcon(size);
    const iconPath = path.join(iconsDir, `icon-${size}.png`);
    fs.writeFileSync(iconPath, iconBuffer);
    console.log(`Generated ${iconPath}`);
  }

  // Generate maskable icons
  for (const size of maskableSizes) {
    const maskableBuffer = generateIcon(size, true);
    const maskablePath = path.join(iconsDir, `maskable-${size}.png`);
    fs.writeFileSync(maskablePath, maskableBuffer);
    console.log(`Generated ${maskablePath}`);
  }

  // Create apple-touch-icon (copy from 192px)
  const appleIconBuffer = generateIcon(180);
  const appleIconPath = path.join(
    process.cwd(),
    "public",
    "apple-touch-icon.png"
  );
  fs.writeFileSync(appleIconPath, appleIconBuffer);
  console.log(`Generated ${appleIconPath}`);
}

// Only generate if canvas is available, otherwise skip silently
try {
  await generateIcons();
  console.log("✅ PWA icons generated successfully");
} catch (error) {
  if (error.message.includes("canvas")) {
    console.log(
      "⚠️  Skipping icon generation (canvas dependency not available)"
    );
    console.log("   Please install: npm install canvas");
    console.log("   Or manually add icon files to public/icons/");
  } else {
    console.error("Error generating icons:", error);
  }
}
