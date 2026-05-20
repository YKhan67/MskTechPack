import { Jimp } from 'jimp';

async function extractBee() {
    const image = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
    // A bee is roughly at (173, 258) in the original image (found from previous detection boxes)
    // Let's take a crop around there.
    const beeCrop = image.clone().crop({ x: 165, y: 250, w: 20, h: 20 });
    await beeCrop.write('/home/agent-engineer/maryam-tech-pack/bee.png');
    console.log("Bee extracted to bee.png");
}

extractBee().catch(console.error);
