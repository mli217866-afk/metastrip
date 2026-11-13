/* node test/smoke.js — builds a tiny JPEG with EXIF-less APP1 XMP, APP11 C2PA and APP13 IPTC, then checks
   that clean() removes all three and leaves the image data byte for byte. */
'use strict';
const assert = require('assert');
const { clean, sniff, diagnose } = require('../index.js');

const seg = (marker, payload) => { const b = Buffer.from(payload, 'latin1'); const h = Buffer.alloc(4); h[0] = 0xff; h[1] = marker; h.writeUInt16BE(b.length + 2, 2); return Buffer.concat([h, b]); };
const xmp = 'http://ns.adobe.com/xap/1.0/\0<x:xmpmeta><rdf:Description Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"/></x:xmpmeta>';
const c2pa = 'JP\0\x01\0\0\0\x01\0\0\0\x20jumb\0\0\0\x18jumdc2pa\0OpenAI';
const iptc = 'Photoshop 3.0\x008BIM\x04\x04\0\0\0\0\0\0';
const image = Buffer.from([0xff, 0xdb, 0x00, 0x04, 0x00, 0x01, 0xff, 0xda, 0x00, 0x02, 0x12, 0x34, 0x56, 0xff, 0xd9]);
const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8]), seg(0xe1, xmp), seg(0xeb, c2pa), seg(0xed, iptc), image]);

assert.strictEqual(sniff(new Uint8Array(jpeg)), 'jpeg');
const res = clean(jpeg);
const types = res.found.map((f) => f.type);
console.log('found:', types.join(', '), '·', diagnose(res).level);
assert.ok(types.includes('XMP'), 'XMP found');
assert.ok(types.includes('C2PA / JUMBF'), 'C2PA found');
const out = Buffer.from(res.bytes);
assert.ok(out.length < jpeg.length, 'smaller after cleaning');
assert.ok(out.subarray(out.length - image.length).equals(image), 'image data untouched');
assert.strictEqual(clean(out).found.length, 0, 'second pass finds nothing');
console.log('ok');
