import { Jimp } from 'jimp';
import fs from 'fs';

async function findShirtAndBees() {
    const image = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
    const { width, height } = image.bitmap;

    // 1. Find shirt area (cream color)
    let shirtMinX = width, shirtMaxX = 0, shirtMinY = height, shirtMaxY = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = image.getPixelColor(x, y);
            const r = (color >> 24) & 0xFF;
            const g = (color >> 16) & 0xFF;
            const b = (color >> 8) & 0xFF;

            if (r > 200 && g > 190 && b > 160) {
                shirtMinX = Math.min(shirtMinX, x);
                shirtMaxX = Math.max(shirtMaxX, x);
                shirtMinY = Math.min(shirtMinY, y);
                shirtMaxY = Math.max(shirtMaxY, y);
            }
        }
    }
    console.log(`Shirt bounding box: x=[${shirtMinX}, ${shirtMaxX}], y=[${shirtMinY}, ${shirtMaxY}]`);

    // 2. Look for bees inside the shirt area
    const motifs = [];
    // Bees are darker than the shirt
    for (let y = shirtMinY; y < shirtMaxY; y++) {
        for (let x = shirtMinX; x < shirtMaxX; x++) {
            const color = image.getPixelColor(x, y);
            const r = (color >> 24) & 0xFF;
            const g = (color >> 16) & 0xFF;
            const b = (color >> 8) & 0xFF;

            // Bee color is roughly (120, 120, 120)
            if (r < 180 && g < 180 && b < 180 && r > 50) {
                // Potential bee. Check if it's a small cluster.
                let alreadyFound = false;
                for (const m of motifs) {
                    const dist = Math.sqrt(Math.pow(x - m.centerX, 2) + Math.pow(y - m.centerY, 2));
                    if (dist < 10) {
                        alreadyFound = true;
                        break;
                    }
                }

                if (!alreadyFound) {
                    // Measure size
                    let mWidth = 0;
                    while (x + mWidth < shirtMaxX) {
                        const c = image.getPixelColor(x + mWidth, y);
                        const nr = (c >> 24) & 0xFF;
                        if (nr > 190) break;
                        mWidth++;
                    }
                    
                    if (mWidth >= 3 && mWidth <= 15) {
                        motifs.push({ centerX: x + mWidth/2, centerY: y + 2, size: mWidth });
                    }
                }
            }
        }
    }

    console.log(`Found ${motifs.length} potential motifs.`);
    fs.writeFileSync('/home/agent-engineer/maryam-tech-pack/shirt_motifs.json', JSON.stringify({
        shirtBox: { shirtMinX, shirtMaxX, shirtMinY, shirtMaxY },
        motifs
    }, null, 2));
}

findShirtAndBees().catch(console.error);
