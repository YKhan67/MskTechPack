import { Jimp } from 'jimp';
import fs from 'fs';

async function createCleanBee() {
    const size = 100;
    const image = new Jimp({ width: size, height: size, color: 0xFFFFFFFF }); // White background

    // Draw a simple bee shape (grey body, two wings)
    const grey = 0x888888FF;
    const darkGrey = 0x444444FF;

    // Body
    for (let y = 40; y < 60; y++) {
        for (let x = 30; x < 70; x++) {
            image.setPixelColor(grey, x, y);
        }
    }
    // Wings
    for (let y = 30; y < 45; y++) {
        for (let x = 35; x < 45; x++) image.setPixelColor(grey, x, y);
        for (let x = 55; x < 65; x++) image.setPixelColor(grey, x, y);
    }

    await image.write('/home/agent-engineer/maryam-tech-pack/bee_clean.png');
    console.log("Clean Bee PNG created");
}

createCleanBee().catch(console.error);
