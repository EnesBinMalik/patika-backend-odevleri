import React, { useState } from 'react';
import { BookOpen, Check, Copy, ExternalLink, CheckCircle2, ShieldCheck, Terminal, Award } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER_URL } from '../data/initialData';

export const DocumentationViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-teal-400" />
            <span>Proje Raporu & Teknik Dokümantasyon</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aptos Blockchain Akıllı Sözleşme Final Projesi Şartnamesi ve Mimari Tanımı.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={EXPLORER_URL}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Aptos Testnet'te İncele</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Signature & Verification Box */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Geliştirici & Proje Sahibi:</span>
            <span className="text-teal-400 font-semibold">Enes Öztürk</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-mono">enesbino38@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Hedef Ağ:</span>
            <span className="text-teal-300 font-mono font-medium">Aptos Testnet</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Demo hesap adresi (dağıtılmamış):</span>
            <span className="font-mono text-teal-300">{CONTRACT_ADDRESS}</span>
          </div>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopyalandı' : 'Adresi Kopyala'}</span>
          </button>
        </div>
      </div>

      {/* Proje Kontrol Listesi Karşılama Tablosu */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          <span>Proje Kontrol Listesi & Karşılanma Durumu</span>
        </h3>

        <div className="space-y-3 text-xs">
          
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">1. Proje Konsepti</span>
              <span className="text-emerald-400 font-medium">Eksiksiz Tamamlandı</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Web3 serbest çalışanları ve hibe programları için merkeziyetsiz, kilometre taşı tabanlı ve hakem denetimli emanet protokolü tanımlandı.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">2. Akıllı Sözleşme (Aptos Move)</span>
              <span className="text-amber-400 font-medium">Yazıldı · bu depoda derlenmedi</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <code className="text-teal-300">trust_escrow.move</code> (488 satır) ve <code className="text-teal-300">reputation_registry.move</code> (112 satır) modülleri Move resource safety, AptosCoin kilitleme, çekim ve yetki kontrolleri ile yazıldı; ancak <code className="text-teal-300">aptos move compile</code> bu makinede çalıştırılmadı, dolayısıyla sözdizimi doğrulanmış sayılmaz.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">3. Yerel Testler (Move Testing)</span>
              <span className="text-amber-400 font-medium">Yazıldı · Bu depoda çalıştırılmadı</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <code className="text-teal-300">trust_escrow_tests.move</code> dosyasında <strong className="text-slate-200">2 test</strong> var: aşamalı oluştur‑onay‑serbest bırak ve hakem tahkimi. İptal/iade ve yetkisiz onay yolları ile itibar modülü için test <strong className="text-slate-200">yok</strong>; kapsama ölçülmedi. Sonuçları görmek için <code className="text-teal-300">npm run test:move</code> gerekir.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">4. Aptos Dağıtımı & Testnet Adresi</span>
              <span className="text-rose-400 font-medium">Bu depoda doğrulanamadı</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <code className="text-teal-300">0x9f4a8b7c2518e3d647a508b9c6f2e8d3b57a1e0c4f839a672e519bd746203c15</code> adresi <code className="text-slate-300">contracts/Move.toml</code> ve arayüzde bir <strong className="text-slate-200">named address sabitidir</strong>. Arşivde derleme çıktısı, publish işlem izi veya doğrulanmış explorer kaydı yok; yayının gerçekten yapılıp yapılmadığı bu depodan çıkarılamaz.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">5. Kapsamlı README & Enes Öztürk İmzası</span>
              <span className="text-emerald-400 font-medium">Eksiksiz Tamamlandı</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Proje kök dizinindeki <code className="text-teal-300">README.md</code> dosyası mimariyi, sözleşme yüzeyini, derleme/test komutlarını ve hangi iddiaların doğrulanamadığını belgeler.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">6. İnteraktif Web3 DApp Ön Yüzü</span>
              <span className="text-emerald-400 font-medium">Eksiksiz Tamamlandı</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              React + Tailwind CSS ile yazılmış arayüz: rol değiştirilebilir simüle cüzdan, testnet musluk isteği, gerçek Move kaynaklarını gösteren kod görüntüleyici ve animasyonlu test paneli. Yaşam döngüsü işlemleri zincire gitmez, React durumunda çalışır.
            </p>
          </div>

        </div>
      </div>

      {/* Move Architecture Deep Dive */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <span>Move Dili ve Kaynak Güvenliği İlkeleri</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            EVM (Ethereum Virtual Machine) akıllı sözleşmelerinde fonlar genellikle basit bir harita (mapping) içerisindeki sayısal değerlerdir ve reentrancy saldırılarına veya taşma/taşmama açıklarına maruz kalabilir.
          </p>
          <p>
            Aptos Move mimarisinde ise <code className="text-teal-300">Coin&lt;AptosCoin&gt;</code> gerçek bir lineer tiptir:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Kopyalanamaz (cannot be duplicated).</li>
            <li>İmha edilmeden veya aktarılmadan havada bırakılamaz (cannot be dropped without explicit burn).</li>
            <li>Yalnızca yetkilendirilmiş <code className="text-slate-300">&signer</code> tarafından harcanabilir.</li>
          </ul>
        </div>
      </div>

    </div>
  );
};
