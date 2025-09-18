# PWA Icon Generation Instructions

To generate PWA icons from your Logeera logo files, follow these steps:

## Required Icon Sizes:

- favicon.ico (16x16, 32x32, 48x48)
- icon-16x16.png
- icon-32x32.png
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- apple-touch-icon.png (180x180)
- og-image.png (1200x630)

## Using Online Tools:

1. Go to https://realfavicongenerator.net/
2. Upload your logo.png file
3. Configure settings for different platforms
4. Download the generated files
5. Replace the placeholder files in the public/ directory

## Using ImageMagick (if installed):

```bash
# Convert logo to different sizes
convert logo.png -resize 16x16 public/icon-16x16.png
convert logo.png -resize 32x32 public/icon-32x32.png
convert logo.png -resize 72x72 public/icon-72x72.png
convert logo.png -resize 96x96 public/icon-96x96.png
convert logo.png -resize 128x128 public/icon-128x128.png
convert logo.png -resize 144x144 public/icon-144x144.png
convert logo.png -resize 152x152 public/icon-152x152.png
convert logo.png -resize 192x192 public/icon-192x192.png
convert logo.png -resize 384x384 public/icon-384x384.png
convert logo.png -resize 512x512 public/icon-512x512.png
convert logo.png -resize 180x180 public/apple-touch-icon.png

# Create OG image (social media preview)
convert logo.png -resize 600x315 -background white -gravity center -extent 1200x630 public/og-image.png
```

## Current Logo Files:

Based on your message, you have:

- logo.png
- logo-symbol.png
- logo-bg-white.png

Use the logo-bg-white.png for better visibility on various backgrounds.
