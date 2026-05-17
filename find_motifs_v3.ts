import { Jimp } from 'jimp';
import fs from 'fs';

async function findMotifs() {
    const image = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
    const { width, height } = image.bitmap;
    
    // Create a copy for processing
    const processed = image.clone().greyscale().contrast(1).normalize();
    
    const motifs = [];
    const visited = new Set();

    // The shirt area roughly - tighter bounds to avoid hair/arms if possible, 
    // but we want sleeves too.
    const xMin = 30;
    const xMax = 310;
    const yMin = 155; // Strictly below the neck to avoid hair/eyebrows
    const yMax = 440; // Above the skirt

    for (let y = yMin; y < yMax; y++) {
        for (let x = xMin; x < xMax; x++) {
            const color = processed.getPixelColor(x, y);
            const r = (color >> 24) & 0xFF; // It's greyscale now
            
            // In greyscale/normalized/contrasted, the dark beads should be very low
            if (r < 80 && !visited.has(`${x},${y}`)) {
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
                            const nColor = processed.getPixelColor(nx, ny);
                            const nr = (nColor >> 24) & 0xFF;
                            if (nr < 80 && !visited.has(`${nx},${ny}`)) {
                                visited.add(`${nx},${ny}`);
                                queue.push([nx, ny]);
                            }
                        }
                    }
                }
                
                // Motifs are small but distinct.
                // 4 pixels is very small, 400 is too big.
                if (blob.length >= 2 && blob.length < 150) {
                    const xmin = Math.min(...blob.map(p => p.x));
                    const xmax = Math.max(...blob.map(p => p.x));
                    const ymin = Math.min(...blob.map(p => p.y));
                    const ymax = Math.max(...blob.map(p => p.y));
                    
                    const w = xmax - xmin + 1;
                    const h = ymax - ymin + 1;
                    const ratio = Math.max(w/h, h/w);
                    
                    // Most motifs are circular or insect-shaped (not too elongated)
                    if (ratio < 2.5) {
                        motifs.push({ xmin, ymin, xmax, ymax });
                    }
                }
            }
        }
    }
    
    // Deduplicate/Merge close motifs
    const finalMotifs = [];
    const used = new Set();
    for (let i = 0; i < motifs.length; i++) {
        if (used.has(i)) continue;
        let m = motifs[i];
        used.add(i);
        
        for (let j = i + 1; j < motifs.length; j++) {
            if (used.has(j)) continue;
            const other = motifs[j];
            // If very close, merge
            const dx = Math.abs((m.xmin + m.xmax)/2 - (other.xmin + other.xmax)/2);
            const dy = Math.abs((m.ymin + m.ymax)/2 - (other.ymin + other.ymax)/2);
            if (dx < 5 && dy < 5) {
                m.xmin = Math.min(m.xmin, other.xmin);
                m.xmax = Math.max(m.xmax, other.xmax);
                m.ymin = Math.min(m.ymin, other.ymin);
                m.ymax = Math.max(m.ymax, other.ymax);
                used.add(j);
            }
        }
        finalMotifs.push(m);
    }

    fs.writeFileSync('motif_coords.json', JSON.stringify(finalMotifs, null, 2));
    console.log(`Found ${finalMotifs.length} motifs.`);
}

findMotifs().catch(console.error);
