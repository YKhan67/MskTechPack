import fs from 'fs';

function parseSvgPath(d, transform) {
    const points = [];
    const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);
    if (!commands) return [];
    let curX = 0, curY = 0;
    
    for (const cmd of commands) {
        const type = cmd[0];
        const argStr = cmd.slice(1).trim().replace(/-/g, ' -');
        const args = argStr.split(/[\s,]+/).filter(s => s !== '').map(Number);
        
        let x = 0, y = 0;
        switch (type) {
            case 'M':
                curX = args[0];
                curY = args[1];
                points.push(transform(curX, curY));
                break;
            case 'm':
                curX += args[0];
                curY += args[1];
                points.push(transform(curX, curY));
                break;
            case 'L':
                curX = args[0];
                curY = args[1];
                points.push(transform(curX, curY));
                break;
            case 'l':
                curX += args[0];
                curY += args[1];
                points.push(transform(curX, curY));
                break;
            case 'C':
                for (let i = 0; i < args.length; i += 6) {
                    curX = args[i+4];
                    curY = args[i+5];
                    points.push(transform(curX, curY));
                }
                break;
            case 'c':
                for (let i = 0; i < args.length; i += 6) {
                    curX += args[i+4];
                    curY += args[i+5];
                    points.push(transform(curX, curY));
                }
                break;
        }
    }
    return points;
}

function isPointInPoly(point, vs) {
    const x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i].x, yi = vs[i].y;
        const xj = vs[j].x, yj = vs[j].y;
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

const templateSvg = fs.readFileSync('/home/team/shared/MskTechPack/shirt_template.svg', 'utf-8');
const frontViewMatch = templateSvg.match(/id="Front_View"[\s\S]*?<path d="([^"]+)"/);
if (!frontViewMatch) {
    console.error("Front_View path not found");
    process.exit(1);
}

const transform = (px, py) => ({
    x: 400 + 0.025 * px,
    y: 700 - 0.025 * py
});

const poly = parseSvgPath(frontViewMatch[1], transform);

const photoBees = [
    { x: 158, y: 205 }, { x: 152, y: 285 }, { x: 148, y: 365 },
    { x: 175, y: 235 }, { x: 170, y: 315 }, { x: 165, y: 395 },
    { x: 205, y: 215 }, { x: 215, y: 295 }, { x: 225, y: 375 },
    { x: 168, y: 175 }, { x: 208, y: 185 }
];

const photoShirtXMin = 80, photoShirtXMax = 260;
const photoShirtYMin = 140, photoShirtYMax = 460;
const svgXMin = 447.55, svgXMax = 1068.325;
const svgYMin = 129.725, svgYMax = 673;

const mappedBees = photoBees.map(b => {
    const relX = (b.x - photoShirtXMin) / (photoShirtXMax - photoShirtXMin);
    const relY = (b.y - photoShirtYMin) / (photoShirtYMax - photoShirtYMin);
    return {
        x: svgXMin + relX * (svgXMax - svgXMin),
        y: svgYMin + relY * (svgYMax - svgYMin)
    };
});

const filteredBees = mappedBees.filter(b => isPointInPoly(b, poly));
console.log(`Placed ${filteredBees.length} out of ${photoBees.length} bees.`);

const beePath = "M 43 25.034 C 41.702 25.903, 41.762 26.238, 43.446 27.523 C 45.665 29.215, 47.610 28.033, 46.664 25.567 C 45.969 23.756, 45.099 23.630, 43 25.034 M 20.507 27.977 C 19.778 30.274, 20.691 32.309, 22.069 31.457 C 23.273 30.713, 23.275 27.288, 22.072 26.544 C 21.562 26.229, 20.858 26.873, 20.507 27.977 M 36 29.802 C 36 30.371, 35.729 31.542, 35.398 32.404 C 34.986 33.478, 35.625 34.287, 37.424 34.971 C 38.869 35.520, 40.313 36.653, 40.633 37.487 C 41.594 39.990, 40.133 43.823, 37.956 44.514 C 36.410 45.005, 36.078 45.686, 36.582 47.331 C 36.949 48.524, 37.430 49.700, 37.652 49.944 C 37.874 50.189, 38.977 49.467, 40.103 48.341 C 41.229 47.215, 42.401 44.428, 42.707 42.147 C 43.158 38.788, 43.917 37.597, 46.705 35.873 C 50.688 33.411, 50.086 32.164, 44.330 30.958 C 42.224 30.516, 39.487 29.843, 38.250 29.461 C 36.919 29.050, 36 29.189, 36 29.802";

let motifsSvg = '<g id="Motifs" fill="#000000" stroke="none">\n';
filteredBees.forEach(b => {
    motifsSvg += `<path d="${beePath}" transform="translate(${b.x - 10}, ${b.y - 10}) scale(0.4)" />\n`;
});
motifsSvg += '</g>\n';

const finalSvg = templateSvg.replace('</svg>', motifsSvg + '</svg>');
fs.writeFileSync('/home/agent-engineer/maryam-tech-pack/final_tech_pack.svg', finalSvg);
console.log("Final SVG generated: final_tech_pack.svg");
