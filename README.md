<div align="center">

# Patika Backend Ödevleri

[Patika](https://patika.dev) backend yolculuğundaki ödev ve projelerin **depo kökü**.
Her ödev kendi klasöründe; blokzincir, GraphQL, Node ve mimari refaktör işleri — artık arayüz
mühendisliği çıktıları da — burada toplanır.

[![Ödev](https://img.shields.io/badge/ödev-4-22D3EE?style=flat-square)](#içerik)
[![Diller](https://img.shields.io/badge/Move_2·TypeScript·HTML/CSS-A78BFA?style=flat-square)](#içerik)
[![Özel görsel](https://img.shields.io/badge/her_ödev-özel_kapak-FBBF24?style=flat-square)](#görsel-standartları)
[![Durum](https://img.shields.io/badge/yerel-onay_bekleniyor-64748B?style=flat-square)](#nasıl-okunur)

</div>

---

## İçerik

| # | Ders / Teknoloji | Ödev | Ne içeriyor | Durum |
|---|---|---|---|---|
| 1 | **Aptos · Move 2** | [Aptos Vault Move v2 — Doğrudan Kasa Adresi Mimarisi & Test Portalı](aptos-vault-move-v2/README.md) | `vault_address` refaktörü, 311 satır sözleşme, 6 birim test, `transfer_admin` bonusu, React 19 portalı ve üretilmiş gerçek Move paketi | ✅ tamamlandı · ⚠️ gaz/devnet iddiaları [§11](aptos-vault-move-v2/README.md#11-dürüstlük-rehberi-kod-mu-vitrin-mi)'de dürüstçe sınırlanmıştır |
| 2 | **Aptos · Move 2 + React 19** | [Aptos TrustEscrow Protocol — Kilometre Taşı Tabanlı Emanet & Hakem Tahkimi](aptos-trustescrow-protocol/README.md) | 600 satır Move (488 + 112), 7 `entry fun` + 2 `#[view]`, `Coin<AptosCoin>` kaynağı ile kilitleme, 9 hata kodu, 12 `assert!` ile 2 birim test, 5 sekmeli simülasyon paneli | ✅ teslim · ⚠️ derlenmemiş kaynak, dağıtım/cüzdan iddiaları ve 14 sözleşme kusuru [§8](aptos-trustescrow-protocol/README.md#8-dürüstlük-rehberi-sözleşmede-kalan-kusurlar)–[§9](aptos-trustescrow-protocol/README.md#9-doğrulanamayan-iddialar-orijinal-arşivden-çıkarıldı)'da |
| 3 | **React 19 · Vite 8 · Tailwind 4** | [AuraSync — Mobile Cyber-Glass OS](aurasync/README.md) | 13 TS/TSX dosya · 2.687 satır, 9 bileşen, batarya/eğim/audio canvas sensör katmanı, 10 komutluk terminal, `localStorage` notları, bağımlılıksız 751 satırlık standalone `.html` | ✅ teslim · `tsc --noEmit` 0 hata, build 1.671 modül · ⚠️ ağ/KPI sayıları simülasyon, şifreleme yok: [§4](aurasync/README.md#4-dürüstlük-rehberi-gerçek-olan--kurgu-olan) |
| 4 | **Vanilla HTML · Canvas 2D · Web Audio** | [NexusCore — AI Quantum Terminal & Threat Visualizer](nexuscore/README.md) | Tek dosya `index.html` (2.483 satır), dönen canvas radar + 8 örnek düğüm, termal model formülü, 11 komutluk CLI, kendi statik denetleyicimiz (`0` kırık id) | ✅ teslim · `SONUC: BASARILI` · ⚠️ tehdit/metrik verileri kurgusal, iki `innerHTML` batığı kapatıldı: [§5](nexuscore/README.md#5-dürüstlük-rehberi-gerçek-olan--kurgu-olan)–[§7](nexuscore/README.md#7-bu-oturumda-düzeltilen-gerçek-kusurlar) |

## Klasör yapısı

```text
patika-backend-odevleri/
├── aptos-vault-move-v2/
│   ├── contracts/
│   │   ├── package/        ← `aptos move test` ile doğrudan çalıştırılabilir gerçek paket
│   │   ├── legacy/         ← v1 referans sözleşmesi (pakete dahil değil)
│   │   └── extract_move.mjs← Move kaynaklarını src/data'daki metinlerden üretir
│   ├── docs/cover.svg      ← ödevin özel kapağı (elle yazılmış vektör)
│   ├── src/                ← 5 sekmeli inceleme portalı (React 19 + Vite 8 + Tailwind 4)
│   └── README.md           ← ödevin tam belgesi
├── aptos-trustescrow-protocol/
│   ├── contracts/
│   │   ├── Move.toml       ← tek bağımlılık: AptosFramework
│   │   ├── sources/        ← escrow_vault (488) + reputation_registry (112)
│   │   └── tests/          ← trust_escrow_tests.move (2 test, 12 assert)
│   ├── docs/cover.svg      ← ödevin özel kapağı (elle yazılmış vektör)
│   ├── src/                ← 5 sekmeli emanet operatörü (yaşam döngüsü yerel simülasyondur)
│   └── README.md           ← §8'de 14 sözleşme kusuru, §9'da arşivden silinen iddialar
├── aurasync/
│   ├── src/
│   │   ├── components/     ← 9 bileşen: batarya halkası, tilt HUD, canvas, terminal, notlar
│   │   ├── hooks/          ← useDeviceSensors.ts (Battery + deviceorientation + sayaçlar)
│   │   └── services/       ← soundFx.ts (Web Audio osilatörleri, mute kalıcılığı)
│   ├── public/aurasync-standalone.html ← bağımlılıksız tek dosya kopya (751 satır, 5 komut)
│   ├── docs/cover.svg      ← ödevin özel kapağı (elle yazılmış vektör)
│   └── README.md           ← §4'te gerçek ↔ kurgu tablosu, §5'te kapatılan kusurlar
├── nexuscore/
│   ├── index.html          ← 2.483 satır: markup + CSS + ES6+ modül (tek uygulama dosyası)
│   ├── tools/check_inline_html.mjs ← kendi denetleyici: söz dizimi, eksik id, çift id
│   ├── docs/cover.svg      ← ödevin özel kapağı (elle yazılmış vektör)
│   └── README.md           ← §5'te veri kaynağı etiketleri, §6'da doğrulama çıktısı
└── README.md               ← bu dosya (depo kökü indeksi)
```

## Nasıl okunur

Her ödev klasörünün kendi `README.md`'si üç şeyi birlikte verir:

1. **Ödevin isteği ve yapılanlar** — tablolar ve kod alıntılarıyla.
2. **Çalıştırma** — hangi komutun neyi ürettiği, hangi araçların kurulu olması gerektiği.
3. **Dürüstlük rehberi** — iddiaların kaynak koda ve zincir üstü API'lere karşı kontrolü.
   Ölçülmemiş sayıların "ölçüm" gibi sunulmasına burada izin verilmez.

Ödevleri değerlendirirken o klasörün **son bölümünü önce okuyun**.

## Görsel standartları

- Her ödevin kapağı `<ödev>/docs/cover.svg` içinde **elle yazılmış vektördür**; jenerik AI
  görseli kullanılmaz. Kapak, o ödevin gerçek sayılarını (dosya/satır/test/adres sayısı) taşır.
- Kapaktaki her sayı kaynak koddan doğrulanır; sayı değişirse kapak da güncellenir.
- Depo köküne sosyal önizleme gerekiyorsa Settings → Social preview ile verilir.

## Notlar

- 3 ve 4 numaralı ödevler **arayüz mühendisliği** çıktısıdır: ikisi de tarayıcıda çalışır, sunucusuzdur
  ve veri iddialarını kendisi etiketler (simülasyon/metrik ayrımı arayüzün içinde de yazılıdır).
- Kök `.gitignore` ortam dosyalarını (`.env`, `.env.*`, `*.pem`) dışarıda tutar.
- Bu depo, aynı yazarın [patika-dev-odevler](https://github.com/EnesBinMalik/patika-dev-odevler)
  arşivinin **backend** tarafını toplar; arşiv çatısının tamamı orada, 63 proje klasörünün
  haritası da oranın kök README'sindedir.
- Lisans: kaynak dosyaların başlığında `SPDX-License-Identifier: Apache-2.0` beyanı var; depo
  kök lisansı henüz eklenmedi.
