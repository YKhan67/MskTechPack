import { Jimp } from 'jimp';

async function checkImage() {
    try {
        const image = await Jimp.read('motifs_isolated.png');
        console.log(`Dimensions: ${image.bitmap.width}x${image.bitmap.height}`);
        
        let darkPixels = 0;
        let lightPixels = 0;
        let totalPixels = image.bitmap.width * image.bitmap.height;
        for (let y = 0; y < image.bitmap.height; y++) {
            for (let x = 0; x < image.bitmap.width; x++) {
                const color = image.getPixelColor(x, y);
                const r = (color >> 24) & 0xFF;
                const g = (color >> 16) & 0xFF;
                const b = (color >> 8) & 0xFF;
                const a = color & 0xFF;
                if (r < 128) darkPixels++;
                if (r > 128) lightPixels++;
                if (x === 0 && y === 0) console.log(`Sample pixel (0,0): R=${r}, G=${g}, B=${b}, A=${a}`);
            }
        }
        console.log(`Total pixels: ${totalPixels}`);
        console.log(`Dark pixels (R < 128): ${darkPixels}`);
        console.log(`Light pixels (R > 128): ${lightPixels}`);
    } catch (e) {
        console.error(e);
    }
}

checkImage();
