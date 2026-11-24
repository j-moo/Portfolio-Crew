import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';

const imageTypes = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.avif', 'image/avif'],
  ['.bmp', 'image/bmp'],
]);
const dataSlot = '<script id="tournament-data" type="application/json">{"key":"","candidates":[]}</script>';

async function build(paths) {
  if (paths.length !== 2) {
    throw new Error('Usage: node build-reference-tournament.mjs <manifest.json> <output.html>');
  }
  const [manifestPath, outputPath] = paths.map(path => resolve(path));
  const manifest = JSON.parse((await readFile(manifestPath, 'utf8')).replace(/^\uFEFF/, ''));
  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error('Provide an array with at least one approved image.');
  }

  const candidates = [];
  const ids = new Set();
  for (const entry of manifest) {
    const id = String(entry?.id ?? '');
    if (!/^[1-9]\d*$/.test(id) || ids.has(id) || typeof entry?.path !== 'string' || !entry.path.trim()) {
      throw new Error('Each candidate needs a unique positive integer id and an image path.');
    }
    ids.add(id);
    const imagePath = resolve(dirname(manifestPath), entry.path);
    const mime = imageTypes.get(extname(imagePath).toLowerCase());
    if (!mime) {
      throw new Error(`Unsupported image format for candidate ${id}.`);
    }
    const bytes = await readFile(imagePath);
    if (bytes.length === 0) {
      throw new Error(`Candidate ${id} has an empty image file.`);
    }
    const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : basename(imagePath);
    candidates.push({ id, name, src: `data:${mime};base64,${bytes.toString('base64')}` });
  }

  const template = await readFile(new URL('../assets/reference-tournament.html', import.meta.url), 'utf8');
  if (!template.includes(dataSlot)) {
    throw new Error('The tournament template is missing its data slot.');
  }
  const key = createHash('sha256').update(JSON.stringify(candidates)).digest('hex');
  const data = JSON.stringify({ key, candidates }).replaceAll('<', '\\u003c');
  const html = template.replace(dataSlot, () => `<script id="tournament-data" type="application/json">${data}</script>`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, { flag: 'wx' });
  process.stdout.write(`${outputPath}\n`);
}

try {
  await build(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
