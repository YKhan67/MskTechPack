import fs from 'fs';

const svg = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');

// Front View transform: translate(400, 100) scale(0.25)
// Inner transform: translate(0.000000,2400.000000) scale(0.100000,-0.100000)

function getFinalCoords(xPath, yPath) {
    // Inner transform
    const x1 = xPath * 0.1;
    const y1 = 2400 - yPath * 0.1;
    
    // Outer transform
    const xFinal = 400 + 0.25 * x1;
    const yFinal = 100 + 0.25 * y1;
    
    return { x: xFinal, y: yFinal };
}

const pathMatch = svg.match(/id="Front_View"[\s\S]*?<path d="([^"]+)"/);
if (pathMatch) {
    const d = pathMatch[1];
    const coords = d.match(/[-0-9.]+/g).map(Number);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    for (let i = 0; i < coords.length; i += 2) {
        if (isNaN(coords[i]) || isNaN(coords[i+1])) continue;
        const { x, y } = getFinalCoords(coords[i], coords[i+1]);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    
    console.log(JSON.stringify({ minX, maxX, minY, maxY }));
}
