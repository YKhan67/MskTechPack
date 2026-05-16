import { Jimp } from "jimp";

async function checkMask() {
    const mask = await Jimp.read("/home/agent-engineer/maryam-tech-pack/shirt_mask.png");
    const ymin = 340, xmin = 350, ymax = 375, xmax = 395;
    const sx = Math.floor((xmin / 1000) * mask.bitmap.width);
    const sy = Math.floor((ymin / 1000) * mask.bitmap.height);
    const sw = Math.floor(((xmax - xmin) / 1000) * mask.bitmap.width);
    const sh = Math.floor(((ymax - ymin) / 1000) * mask.bitmap.height);
    
    console.log(`Mask region: ${sx}, ${sy}, ${sw}, ${sh}`);
    for (let y = sy; y < sy + sh; y++) {
        let row = "";
        for (let x = sx; x < sx + sw; x++) {
            const color = mask.getPixelColor(x, y);
            const r = (color >> 24) & 0xFF;
            row += r.toString().padStart(4, ' ');
        }
        console.log(row);
    }
}

checkMask().catch(console.error);
