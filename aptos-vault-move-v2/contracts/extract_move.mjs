/**
 * Arayüz içinde metin olarak duran Move kaynaklarını gerçek bir Move paketine çıkarır.
 *
 *   npm run extract:move
 *   # eşdeğeri: node --experimental-strip-types contracts/extract_move.mjs
 *
 * --experimental-strip-types şart: girdi bir `.ts` dosyası ve Node'un tip temizleme
 * modu olmadan `.ts` importu ERR_UNKNOWN_FILE_EXTENSION ile kırılıyor (Node 22 LTS
 * davranışı; Node >= 23.6 bayrağı otomatik açıyor).
 *
 * Çıktı (depo ile birlikte versiyonlanır, elle düzenlenmez):
 *   contracts/package/Move.toml
 *   contracts/package/sources/vault.move
 *   contracts/package/sources/tests/vault_tests.move
 *   contracts/legacy/legacy_vault.move
 *
 * Böylece klon sonrası `cd contracts/package && aptos move test` doğrudan çalışır.
 * Asıl kaynak her zaman src/data/moveContracts.ts dosyasıdır.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const sourceModule = pathToFileURL(join(here, '..', 'src', 'data', 'moveContracts.ts')).href;
const { MOVE_TOML_CODE, LEGACY_MOVE_CODE, UPGRADED_MOVE_CODE, MOVE_TESTS_CODE } = await import(sourceModule);

const files = [
  ['package/Move.toml', MOVE_TOML_CODE],
  ['package/sources/vault.move', UPGRADED_MOVE_CODE],
  ['package/sources/tests/vault_tests.move', MOVE_TESTS_CODE],
  // Eski modül pakete dahil edilmez: `aptos move test` paketteki her modülü derler ve
  // yalnızca referans amaçlı olan legacy_vault bir derleme hatasıyla testi bloke edebilirdi.
  ['legacy/legacy_vault.move', LEGACY_MOVE_CODE],
];

for (const [rel, code] of files) {
  const target = join(root, 'contracts', rel);
  mkdirSync(dirname(target), { recursive: true });
  const text = code.endsWith('\n') ? code : code + '\n';
  writeFileSync(target, text, 'utf8');
  const label = relative(root, target).split(sep).join('/');
  console.log(`yazıldı: ${label} (${text.split('\n').length - 1} satır)`);
}
