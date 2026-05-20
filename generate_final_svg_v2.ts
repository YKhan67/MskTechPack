import fs from 'fs';

const motifCoords = JSON.parse(fs.readFileSync('motif_coords.json', 'utf-8'));
const motifSvg = fs.readFileSync('motif.svg', 'utf-8');
const templateSvg = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');

// Extract path from motif SVG
const pathMatch = motifSvg.match(/<path d="([^"]+)"/);
const motifPath = pathMatch ? pathMatch[1] : '';

// Coordinate mapping parameters
// These are the bounds of the shirt (including sleeves) in the photo
const photoShirtXMin = 40;
const photoShirtXMax = 300;
const photoShirtYMin = 135;
const photoShirtYMax = 455;

// These are the bounds of the Front_View path in its INNER coordinate space (before translate(400, 100) scale(0.25))
// We calculated: minX=-17941, maxX=20120, minY=-2847, maxY=22811 (approx)
const svgInnerXMin = -17941;
const svgInnerXMax = 20120;
const svgInnerYMin = -2847;
const svgInnerYMax = 22811;

const imgWidth = photoShirtXMax - photoShirtXMin;
const imgHeight = photoShirtYMax - photoShirtYMin;
const imgCenterX = (photoShirtXMin + photoShirtXMax) / 2;
const imgCenterY = (photoShirtYMin + photoShirtYMax) / 2;

const svgWidth = svgInnerXMax - svgInnerXMin;
const svgHeight = svgInnerYMax - svgInnerYMin;
const svgCenterX = (svgInnerXMin + svgInnerXMax) / 2;
const svgCenterY = (svgInnerYMin + svgInnerYMax) / 2;

const scaleX = svgWidth / imgWidth;
const scaleY = svgHeight / imgHeight;

// Function to map image coords to SVG inner coords
function mapCoords(xImg, yImg) {
    // Relative position in photo shirt box (0 to 1)
    const relX = (xImg - photoShirtXMin) / imgWidth;
    const relY = (yImg - photoShirtYMin) / imgHeight;
    
    // Map to SVG inner space
    const xInner = svgInnerXMin + relX * svgWidth;
    // Y is flipped in SVG inner space: svgInnerYMax is the TOP of the shirt
    const yInner = svgInnerYMax - relY * svgHeight;
    
    return { x: xInner, y: yInner };
}

// Simple Point-in-Polygon implementation
function isPointInPoly(poly, pt) {
    for (var c = false, i = -1, l = poly.length, j = poly.length - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

// Extract Front_View path points for boundary check
const frontViewPathMatch = templateSvg.match(/id="Front_View"[\s\S]*?<path d="([^"]+)"/);
const poly = [];
if (frontViewPathMatch) {
    const d = frontViewPathMatch[1];
    const coords = d.match(/[-0-9.]+/g).map(Number);
    for (let i = 0; i < coords.length; i += 2) {
        if (!isNaN(coords[i]) && !isNaN(coords[i+1])) {
            poly.push({ x: coords[i], y: coords[i+1] });
        }
    }
}

// Prepare motif instances
let motifsGroup = '<g id="Motifs" fill="#000000" stroke="none">';
let addedCount = 0;

motifCoords.forEach((coord, index) => {
    const centerX = (coord.xmin + coord.xmax) / 2;
    const centerY = (coord.ymin + coord.ymax) / 2;
    
    const mapped = mapCoords(centerX, centerY);
    
    // Boundary check: must be inside the Front_View path
    if (poly.length > 0 && !isPointInPoly(poly, mapped)) {
        return;
    }

    // Scaling
    const targetWidth = (coord.xmax - coord.xmin + 1) * scaleX;
    const motifScale = targetWidth / 56;
    
    motifsGroup += `<path d="${motifPath}" transform="translate(${mapped.x}, ${mapped.y}) scale(${motifScale})" />\n`;
    addedCount++;
});
motifsGroup += '</g>';

// Inject motifs into template inside Front_View
const frontViewMarker = 'id="Front_View"';
const innerGroupMarker = 'scale(0.100000,-0.100000)"';

const frontViewIndex = templateSvg.indexOf(frontViewMarker);
const innerGroupIndex = templateSvg.indexOf(innerGroupMarker, frontViewIndex);
const insertIndex = templateSvg.indexOf('>', innerGroupIndex) + 1;

const finalSvg = templateSvg.slice(0, insertIndex) + '\n' + motifsGroup + templateSvg.slice(insertIndex);

fs.writeFileSync('final_tech_pack.svg', finalSvg);
console.log(`Final SVG generated: final_tech_pack.svg. Added ${addedCount} motifs. Poly points: ${poly.length}`);
