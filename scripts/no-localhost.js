import fs from 'fs';
import path from 'path';

const root = path.resolve('src');
const badFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.test\./.test(entry.name)) continue;
    else {
      const text = fs.readFileSync(full, 'utf8');
      if (text.includes('http://localhost')) badFiles.push(full);
    }
  }
}

walk(root);

if (badFiles.length) {
  console.error('Found forbidden http://localhost references in:', badFiles);
  process.exit(1);
}
