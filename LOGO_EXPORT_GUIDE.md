# KonnectHere Logo Export Guide

## Logo Files Created

### 1. Horizontal Logo (Website Header)
- **File:** `public/logo.svg`
- **Usage:** Website header, navbar, marketing materials
- **Dimensions:** 240×48px (scalable SVG)
- **Format:** SVG (vector, scalable)

### 2. Circular Favicon (Browser Tab)
- **File:** `public/favicon.svg` and `app/icon.svg`
- **Usage:** Browser favicon, app icons
- **Dimensions:** 64×64px (scalable SVG)
- **Format:** SVG (vector, scalable)

## Design Specifications

### Colors
- **Primary (Deep Navy Blue):** `#1e3a5f`
- **Secondary (Charcoal Gray):** `#2d3748`
- **Background:** Pure white `#ffffff`
- **Favicon Background:** Deep navy blue `#1e3a5f` with white symbol

### Typography
- **Font:** Inter (or system sans-serif fallback)
- **Weight:** 600 (Semi-bold)
- **Letter Spacing:** -0.02em (tighter for modern look)

### Symbol Design
- Abstract "K" formed by connected nodes and lines
- Represents networking, connections, and professional relationships
- Flat design with high contrast
- Readable at small sizes (favicon)

## Exporting to PNG (Optional)

If you need PNG versions for specific use cases:

### Using Online Tools
1. Visit: https://cloudconvert.com/svg-to-png
2. Upload `logo.svg` or `favicon.svg`
3. Set resolution:
   - Logo: 480×96px (2x) or 960×192px (3x) for retina
   - Favicon: 64×64px, 128×128px, 256×256px, 512×512px
4. Download PNG files

### Using Command Line (if ImageMagick installed)
```bash
# Convert logo to PNG (2x resolution)
convert -background none -density 300 public/logo.svg -resize 480x96 public/mylogo.png

# Convert favicon to multiple sizes
convert -background none -density 300 public/favicon.svg -resize 64x64 public/favicon-64.png
convert -background none -density 300 public/favicon.svg -resize 128x128 public/favicon-128.png
convert -background none -density 300 public/favicon.svg -resize 256x256 public/favicon-256.png
```

### Using Inkscape (Free Desktop App)
1. Open `logo.svg` or `favicon.svg` in Inkscape
2. File → Export PNG Image
3. Set desired resolution
4. Export

## Usage in Code

### React Component
```tsx
import { Logo } from "@/components/Logo"

// Horizontal logo (default)
<Logo variant="horizontal" />

// Icon only
<Logo variant="icon" width={48} height={48} />
```

### Direct Image
```tsx
import Image from "next/image"

<Image src="/logo.svg" alt="KonnectHere" width={240} height={48} />
```

## Next.js Favicon Setup

The favicon is automatically detected via:
- `app/icon.svg` (Next.js 13+ App Router convention)
- `public/favicon.svg` (fallback)

Next.js will automatically generate favicon.ico and other sizes as needed.

## File Locations

```
public/
  ├── logo.svg          # Horizontal logo
  └── favicon.svg       # Circular favicon

app/
  └── icon.svg          # Next.js favicon (same as favicon.svg)

components/
  └── Logo.tsx          # React logo component
```

## Notes

- SVG files are preferred for web use (scalable, small file size)
- PNG exports are only needed for specific requirements (email signatures, print, etc.)
- The logo is already integrated into the Navbar component
- All logos use flat design with no gradients or shadows
- High contrast ensures readability at all sizes

