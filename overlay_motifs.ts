import { Jimp } from "jimp";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import potrace from "potrace";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function main() {
    const imagePath = "/home/team/shared/MskTechPack/pic-6.jpeg";
    const imageBuffer = await fs.readFile(imagePath);
    
    console.log("Analyzing image to find motifs...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Find all the insect beadwork motifs (bees/flies) on the shirt. 
    Return their coordinates as bounding boxes in JSON format: { "motifs": [ { "box_2d": [ymin, xmin, ymax, xmax], "label": "insect" } ] }.
    Coordinates should be normalized 0-1000.
    Only include motifs on the garment. Do not include face, hair, or background.`;

    const result = await model.generateContent([
        prompt,
        { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/jpeg" } }
    ]);
    
    const text = result.response.text();
    console.log("Gemini Response:", text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    
    const image = await Jimp.read(imagePath);
    const { width, height } = image.bitmap;
    
    let allMotifSvgs = "";

    for (let i = 0; i < data.motifs.length; i++) {
        const motif = data.motifs[i];
        const [ymin, xmin, ymax, xmax] = motif.box_2d;
        
        const left = (xmin * width) / 1000;
        const top = (ymin * height) / 1000;
        const w = ((xmax - xmin) * width) / 1000;
        const h = ((ymax - ymin) * height) / 1000;
        
        // Add padding
        const pad = 10;
        const cropLeft = Math.max(0, left - pad);
        const cropTop = Math.max(0, top - pad);
        const cropW = Math.min(width - cropLeft, w + pad * 2);
        const cropH = Math.min(height - cropTop, h + pad * 2);
        
        console.log(`Processing motif ${i} at`, { cropLeft, cropTop, cropW, cropH });
        
        const cropped = image.clone().crop({ x: cropLeft, y: cropTop, w: cropW, h: cropH });
        
        // High fidelity processing for the small motif
        cropped.resize({ w: cropped.width * 4 })
               .greyscale()
               .contrast(1)
               .posterize(2)
               .normalize();
        
        const buffer = await cropped.getBuffer('image/png');
        
        const motifSvg = await new Promise<string>((resolve, reject) => {
            potrace.trace(buffer, {
                turdSize: 5, // smaller for motifs
                optTolerance: 0.2,
                alphaMax: 1.3,
                blackOnWhite: true,
                color: "black"
            }, (err, svg) => {
                if (err) reject(err);
                else resolve(svg);
            });
        });
        
        // Extract paths from the motif SVG and wrap them in a group with positioning
        const pathsMatch = motifSvg.match(/<path[\s\S]*?\/>/g);
        if (pathsMatch) {
            // We need to scale them back to the original size and position them
            // The trace was on a 4x upscaled image.
            const scale = 0.25; 
            // We'll place them relatively on the final sketch.
            // Mapping from 328x461 (photo) to 1414x2000 (sketch) is tricky.
            // Let's just collect them for now.
            allMotifSvgs += `<g transform="translate(${left}, ${top}) scale(${scale})">${pathsMatch.join("")}</g>\n`;
        }
    }
    
    // Read the designer's template
    const template = await fs.readFile("/home/team/shared/MskTechPack/shirt_template.svg", "utf-8");
    
    // Inject motifs. We'll try to put them in the Front_View group.
    // For simplicity, we'll append them before the final </svg> for now, 
    // but ideally they should be transformed to fit the template's coordinate system.
    
    // The template uses viewBox="0 0 1414 2000".
    // The photo is 328 x 461.
    // Scale factor to map photo coordinates to template:
    const scaleX = 1414 / width;
    const scaleY = 2000 / height;
    
    const positionedMotifs = `<g id="Motifs" transform="scale(${scaleX}, ${scaleY})">\n${allMotifSvgs}</g>`;
    
    const finalSvg = template.replace("</svg>", `${positionedMotifs}\n</svg>`);
    
    await fs.writeFile("/home/agent-engineer/maryam-tech-pack/automated_output.svg", finalSvg);
    console.log("Final SVG generated with motifs overlayed.");
}

main().catch(console.error);
