import { Jimp } from 'jimp';

async function extractBee() {
    const image = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
    // A clear bee at (173, 258) roughly. Let's try to find it precisely.
    const cropX = 171, cropY = 256, cropW = 6, cropH = 6;
    const beeCrop = image.clone().crop({ x: cropX - 5, y: cropY - 5, w: 16, h: 16 });
    
    // Scale up for better visibility in the separate PNG
    await beeCrop.scale(4);
    await beeCrop.write('/home/agent-engineer/maryam-tech-pack/bee.png');
    console.log("Clear Bee extracted to bee.png");
}

extractBee().catch(console.error);
