import { Jimp } from "jimp";
import potrace from "potrace";
import fs from "fs/promises";

async function main() {
  const imagePath = "/home/team/shared/MskTechPack/pic-6.jpeg";
  const outputSvgPath = "/home/team/shared/MskTechPack/automated_output.svg";

  try {
    const image = await Jimp.read(imagePath);
    console.log("Image loaded, dimensions:", image.width, "x", image.height);
    
    // Designer Recommended Pre-processing
    console.log("Resizing 4x...");
    image.resize({ w: image.width * 4 });
    
    console.log("Applying greyscale, contrast, and posterize...");
    image.greyscale()
         .contrast(1) 
         .posterize(2) 
         .normalize();
    
    const processedBuffer = await image.getBuffer('image/png');

    console.log("Tracing with Potrace...");
    const svg = await new Promise<string>((resolve, reject) => {
      potrace.trace(processedBuffer, {
        threshold: 128,
        turdSize: 15, 
        optTolerance: 0.2, 
        alphaMax: 1.3, 
        blackOnWhite: true,
        color: "black"
      }, (err, svg) => {
        if (err) reject(err);
        else resolve(svg);
      });
    });

    await fs.writeFile(outputSvgPath, svg);
    console.log("Vectorization completed. Saved to", outputSvgPath);
  } catch (error) {
    console.error("Error in vectorization:", error);
  }
}

main();
