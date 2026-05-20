import fs from 'fs';

function parseSvgPath(d) {
    const points = [];
    const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);
    let curX = 0, curY = 0;
    
    for (const cmd of commands) {
        const type = cmd[0];
        const argStr = cmd.slice(1).trim().replace(/-/g, ' -');
        const args = argStr.split(/[\s,]+/).filter(s => s !== '').map(Number);
        
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
        }
    }
    return points;
}

const templateSvg = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');
const frontViewPathMatch = templateSvg.match(/id="Front_View"[\s\S]*?<path d="([^"]+)"/);

if (frontViewPathMatch) {
    const poly = parseSvgPath(frontViewPathMatch[1]);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    poly.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    });
    console.log(JSON.stringify({ minX, maxX, minY, maxY, count: poly.length }));
}
