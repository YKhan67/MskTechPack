import { Jimp } from 'jimp';
import potrace from 'potrace';
import fs from 'fs';

async function vectorize() {
    const image = await Jimp.read('motif_focus.png');
    // Potrace works better with buffer
    const buffer = await image.getBuffer('image/png');
    
    potrace.trace(buffer, (err, svg) => {
        if (err) throw err;
        fs.writeFileSync('motif.svg', svg);
        console.log('Motif vectorized.');
    });
}

vectorize().catch(console.error);
