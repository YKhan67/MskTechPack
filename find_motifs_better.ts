import { Jimp } from 'jimp';
import fs from 'fs';

async function findMotifs() {
    const image = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
    const { width, height } = image.bitmap;
    
    const motifs = [];
    const visited = new Set();

    // The shirt area roughly
    const xMin = 40;
    const xMax = 300;
    const yMin = 135; // Below the neck
    const yMax = 450;

    for (let y = yMin; y < yMax; y++) {
        for (let x = xMin; x < xMax; x++) {
            const color = image.getPixelColor(x, y);
            const { r, g, b } = Jimp.intToRGBA(color);
            
            // Beads are dark. Use a more aggressive threshold for dark spots.
            // Also beads tend to have a specific color profile.
            if (r < 115 && g < 115 && b < 115 && !visited.has(`${x},${y}`)) {
                // Flood fill
                const blob = [];
                const queue = [[x, y]];
                visited.add(`${x},${y}`);
                
                while (queue.length > 0) {
                    const [cx, cy] = queue.shift();
                    blob.push({x: cx, y: cy});
                    
                    const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
                    for (const [nx, ny] of neighbors) {
                        if (nx >= xMin && nx < xMax && ny >= yMin && ny < yMax) {
                            const nColor = image.getPixelColor(nx, ny);
                            const { r: nr, g: ng, b: nb } = Jimp.intToRGBA(nColor);
                            if (nr < 115 && ng < 115 && nb < 115 && !visited.has(`${nx},${ny}`)) {
                                visited.add(`${nx},${ny}`);
                                queue.push([nx, ny]);
                            }
                        }
                    }
                }
                
                // Motifs are small but distinct.
                if (blob.length >= 4 && blob.length < 400) {
                    const xmin = Math.min(...blob.map(p => p.x));
                    const xmax = Math.max(...blob.map(p => p.x));
                    const ymin = Math.min(...blob.map(p => p.y));
                    const ymax = Math.max(...blob.map(p => p.y));
                    
                    // Filter out long thin lines (likely shadows or folds)
                    const w = xmax - xmin + 1;
                    const h = ymax - ymin + 1;
                    const ratio = Math.max(w/h, h/w);
                    
                    if (ratio < 3.0) {
                        motifs.push({ xmin, ymin, xmax, ymax });
                    }
                }
            }
        }
    }
    
    fs.writeFileSync('motif_coords.json', JSON.stringify(motifs, null, 2));
    console.log(`Found ${motifs.length} motifs.`);
}

findMotifs().catch(console.error);
