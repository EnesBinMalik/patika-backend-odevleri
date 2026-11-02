<div align="center">

# Patika Backend Ödevleri

[Patika](https://patika.dev) backend yolculuğundaki ödev ve projelerin **depo kökü**.
Her ödev kendi klasöründe; blokzincir, GraphQL, Node ve mimari refaktör işleri burada toplanır.

[![Ödev](https://img.shields.io/badge/ödev-1-22D3EE?style=flat-square)](#içerik)
[![Diller](https://img.shields.io/badge/Move_2_+_TypeScript-A78BFA?style=flat-square)](#içerik)
[![Özel görsel](https://img.shields.io/badge/her_ödev-özel_kapak-FBBF24?style=flat-square)](#görsel-standartları)
[![Durum](https://img.shields.io/badge/yerel-onay_bekleniyor-64748B?style=flat-square)](#nasıl-okunur)

</div>

---

## İçerik

| # | Ders / Teknoloji | Ödev | Ne içeriyor | Durum |
|---|---|---|---|---|
| 1 | **Aptos · Move 2** | [Aptos Vault Move v2 — Doğrudan Kasa Adresi Mimarisi & Test Portalı](aptos-vault-move-v2/README.md) | `vault_address` refaktörü, 311 satır sözleşme, 6 birim test, `transfer_admin` bonusu, React 19 portalı ve üretilmiş gerçek Move paketi | ✅ tamamlandı · ⚠️ gaz/devnet iddiaları [§11](aptos-vault-move-v2/README.md#11-dürüstlük-rehberi-kod-mu-vitrin-mi)'de dürüstçe sınırlanmıştır |

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

- Kök `.gitignore` ortam dosyalarını (`.env`, `.env.*`, `*.pem`) dışarıda tutar.
- Bu depo, aynı yazarın [patika-dev-odevler](https://github.com/EnesBinMalik/patika-dev-odevler)
  arşivinin **backend** tarafını toplar; arşiv çatısının tamamı orada, 63 proje klasörünün
  haritası da oranın kök README'sindedir.
- Lisans: kaynak dosyaların başlığında `SPDX-License-Identifier: Apache-2.0` beyanı var; depo
  kök lisansı henüz eklenmedi.
