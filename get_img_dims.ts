import { Jimp } from 'jimp';

async function getDims() {
    const img = await Jimp.read('/home/team/shared/MskTechPack/shirt_template_clean.png');
    console.log(JSON.stringify({width: img.bitmap.width, height: img.bitmap.height}));
}

getDims().catch(console.error);
