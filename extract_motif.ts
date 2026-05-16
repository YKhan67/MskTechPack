import { Jimp } from 'jimp';

async function extractMotif() {
    try {
        const image = await Jimp.read('/home/team/shared/MskTechPack/pic-6.jpeg');
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        const ymin = 340, xmin = 350, ymax = 375, xmax = 395;
        const x = Math.floor((xmin / 1000) * width);
        const y = Math.floor((ymin / 1000) * height);
        const w = Math.floor(((xmax - xmin) / 1000) * width);
        const h = Math.floor(((ymax - ymin) / 1000) * height);

        console.log(`Cropping at ${x}, ${y}, ${w}, ${h}`);
        const crop = image.clone().crop({ x, y, w, h });
        crop.resize({ w: w * 4 });
        crop.contrast(0.5);
        await crop.write('motif_focus.png');
        console.log('Motif focus generated.');
    } catch (e) {
        console.error(e);
    }
}

extractMotif();
