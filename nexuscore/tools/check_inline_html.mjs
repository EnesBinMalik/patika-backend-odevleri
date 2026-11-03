#!/usr/bin/env node
/**
 * Statik tek-dosya HTML arayuzlerinin gorunmeyen kirik noktalari icin denetim:
 *  1) Her satir-ici <script> blogunun sozdizimi (vm.Script)
 *  2) getElementById/querySelector ile istenen her id gercekten HTML'de var mi
 *  3) HTML icinde ayni id iki kere tanimlanmis mi
 *
 * Kullanim: node tools/check_inline_html.mjs index.html
 * SPDX-License-Identifier: Apache-2.0 · Enes Ozturk
 */
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const file = process.argv[2] ?? 'index.html';
const html = readFileSync(file, 'utf8');

const declaredIds = new Set();
const duplicateIds = new Set();
for (const m of html.matchAll(/\sid\s*=\s*"([^"]+)"/g)) {
  if (declaredIds.has(m[1])) duplicateIds.add(m[1]);
  declaredIds.add(m[1]);
}

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const syntaxErrors = [];
const missingIds = new Set();

scripts.forEach(([, attrs, code], i) => {
  if (/\ssrc\s*=/.test(attrs)) return;
  try {
    new Script(code, { filename: `${file}#inline-${i}` });
  } catch (err) {
    syntaxErrors.push({ i, message: err.message.split('\n')[0] });
  }
  for (const ref of code.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    if (!declaredIds.has(ref[1])) missingIds.add(ref[1]);
  }
  for (const ref of code.matchAll(/querySelector\(\s*['"]#([A-Za-z0-9_-]+)['"]\s*\)/g)) {
    if (!declaredIds.has(ref[1])) missingIds.add(ref[1]);
  }
});

console.log(`dosya            : ${file}`);
console.log(`html boyutu      : ${html.length} karakter / ${html.split('\n').length} satir`);
console.log(`inline script    : ${scripts.filter(([, a]) => !/\ssrc\s*=/.test(a)).length}`);
console.log(`tanimli id       : ${declaredIds.size}`);
console.log(`sozdizimi hata   : ${syntaxErrors.length}`);
syntaxErrors.forEach((e) => console.log(`  - blok ${e.i + 1}: ${e.message}`));
console.log(`eksik id erisimi : ${missingIds.size}`);
[...missingIds].forEach((id) => console.log(`  - '${id}' icin HTML'de id tanimi yok`));
console.log(`cinifti id       : ${duplicateIds.size}`);
[...duplicateIds].forEach((id) => console.log(`  - '${id}' birden fazla kez tanimli`));

const failed = syntaxErrors.length + missingIds.size + duplicateIds.size > 0;
console.log(failed ? 'SONUC: BASARISIZ' : 'SONUC: BASARILI');
process.exitCode = failed ? 1 : 0;
