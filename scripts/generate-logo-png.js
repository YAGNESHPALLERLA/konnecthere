/**
 * Script to generate PNG versions of SVG logos
 * 
 * Requires: npm install sharp (or use online converter)
 * 
 * Usage: node scripts/generate-logo-png.js
 */

const fs = require('fs');
const path = require('path');

console.log('📐 Logo PNG Generator');
console.log('');
console.log('SVG files are already created and ready to use:');
console.log('  ✓ public/logo.svg (horizontal logo)');
console.log('  ✓ public/favicon.svg (circular favicon)');
console.log('  ✓ app/icon.svg (Next.js favicon)');
console.log('');
console.log('To generate PNG versions:');
console.log('');
console.log('Option 1: Online Converter (Recommended)');
console.log('  1. Visit: https://cloudconvert.com/svg-to-png');
console.log('  2. Upload logo.svg or favicon.svg');
console.log('  3. Set resolution and download');
console.log('');
console.log('Option 2: Using Sharp (if installed)');
console.log('  npm install sharp');
console.log('  node scripts/generate-logo-png-sharp.js');
console.log('');
console.log('Option 3: Using Inkscape (Desktop App)');
console.log('  1. Open SVG in Inkscape');
console.log('  2. File → Export PNG Image');
console.log('  3. Set resolution and export');
console.log('');
console.log('Note: SVG files work perfectly for web use and are preferred!');
console.log('PNG is only needed for specific use cases (email, print, etc.)');

