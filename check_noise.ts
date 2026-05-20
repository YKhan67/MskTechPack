import fs from 'fs';

const svg = fs.readFileSync('/home/team/shared/final_tech_pack.svg', 'utf-8');
const pathRegex = /<path\s+d="([^"]+)"/g;
let match;
let count = 0;

while ((match = pathRegex.exec(svg)) !== null) {
    const d = match[1];
    if (d.length >= 400 && d.length <= 5000) {
        count++;
        console.log(`Len: ${d.length}, Start: ${d.substring(0, 50)}...`);
    }
}
console.log(`Total middle-sized paths: ${count}`);
