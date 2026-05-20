
import fs from 'fs';

const templatePath = '/home/team/shared/MskTechPack/shirt_template.svg';
const motifPath = '/home/agent-engineer/maryam-tech-pack/motif.svg';
const outputPath = '/home/team/shared/final_tech_pack.svg';

function parseSvgPath(d, transform) {
    const commands = d.match(/[a-df-z][^a-df-z]*/ig);
    let curX = 0, curY = 0;
    const points = [];
    if (!commands) return [];
    for (const cmd of commands) {
        const type = cmd[0];
        const args = cmd.slice(1).trim().split(/[\s,]+/).map(parseFloat);
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

async function finalize() {
    const templateSvg = fs.readFileSync(templatePath, 'utf-8');
    const motifSvg = fs.readFileSync(motifPath, 'utf-8');
    
    // Extract motif path
    const motifPathMatch = motifSvg.match(/<path d="([^"]+)"/);
    if (!motifPathMatch) throw new Error("Motif path not found");
    const beePath = motifPathMatch[1];

    // Identify layers and clean them
    let cleanSvg = templateSvg;
    
    // Remove all paths that are likely noise (length < 1000)
    // We do this carefully within the groups
    const groups = ['Front_View', 'Back_View', 'Side_View'];
    for (const group of groups) {
        const groupRegex = new RegExp(`<g id="${group}"[\\s\\S]*?<\\/g>`, 'g');
        cleanSvg = cleanSvg.replace(groupRegex, (match) => {
            // Keep large paths (garment outlines) and very small paths (buttons, stitches)
            // Skip middle-sized paths that are likely noise artifacts (the "black spots")
            return match.replace(/<path d="([^"]+)"[^>]*\/>/g, (pathMatch, d) => {
                if (d.length > 5000 || d.length < 400) return pathMatch; 
                return ''; 
            });
        });
    }

    // Now inject verified bees into Front_View
    const frontViewMatch = templateSvg.match(/id="Front_View"[\s\S]*?<path d="([^"]+)"/);
    if (!frontViewMatch) throw new Error("Front_View outline not found");
    
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

    let motifsSvg = '<g id="Verified_Motifs" fill="#000000" stroke="none">\n';
    filteredBees.forEach(b => {
        motifsSvg += `<path d="${beePath}" transform="translate(${b.x - 10}, ${b.y - 10}) scale(0.4)" />\n`;
    });
    motifsSvg += '</g>\n';

    // Inject motifs at the end of the SVG, but before the closing tag
    const finalizedSvg = cleanSvg.replace('</svg>', motifsSvg + '</svg>');
    
    fs.writeFileSync(outputPath, finalizedSvg);
    console.log(`Finalized SVG written to ${outputPath}`);
}

finalize().catch(console.error);
