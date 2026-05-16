import { Jimp } from 'jimp';
import fs from 'fs';

async function getMotifCoords() {
    try {
        const image = await Jimp.read('motifs_isolated.png');
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        const visited = new Set<number>();
        const clusters: { xmin: number, ymin: number, xmax: number, ymax: number }[] = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x);
                const color = image.getPixelColor(x, y);
                const r = (color >> 24) & 0xFF;
                const g = (color >> 16) & 0xFF;
                const b = (color >> 8) & 0xFF;

                // If pixel is dark and not visited
                if (r < 128 && !visited.has(idx)) {
                    // Start BFS/DFS
                    const cluster = { xmin: x, ymin: y, xmax: x, ymax: y };
                    const queue = [[x, y]];
                    visited.add(idx);

                    while (queue.length > 0) {
                        const [currX, currY] = queue.shift()!;
                        
                        cluster.xmin = Math.min(cluster.xmin, currX);
                        cluster.ymin = Math.min(cluster.ymin, currY);
                        cluster.xmax = Math.max(cluster.xmax, currX);
                        cluster.ymax = Math.max(cluster.ymax, currY);

                        for (let dy = -1; currY + dy >= 0 && currY + dy < height && dy <= 1; dy++) {
                            for (let dx = -1; currX + dx >= 0 && currX + dx < width && dx <= 1; dx++) {
                                const nx = currX + dx;
                                const ny = currY + dy;
                                const nidx = ny * width + nx;
                                if (!visited.has(nidx)) {
                                    const nColor = image.getPixelColor(nx, ny);
                                    const nr = (nColor >> 24) & 0xFF;
                                    if (nr < 128) {
                                        visited.add(nidx);
                                        queue.push([nx, ny]);
                                    }
                                }
                            }
                        }
                    }
                    
                    // Only keep clusters of a certain size (to avoid noise)
                    const w = cluster.xmax - cluster.xmin;
                    const h = cluster.ymax - cluster.ymin;
                    if (w > 2 && h > 2 && w < 50 && h < 50) {
                        clusters.push(cluster);
                    }
                }
            }
        }

        console.log(JSON.stringify(clusters, null, 2));
    } catch (e) {
        console.error(e);
    }
}

getMotifCoords();
