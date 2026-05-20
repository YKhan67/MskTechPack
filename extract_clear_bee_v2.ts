import { Jimp } from 'jimp';

async function extractBee() {
    const image = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
    const cropX = 181, cropY = 201, cropW = 11, cropH = 11;
    const beeCrop = image.clone().crop({ x: cropX - 5, y: cropY - 5, w: 20, h: 20 });
    
    await beeCrop.scale(4);
    await beeCrop.write('/home/agent-engineer/maryam-tech-pack/bee.png');
    console.log("Clear Bee extracted to bee.png");
}

extractBee().catch(console.error);
