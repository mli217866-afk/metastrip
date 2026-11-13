#!/usr/bin/env node
/* metastrip <file...> [--gps | --camera] [--check]
   Writes <name>-clean.<ext> next to each file. --check only reports what was found. */
'use strict';
const fs = require('fs');
const path = require('path');
const { clean, diagnose } = require('./index.js');

const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith('--'));
const exif = args.includes('--gps') ? 'gps' : args.includes('--camera') ? 'camera' : 'all';
const checkOnly = args.includes('--check');
if (!files.length) {
  console.log('Usage: metastrip <file...> [--gps | --camera] [--check]\n' +
    '  --gps     remove only GPS from EXIF (other blocks are still removed)\n' +
    '  --camera  keep camera, lens, exposure, artist and copyright EXIF\n' +
    '  --check   report what is in the file, write nothing\n' +
    'In-browser version: https://wipetag.com');
  process.exit(1);
}
let failed = 0;
for (const f of files) {
  try {
    const res = clean(fs.readFileSync(f), { exif });
    const d = diagnose(res);
    console.log(`${f}: ${res.found.length ? res.found.map((x) => x.type).join(', ') : 'no metadata'} — ${d.title}`);
    if (checkOnly || !res.found.length) continue;
    const ext = path.extname(f);
    const out = path.join(path.dirname(f), path.basename(f, ext) + '-clean' + ext);
    fs.writeFileSync(out, res.bytes);
    console.log('  → ' + out);
  } catch (e) {
    failed++;
    console.error(`${f}: ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);
