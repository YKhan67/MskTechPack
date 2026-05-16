import fs from 'fs';

function getFrontViewBBox() {
    const content = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');
    const frontViewStart = content.indexOf('id="Front_View"');
    const backViewStart = content.indexOf('id="Back_View"');
    const frontViewContent = content.slice(frontViewStart, backViewStart);

    const pathMatches = frontViewContent.match(/<path d="([^"]+)"/g);
    if (!pathMatches) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    pathMatches.forEach(match => {
        const d = match.match(/d="([^"]+)"/)[1];
        const cmds = d.match(/[a-zA-Z]|[-+]?\d+/g);
        if (!cmds) return;

        for (let i = 0; i < cmds.length; i++) {
            const val = parseInt(cmds[i]);
            if (!isNaN(val)) {
                // Alternating X, Y
                // This is a rough heuristic as paths can have different numbers of params
                // But for simple paths it works.
                // Let's just collect all numbers and assume odd are X, even are Y
            }
        }
        
        const coords = d.match(/[-+]?\d+/g);
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

getFrontViewBBox();
