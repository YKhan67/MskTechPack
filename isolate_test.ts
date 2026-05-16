import { Jimp } from "jimp";

async function main() {
    const imagePath = "/home/team/shared/MskTechPack/pic-6.jpeg";
    const image = await Jimp.read(imagePath);
    const { width, height } = image.bitmap;
    
    const motifsOnly = image.clone();
    let motifPixels = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = motifsOnly.getPixelColor(x, y);
            const r = (color >> 24) & 0xFF;
            const g = (color >> 16) & 0xFF;
            const b = (color >> 8) & 0xFF;
            
            if (r < 130 && g < 130 && b < 130) {
                motifsOnly.setPixelColor(0x000000FF, x, y);
                motifPixels++;
            } else {
                motifsOnly.setPixelColor(0xFFFFFFFF, x, y);
            }
        }
    }
    console.log(`Motif pixels: ${motifPixels}`);
    await motifsOnly.write("/home/agent-engineer/maryam-tech-pack/motifs_isolated.png");
}

main().catch(console.error);
