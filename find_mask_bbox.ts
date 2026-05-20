import { Jimp } from 'jimp';

async function findMaskBBox() {
    const img = await Jimp.read('/home/team/shared/MskTechPack/shirt_template_clean.png');
    const { width, height } = img.bitmap;
    
    let minX = width, maxX = 0, minY = height, maxY = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = img.getPixelColor(x, y);
            const r = (color >> 24) & 0xFF;
            const g = (color >> 16) & 0xFF;
            const b = (color >> 8) & 0xFF;
            
            // Check if not white (threshold for noise)
            if (r < 250 || g < 250 || b < 250) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }
    
    console.log(JSON.stringify({ minX, maxX, minY, maxY }));
}

findMaskBBox().catch(console.error);
