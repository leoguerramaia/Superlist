import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'www');
const allowed = new Set(['.html', '.css', '.js', '.webmanifest', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff', '.woff2']);

await mkdir(output, { recursive: true });

async function copyPublicFiles(source, destination) {
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'www' || entry.name === 'android' || entry.name === 'ios' || entry.name === 'supabase' || entry.name === 'scripts' || entry.name === 'mobile') continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      await copyPublicFiles(from, to);
      continue;
    }
    if (!allowed.has(path.extname(entry.name).toLowerCase())) continue;
    await cp(from, to);
  }
}

await copyPublicFiles(root, output);

for (const required of ['index.html', 'auth.html', 'app.html', 'app.js', 'cloud.js', 'styles.css']) {
  if (!existsSync(path.join(output, required))) {
    throw new Error(`Arquivo obrigatório ausente para o app mobile: ${required}`);
  }
}

console.log('Build mobile preparado em ./www');
