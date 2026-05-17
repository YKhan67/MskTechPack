import { Jimp } from 'jimp';
import fs from 'fs';

async function visualizeDetections() {
    const image = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
    const motifCoords = JSON.parse(fs.readFileSync('motif_coords.json', 'utf-8'));

    for (const coord of motifCoords) {
        // Draw a red box
        for (let x = coord.xmin; x <= coord.xmax; x++) {
            image.setPixelColor(0xFF0000FF, x, coord.ymin);
            image.setPixelColor(0xFF0000FF, x, coord.ymax);
        }
        for (let y = coord.ymin; y <= coord.ymax; y++) {
            image.setPixelColor(0xFF0000FF, coord.xmin, y);
            image.setPixelColor(0xFF0000FF, coord.xmax, y);
        }
    }

    await image.write('detections_visualized.png');
    console.log('Detections visualized in detections_visualized.png');
}

visualizeDetections().catch(console.error);
