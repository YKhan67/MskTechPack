import fs from 'fs';

const motifs = JSON.parse(fs.readFileSync('/home/agent-engineer/maryam-tech-pack/found_motifs_v3.json', 'utf-8'));

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
motifs.forEach(m => {
    minX = Math.min(minX, m.centerX);
    maxX = Math.max(maxX, m.centerX);
    minY = Math.min(minY, m.centerY);
    maxY = Math.max(maxY, m.centerY);
});

console.log(JSON.stringify({ minX, maxX, minY, maxY }));
