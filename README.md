# metastrip

Remove photo metadata — EXIF, GPS, XMP, IPTC, PNG text and C2PA content credentials — from **JPEG, PNG, WebP and HEIC** without re-encoding. One file, zero dependencies, runs in the browser and in Node.

It's the engine behind **[WipeTag](https://wipetag.com)**, a free metadata remover that cleans photos in your browser without uploading them.

- **Pixels untouched.** Works at the segment / chunk / box level. Image data is copied byte for byte.
- **Sees what's there first.** Lists every block it finds, plus a plain-language diagnosis (AI marker, edit history, privacy data, clean).
- **Three EXIF modes.** Remove all EXIF, remove only GPS, or keep camera and copyright fields.
- **HEIC stays HEIC.** iPhone photos are cleaned in place, with item offsets recalculated. No conversion to JPEG.

## Install

```bash
npm install github:mli217866-afk/metastrip
```

It is not published on the npm registry; this installs it straight from GitHub. Or drop `index.js` into a page with a `<script>` tag. It exposes `window.MetaStrip`.

## Use

```js
const { clean, diagnose } = require('metastrip');
const fs = require('fs');

const res = clean(fs.readFileSync('photo.jpg'));          // { exif: 'all' } by default
console.log(res.found.map((f) => f.type));                // [ 'EXIF', 'XMP', 'C2PA / JUMBF' ]
console.log(diagnose(res).title);                         // plain-language summary
fs.writeFileSync('photo-clean.jpg', res.bytes);
```

In the browser:

```js
const res = MetaStrip.clean(await file.arrayBuffer(), { exif: 'gps' });
const blob = new Blob([res.bytes], { type: file.type });
```

### Options

| `exif` | EXIF result | Other blocks (XMP, IPTC, C2PA, PNG text) |
|---|---|---|
| `'all'` (default) | Removed; Orientation kept so photos stay upright | Removed |
| `'gps'` | Only GPS fields removed | Removed |
| `'camera'` | Keeps Make, Model, lens, exposure, Orientation, Artist, Copyright | Removed |

### Result

- `bytes` — cleaned file (`Uint8Array`)
- `kind` — `jpeg`, `png`, `webp`, `heic` or `avif`
- `found` — blocks found, each `{ type, detail }`
- `exifFields` — every EXIF field by name, value and group
- `diagnose(res)` — `{ level: 'ai' | 'history' | 'privacy' | 'clean', title, reasons }`

## CLI

```bash
npx github:mli217866-afk/metastrip photo.jpg          # writes photo-clean.jpg
npx github:mli217866-afk/metastrip *.heic --gps       # remove GPS only
npx github:mli217866-afk/metastrip photo.png --check  # report, write nothing
```

## What it does not do

- It does not change pixels, so visible watermarks and pixel-level watermarks such as SynthID stay.
- It does not add or forge metadata.
- It does not decide how a platform labels an image. Platforms may also analyse the image itself.

Use it on files you own. Removing metadata does not remove any obligation to disclose AI-generated content where a platform or the law requires it.

## Formats

JPEG, PNG, WebP, HEIC / HEIF and AVIF (single images). RAW, HEIF image sequences and video are not supported.

## License

MIT. Want it without installing anything? Use **[wipetag.com](https://wipetag.com)** — the same code, in your browser.
