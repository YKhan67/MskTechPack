import { Jimp } from 'jimp';
import fs from 'fs';

async function visualize() {
    const image = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
    const { motifs } = JSON.parse(fs.readFileSync('/home/agent-engineer/maryam-tech-pack/shirt_motifs.json', 'utf-8'));

    for (const m of motifs) {
        // Draw a red square around each motif
        const size = 6;
        const startX = Math.max(0, Math.round(m.centerX - size / 2));
        const startY = Math.max(0, Math.round(m.centerY - size / 2));

        for (let x = startX; x < startX + size; x++) {
            if (x < image.bitmap.width) {
                image.setPixelColor(0xFF0000FF, x, startY);
                image.setPixelColor(0xFF0000FF, x, Math.min(image.bitmap.height - 1, startY + size));
            }
        }
        for (let y = startY; y < startY + size; y++) {
            if (y < image.bitmap.height) {
                image.setPixelColor(0xFF0000FF, startX, y);
                image.setPixelColor(0xFF0000FF, Math.min(image.bitmap.width - 1, startX + size), y);
            }
        }
    }

    await image.write('/home/agent-engineer/maryam-tech-pack/shirt_motifs_visualized.png');
    console.log("Visualization saved to shirt_motifs_visualized.png");
}

visualize().catch(console.error);
