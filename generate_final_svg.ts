import fs from 'fs';

const motifCoords = JSON.parse(fs.readFileSync('motif_coords.json', 'utf-8'));
const motifSvg = fs.readFileSync('motif.svg', 'utf-8');
const templateSvg = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');

// Extract path from motif SVG
const pathMatch = motifSvg.match(/<path d="([^"]+)"/);
const motifPath = pathMatch ? pathMatch[1] : '';

// Coordinate mapping parameters (refined for shirt-to-shirt mapping)
const photoShirtXMin = 80;
const photoShirtXMax = 280;
const photoShirtYMin = 130;
const photoShirtYMax = 455;

const svgShirtXMin = -17941;
const svgShirtXMax = 23253;
const svgShirtYMin = -2847;
const svgShirtYMax = 22811;

const imgWidth = photoShirtXMax - photoShirtXMin;
const imgHeight = photoShirtYMax - photoShirtYMin;
const imgCenterX = (photoShirtXMin + photoShirtXMax) / 2;
const imgCenterY = (photoShirtYMin + photoShirtYMax) / 2;

const svgInnerWidth = svgShirtXMax - svgShirtXMin;
const svgInnerHeight = svgShirtYMax - svgShirtYMin;
const svgInnerCenterX = (svgShirtXMin + svgShirtXMax) / 2;
const svgInnerCenterY = (svgShirtYMin + svgShirtYMax) / 2;

const scaleX = svgInnerWidth / imgWidth;
const scaleY = svgInnerHeight / imgHeight;

// Function to map image coords to SVG inner coords
function mapCoords(xImg, yImg) {
    const xInner = (xImg - imgCenterX) * scaleX + svgInnerCenterX;
    // Y is flipped in SVG inner space due to scale(0.1, -0.1)
    const yInner = (yImg - imgCenterY) * -scaleY + svgInnerCenterY;
    return { x: xInner, y: yInner };
}

// Prepare motif instances
let motifsGroup = '<g id="Motifs" fill="#000000" stroke="none">';
motifCoords.forEach((coord, index) => {
    const centerX = (coord.xmin + coord.xmax) / 2;
    const centerY = (coord.ymin + coord.ymax) / 2;
    
    // Filter out coordinates outside the shirt area (e.g. head, hair)
    if (centerY < photoShirtYMin || centerX < photoShirtXMin || centerX > photoShirtXMax) {
        return;
    }

    const mapped = mapCoords(centerX, centerY);
    
    // Scale motif to match image size (approx 15px width)
    // 15px * scaleX is the target width in inner units
    const targetWidth = (coord.xmax - coord.xmin + 1) * scaleX * 2; // Extra scale for visibility
    const motifScale = targetWidth / 56;
    
    motifsGroup += `<path d="${motifPath}" transform="translate(${mapped.x}, ${mapped.y}) scale(${motifScale})" />\n`;
});
motifsGroup += '</g>';

// Inject motifs into template inside Front_View
// Find the first <g transform="... scale(0.100000,-0.100000)"> inside Front_View
const frontViewMarker = 'id="Front_View"';
const innerGroupMarker = 'scale(0.100000,-0.100000)"';

const frontViewIndex = templateSvg.indexOf(frontViewMarker);
const innerGroupIndex = templateSvg.indexOf(innerGroupMarker, frontViewIndex);
const insertIndex = templateSvg.indexOf('>', innerGroupIndex) + 1;

const finalSvg = templateSvg.slice(0, insertIndex) + '\n' + motifsGroup + templateSvg.slice(insertIndex);

fs.writeFileSync('final_tech_pack.svg', finalSvg);
console.log('Final SVG generated: final_tech_pack.svg');
