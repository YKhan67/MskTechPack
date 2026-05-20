import fs from 'fs';

function parseSvgPath(d) {
    const points = [];
    const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);
    if (!commands) return [];
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

const svg = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');

// Find start of Front_View
const frontViewStart = svg.indexOf('id="Front_View"');
if (frontViewStart === -1) {
    console.error("Front_View not found");
    process.exit(1);
}

// Find the end of the group (very crude, assumes balanced tags)
let openGroups = 1;
let pos = svg.indexOf('<g', frontViewStart) + 1;
let endPos = -1;
let currentPos = frontViewStart;

// Better approach: extract the whole section between Front_View and Back_View
const backViewStart = svg.indexOf('id="Back_View"');
const frontViewSection = svg.slice(frontViewStart, backViewStart);

const paths = frontViewSection.match(/<path d="([^"]+)"/g);
if (paths) {
    console.log(`Found ${paths.length} paths in Front_View section`);
    paths.forEach((p, i) => {
        const d = p.match(/d="([^"]+)"/)[1];
        const poly = parseSvgPath(d);
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        poly.forEach(pt => {
            minX = Math.min(minX, pt.x);
            maxX = Math.max(maxX, pt.x);
            minY = Math.min(minY, pt.y);
            maxY = Math.max(maxY, pt.y);
        });
        console.log(`Path ${i}: bounds [${minX}, ${maxX}, ${minY}, ${maxY}], points: ${poly.length}`);
    });
}
