import fs from 'fs';

function getSVGBBox() {
    const content = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');
    const pathMatches = content.match(/<path d="([^"]+)"/g);
    
    if (!pathMatches) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    pathMatches.forEach(match => {
        const d = match.match(/d="([^"]+)"/)[1];
        const coords = d.match(/-?\d+/g);
        if (coords) {
            for (let i = 0; i < coords.length; i += 2) {
                const x = parseInt(coords[i]);
                const y = parseInt(coords[i+1]);
                if (!isNaN(x) && !isNaN(y)) {
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                }
            }
        }
    });

    console.log(JSON.stringify({ minX, minY, maxX, maxY }));
}

getSVGBBox();
