/**
 * Script to create a circular favicon from the user's image
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');

async function createCircularFavicon() {
  try {
    // Try to use sharp if available
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.log('Sharp not found. Installing...');
      console.log('Please run: npm install sharp');
      console.log('Then run this script again.');
      return;
    }

    const inputPath = path.join(__dirname, '../public/Pasted image (2).png');
    const outputPath = path.join(__dirname, '../public/favicon-circular.png');
    const appIconPath = path.join(__dirname, '../app/icon.png');

    if (!fs.existsSync(inputPath)) {
      console.error('Input image not found:', inputPath);
      return;
    }

    console.log('Creating circular favicon...');

    // Read the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Get the smaller dimension to create a square
    const size = Math.min(metadata.width, metadata.height);
    
    // Create circular mask
    const svgMask = `
      <svg width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>
    `;

    // Resize to square, center crop, apply circular mask
    const circularImage = await image
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .composite([
        {
          input: Buffer.from(svgMask),
          blend: 'dest-in'
        }
      ])
      .png()
      .toBuffer();

    // Save the circular favicon
    fs.writeFileSync(outputPath, circularImage);
    fs.writeFileSync(appIconPath, circularImage);
    
    console.log('✅ Circular favicon created successfully!');
    console.log('   - public/favicon-circular.png');
    console.log('   - app/icon.png');
    
  } catch (error) {
    console.error('Error creating circular favicon:', error);
  }
}

createCircularFavicon();

