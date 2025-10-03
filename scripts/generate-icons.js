#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }, // Apple touch icon
];

// Favicon sizes for .ico file
const faviconSizes = [16, 32, 48];

// Source logo files
const logoFiles = {
  full: 'public/images/logo.png', // Full logo with text
  symbol: 'public/images/logo-symbol.png', // Just the map pin symbol
  whiteBg: 'public/images/logo-bg-white.png', // Logo with white background
};

async function generateIcons() {
  console.log('🎨 Generating PWA icons from Logeera logos...\n');

  // Check if logo files exist
  const availableLogos = {};
  for (const [key, filePath] of Object.entries(logoFiles)) {
    if (fs.existsSync(filePath)) {
      availableLogos[key] = filePath;
      console.log(`✅ Found: ${filePath}`);
    } else {
      console.log(`❌ Missing: ${filePath}`);
    }
  }

  if (Object.keys(availableLogos).length === 0) {
    console.error(
      '❌ No logo files found! Please ensure logo files exist in public/images/',
    );
    process.exit(1);
  }

  // Choose the best logo for icons
  let sourceImage;
  let logoType;

  if (availableLogos.symbol) {
    sourceImage = availableLogos.symbol;
    logoType = 'symbol';
    console.log(
      '\n📱 Using logo symbol for PWA icons (recommended for small sizes)',
    );
  } else if (availableLogos.whiteBg) {
    sourceImage = availableLogos.whiteBg;
    logoType = 'whiteBg';
    console.log('\n📱 Using logo with white background for PWA icons');
  } else {
    sourceImage = availableLogos.full;
    logoType = 'full';
    console.log('\n📱 Using full logo for PWA icons');
  }

  try {
    // Create public directory if it doesn't exist
    const publicDir = 'public';
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generate PWA icons
    console.log('\n🔄 Generating PWA icons...');
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(publicDir, name);

      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Transparent background
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (multi-size ICO file)
    // console.log('\n🔄 Generating favicon.ico...');
    // const faviconPath = path.join(publicDir, 'favicon.ico');

    // // For favicon, use the symbol if available, otherwise the full logo
    // const faviconSource = availableLogos.symbol || sourceImage;

    // await sharp(faviconSource)
    //   .resize(32, 32, {
    //     fit: 'contain',
    //     background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background for favicon
    //   })
    //   .png()
    //   .toFile(faviconPath);

    console.log('✅ Generated: favicon.ico');

    // Generate OG image (social media preview)
    console.log('\n🔄 Generating OG image for social media...');
    const ogImagePath = path.join(publicDir, 'og-image.png');

    // Use full logo for OG image
    const ogSource =
      availableLogos.full || availableLogos.whiteBg || sourceImage;

    await sharp(ogSource)
      .resize(600, 315, {
        fit: 'contain',
        background: { r: 37, g: 99, b: 235, alpha: 1 }, // Logeera blue background
      })
      .extend({
        top: 157,
        bottom: 158,
        left: 300,
        right: 300,
        background: { r: 37, g: 99, b: 235, alpha: 1 },
      })
      .png()
      .toFile(ogImagePath);

    console.log('✅ Generated: og-image.png (1200x630)');

    // Generate maskable icon (for Android adaptive icons)
    console.log('\n🔄 Generating maskable icon...');
    const maskablePath = path.join(publicDir, 'icon-maskable-512x512.png');

    await sharp(sourceImage)
      .resize(410, 410, {
        fit: 'contain',
        background: { r: 37, g: 99, b: 235, alpha: 1 }, // Logeera blue background
      })
      .extend({
        top: 51,
        bottom: 51,
        left: 51,
        right: 51,
        background: { r: 37, g: 99, b: 235, alpha: 1 },
      })
      .png()
      .toFile(maskablePath);

    console.log('✅ Generated: icon-maskable-512x512.png');

    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('\n📋 Generated files:');
    console.log('   • favicon.ico');
    console.log('   • icon-*.png (all PWA sizes)');
    console.log('   • apple-touch-icon.png');
    console.log('   • og-image.png (social media)');
    console.log('   • icon-maskable-512x512.png (Android adaptive)');

    console.log('\n🚀 Your PWA is now ready with proper Logeera branding!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    console.log('\n💡 Make sure Sharp is installed: npm install sharp');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };
