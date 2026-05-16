import { Jimp } from "jimp";

async function sampleRegion() {
    const imagePath = "/home/team/shared/MskTechPack/pic-6.jpeg";
    const image = await Jimp.read(imagePath);
    const { width, height } = image.bitmap;
    
    const ymin = 340, xmin = 350, ymax = 375, xmax = 395;
    const sx = Math.floor((xmin / 1000) * width);
    const sy = Math.floor((ymin / 1000) * height);
    const sw = Math.floor(((xmax - xmin) / 1000) * width);
    const sh = Math.floor(((ymax - ymin) / 1000) * height);
    
    console.log(`Sampling region: ${sx}, ${sy}, ${sw}, ${sh}`);
    for (let y = sy; y < sy + sh; y++) {
        let row = "";
        for (let x = sx; x < sx + sw; x++) {
            const color = image.getPixelColor(x, y);
            const r = (color >> 24) & 0xFF;
            row += r.toString().padStart(4, ' ');
        }
        console.log(row);
    }
}

sampleRegion().catch(console.error);
