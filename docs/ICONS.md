# PWA Icons Generation

This document explains how to generate PWA icons for the Logeera application.

## Overview

The Logeera PWA uses various icon sizes for different platforms and purposes:

- **Favicon**: `favicon.ico` (32x32)
- **PWA Icons**: Multiple sizes from 16x16 to 512x512
- **Apple Touch Icon**: `apple-touch-icon.png` (180x180)
- **Maskable Icon**: `icon-maskable-512x512.png` (512x512 with safe zone)
- **Open Graph Image**: `og-image.png` (1200x630 for social media)

## Source Images

The script uses the following logo files (in order of preference):

1. `public/images/logo-symbol.png` - **Recommended** for icons (clean symbol)
2. `public/images/logo-bg-white.png` - Logo with white background
3. `public/images/logo.png` - Full logo with text

## Generated Icons

### Standard PWA Icons
- `icon-16x16.png` - Browser tab icon
- `icon-32x32.png` - Browser tab icon
- `icon-72x72.png` - Android home screen
- `icon-96x96.png` - Android home screen
- `icon-128x128.png` - Android home screen
- `icon-144x144.png` - Android home screen
- `icon-152x152.png` - iOS home screen
- `icon-192x192.png` - Android splash screen
- `icon-384x384.png` - Android splash screen
- `icon-512x512.png` - Android splash screen

### Special Icons
- `favicon.ico` - Browser favicon
- `apple-touch-icon.png` - iOS home screen icon
- `icon-maskable-512x512.png` - Android adaptive icon with safe zone
- `og-image.png` - Social media preview (1200x630)

## Regenerating Icons

### Automatic Generation

To regenerate all icons from the source logos:

```bash
npm run icons:generate
```

Or directly:

```bash
node scripts/generate-icons.js
```

### Manual Generation

If you need to update the source images:

1. Replace the logo files in `public/images/`:
   - `logo-symbol.png` (recommended for icons)
   - `logo-bg-white.png` (alternative)
   - `logo.png` (fallback)

2. Run the generation script:
   ```bash
   npm run icons:generate
   ```

### Build with Icons

To build the PWA with fresh icons:

```bash
npm run pwa:build
```

This will regenerate icons and then build the application.

## Icon Requirements

### Logo Symbol (`logo-symbol.png`)
- **Recommended size**: 512x512 or higher
- **Format**: PNG with transparent background
- **Content**: Clean symbol/logo without text
- **Usage**: Best for small icon sizes

### Logo with White Background (`logo-bg-white.png`)
- **Recommended size**: 512x512 or higher
- **Format**: PNG with white background
- **Content**: Logo with sufficient padding
- **Usage**: Alternative when symbol isn't available

### Full Logo (`logo.png`)
- **Recommended size**: 512x512 or higher
- **Format**: PNG (any background)
- **Content**: Full logo with text
- **Usage**: Fallback option, used for OG image

## Technical Details

### Icon Processing
- **Library**: Sharp (high-performance image processing)
- **Resize method**: `fit: 'contain'` (maintains aspect ratio)
- **Background**: Transparent for regular icons, blue for maskable
- **Format**: PNG for all icons

### Maskable Icons
- **Purpose**: Android adaptive icons with safe zone
- **Safe zone**: 51px padding on all sides (512x512 canvas)
- **Background**: Logeera blue (#2563eb)
- **Content**: Centered logo at 410x410

### Open Graph Image
- **Size**: 1200x630 (Facebook/Twitter standard)
- **Background**: Logeera blue (#2563eb)
- **Content**: Full logo centered
- **Usage**: Social media link previews

## Troubleshooting

### Sharp Installation Issues
If you encounter Sharp installation errors:

```bash
npm install sharp --force
# or
pnpm add sharp --force
```

### Missing Source Images
If logo files are missing, the script will:
1. List available logos
2. Use the best available option
3. Exit with error if no logos found

### Icon Quality Issues
For best results:
- Use high-resolution source images (1024x1024 or higher)
- Ensure logos have good contrast
- Test icons at small sizes (16x16, 32x32)
- Verify maskable icons have content within safe zone

## Manifest Configuration

The generated icons are automatically configured in `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## Testing

### PWA Icon Testing
1. Install the PWA on Android/iOS
2. Check home screen icon quality
3. Verify adaptive icon behavior (Android)
4. Test different device sizes

### Social Media Testing
1. Share a link to your site
2. Verify OG image appears correctly
3. Test on Facebook, Twitter, LinkedIn
4. Check image dimensions and quality

---

**Note**: Always regenerate icons after updating logo files to ensure consistency across all platforms.
