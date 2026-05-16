import { Jimp } from 'jimp';
import potrace from 'potrace';
import fs from 'fs';

async function vectorize() {
    const image = await Jimp.read('motif_focus.png');
    // Pre-process for sharpness
    image.contrast(0.8);
    image.greyscale();
    
    const buffer = await image.getBuffer('image/png');
    
    const params = {
        turdSize: 1,
        optTolerance: 0.1,
        threshold: 128
    };

    potrace.trace(buffer, params, (err, svg) => {
        if (err) throw err;
        fs.writeFileSync('motif.svg', svg);
        console.log('Motif vectorized.');
    });
}

vectorize().catch(console.error);
