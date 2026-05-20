import { Jimp } from 'jimp';

async function analyzeShirt() {
    const image = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
    const { width, height } = image.bitmap;
    
    let minX = width, maxX = 0, minY = height, maxY = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = image.getPixelColor(x, y);
            const r = (color >> 24) & 0xFF;
            const g = (color >> 16) & 0xFF;
            const b = (color >> 8) & 0xFF;
            
            // Off-white shirt threshold
            if (r > 200 && g > 200 && b > 180) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }
    
    console.log(JSON.stringify({ minX, maxX, minY, maxY }));
}

analyzeShirt().catch(console.error);
