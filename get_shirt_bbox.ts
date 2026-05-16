import { Jimp } from 'jimp';

async function getShirtBBox() {
    const image = await Jimp.read('shirt_mask.png');
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    let xmin = width, ymin = height, xmax = 0, ymax = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = image.getPixelColor(x, y);
            const r = (color >> 24) & 0xFF;
            if (r === 255) {
                if (x < xmin) xmin = x;
                if (y < ymin) ymin = y;
                if (x > xmax) xmax = x;
                if (y > ymax) ymax = y;
                found = true;
            }
        }
    }

    if (found) {
        console.log(JSON.stringify({ xmin, ymin, xmax, ymax }));
    } else {
        console.log("No shirt found in mask.");
    }
}

getShirtBBox().catch(console.error);
