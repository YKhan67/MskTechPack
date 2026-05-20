import fs from 'fs';

const svg = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');

const frontViewMatch = svg.match(/<g id="Front_View"[\s\S]*?<\/g>\s*<\/g>/);
if (!frontViewMatch) {
    console.log("Front_View not found");
    process.exit(1);
}

const frontView = frontViewMatch[0];
const pathRegex = /<path d="([^"]+)"/g;
let match;
const paths = [];

while ((match = pathRegex.exec(frontView)) !== null) {
    const d = match[1];
    if (d.length < 10000) {
        // Extract first point to check alignment
        const firstPoint = d.match(/M\s*(-?\d+)\s+(-?\d+)/);
        if (firstPoint) {
            paths.push({
                x: parseInt(firstPoint[1]),
                y: parseInt(firstPoint[2]),
                len: d.length,
                d: d.replace(/\s+/g, ' ').substring(0, 100)
            });
        }
    }
}

paths.sort((a, b) => b.y - a.y); // Sort by Y descending (top to bottom in flipped coordinate)
paths.forEach(p => console.log(`X: ${p.x}, Y: ${p.y}, Len: ${p.len}, D: ${p.d}...`));
