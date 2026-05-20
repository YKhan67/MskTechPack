import fs from 'fs';

function parseSvgPath(d) {
    const points = [];
    const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);
    let curX = 0, curY = 0;
    
    for (const cmd of commands) {
        const type = cmd[0];
        const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
        
        switch (type) {
            case 'M':
                curX = args[0];
                curY = args[1];
                points.push({ x: curX, y: curY });
                break;
            case 'm':
                curX += args[0];
                curY += args[1];
                points.push({ x: curX, y: curY });
                break;
            case 'L':
                curX = args[0];
                curY = args[1];
                points.push({ x: curX, y: curY });
                break;
            case 'l':
                curX += args[0];
                curY += args[1];
                points.push({ x: curX, y: curY });
                break;
            case 'C':
                for (let i = 0; i < args.length; i += 6) {
                    curX = args[i+4];
                    curY = args[i+5];
                    points.push({ x: curX, y: curY });
                }
                break;
            case 'c':
                for (let i = 0; i < args.length; i += 6) {
                    curX += args[i+4];
                    curY += args[i+5];
                    points.push({ x: curX, y: curY });
                }
                break;
            case 'z':
            case 'Z':
                // Close path
                break;
        }
    }
    return points;
}

const motifCoords = JSON.parse(fs.readFileSync('motif_coords.json', 'utf-8'));
const motifSvg = fs.readFileSync('motif.svg', 'utf-8');
const templateSvg = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');

const pathMatch = motifSvg.match(/<path d="([^"]+)"/);
const motifPath = pathMatch ? pathMatch[1] : '';

const photoShirtXMin = 80;
const photoShirtXMax = 260;
const photoShirtYMin = 145;
const photoShirtYMax = 455;

const svgInnerXMin = -17941;
const svgInnerXMax = 20120;
const svgInnerYMin = -2847;
const svgInnerYMax = 22811;

const imgWidth = photoShirtXMax - photoShirtXMin;
const imgHeight = photoShirtYMax - photoShirtYMin;
const svgWidth = svgInnerXMax - svgInnerXMin;
const svgHeight = svgInnerYMax - svgInnerYMin;

function mapCoords(xImg, yImg) {
    const relX = (xImg - photoShirtXMin) / imgWidth;
    const relY = (yImg - photoShirtYMin) / imgHeight;
    const xInner = svgInnerXMin + relX * svgWidth;
    const yInner = svgInnerYMax - relY * svgHeight;
    return { x: xInner, y: yInner };
}

function isPointInPoly(poly, pt) {
    for (var c = false, i = -1, l = poly.length, j = poly.length - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

const frontViewPathMatch = templateSvg.match(/id="Front_View"[\s\S]*?<path d="([^"]+)"/);
let poly = [];
if (frontViewPathMatch) {
    poly = parseSvgPath(frontViewPathMatch[1]);
}

let motifsGroup = '<g id="Motifs" fill="#000000" stroke="none">';
let addedCount = 0;

motifCoords.forEach((coord, index) => {
    const centerX = (coord.xmin + coord.xmax) / 2;
    const centerY = (coord.ymin + coord.ymax) / 2;
    const mapped = mapCoords(centerX, centerY);
    
    if (poly.length > 0 && !isPointInPoly(poly, mapped)) {
        return;
    }

    const targetWidth = (coord.xmax - coord.xmin + 1) * (svgWidth / (photoShirtXMax - photoShirtXMin));
    const motifScale = targetWidth / 56;
    
    motifsGroup += `<path d="${motifPath}" transform="translate(${mapped.x}, ${mapped.y}) scale(${motifScale})" />\n`;
    addedCount++;
});
motifsGroup += '</g>';

const frontViewMarker = 'id="Front_View"';
const innerGroupMarker = 'scale(0.100000,-0.100000)"';
const frontViewIndex = templateSvg.indexOf(frontViewMarker);
const innerGroupIndex = templateSvg.indexOf(innerGroupMarker, frontViewIndex);
const insertIndex = templateSvg.indexOf('>', innerGroupIndex) + 1;

const finalSvg = templateSvg.slice(0, insertIndex) + '\n' + motifsGroup + templateSvg.slice(insertIndex);

fs.writeFileSync('final_tech_pack.svg', finalSvg);
console.log(`Final SVG generated: final_tech_pack.svg. Added ${addedCount} motifs. Poly points: ${poly.length}`);
