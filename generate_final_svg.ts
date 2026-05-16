import fs from 'fs';

const motifCoords = JSON.parse(fs.readFileSync('motif_coords.json', 'utf-8'));
const motifSvg = fs.readFileSync('motif.svg', 'utf-8');
const templateSvg = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');

// Extract path from motif SVG
const pathMatch = motifSvg.match(/<path d="([^"]+)"/);
const motifPath = pathMatch ? pathMatch[1] : '';

// Coordinate mapping parameters (calculated from bbox analysis)
const imgWidth = 328;
const imgHeight = 461;
const imgCenterX = 164;
const imgCenterY = 230.5;

const svgInnerMinX = -23050;
const svgInnerMaxX = 28872;
const svgInnerMinY = -9523;
const svgInnerMaxY = 24137;

const svgInnerWidth = svgInnerMaxX - svgInnerMinX;
const svgInnerHeight = svgInnerMaxY - svgInnerMinY;
const svgInnerCenterX = (svgInnerMinX + svgInnerMaxX) / 2;
const svgInnerCenterY = (svgInnerMinY + svgInnerMaxY) / 2;

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
