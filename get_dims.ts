import { Jimp } from 'jimp';
const img = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
console.log(`${img.bitmap.width}x${img.bitmap.height}`);
