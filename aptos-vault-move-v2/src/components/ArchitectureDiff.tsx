import React, { useState } from 'react';
import { ARCHITECTURE_DIFF_POINTS, DiffPoint } from '../data/moveContracts';
import { 
  ArrowRight, 
  Check, 
  Copy, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Sparkles,
  Cpu
} from 'lucide-react';

export const ArchitectureDiff: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const currentDiff = ARCHITECTURE_DIFF_POINTS.find(p => p.step === selectedStep) || ARCHITECTURE_DIFF_POINTS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <span>BÖLÜM 1: KOD DEĞİŞİKLİĞİ & MİMARİ DÖNÜŞÜM</span>
              <span>·</span>
              <span>ÖDEV ANALİZİ</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Eski (Legacy) vs. Yeni (v2 Doğrudan Kasa Adresi) Mimari Kıyaslaması
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Ödevde talep edilen 4 temel refaktör adımının kod seviyesindeki karşılıkları, bellek erişim farkları ve Aptos gaz tasarrufları aşağıda adım adım interaktif olarak incelenebilir.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-right">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Depolama Okuması</div>
              <div className="text-sm font-bold text-emerald-300 font-mono">2 → 1 adıma indi</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-right">
              <div className="text-[10px] text-cyan-400 font-bold uppercase">Erişim Karmaşıklığı</div>
              <div className="text-sm font-bold text-cyan-300 font-mono">O(1) Direct Borrow</div>
            </div>
          </div>
        </div>

        {/* Step Selector Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-6">
          {ARCHITECTURE_DIFF_POINTS.map((diff) => {
            const isActive = selectedStep === diff.step;
            return (
              <button
                key={diff.step}
                onClick={() => setSelectedStep(diff.step)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-cyan-950/50 border-cyan-500/80 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                    Adım {diff.step}
                  </span>
                  {isActive && <span className="text-[10px] text-cyan-300 bg-cyan-900/60 px-1.5 py-0.5 rounded">Aktif</span>}
                </div>
                <div className="text-xs font-medium text-slate-200 line-clamp-2">
                  {diff.title.replace(`${diff.step}. `, '')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Code Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>{currentDiff.title}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {currentDiff.explanation}
          </p>
        </div>

        {/* Code Diff Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Legacy Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Mevcut Eski Uygulama (Türetilmiş Kasa Adresi)
              </span>
              <button
                onClick={() => handleCopy(currentDiff.legacyCode, 'legacy')}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                {copiedCode === 'legacy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Kopyala</span>
              </button>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 border border-rose-950/70 overflow-x-auto text-xs font-mono leading-relaxed text-slate-300 relative group">
              <pre className="text-rose-200/90">{currentDiff.legacyCode}</pre>
            </div>
            <div className="text-[11px] text-rose-400/90 bg-rose-950/20 border border-rose-900/30 rounded-lg p-2.5">
              ⚠️ <strong>Sorun:</strong> Global depolamada iki aşamalı lookup gerektirir; admin adresine sıkı sıkıya bağlıdır.
            </div>
          </div>

          {/* Upgraded Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Güncellenmiş v2 Mimarisi (Doğrudan vault_address)
              </span>
              <button
                onClick={() => handleCopy(currentDiff.upgradedCode, 'upgraded')}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                {copiedCode === 'upgraded' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Kopyala</span>
              </button>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 border border-emerald-950/70 overflow-x-auto text-xs font-mono leading-relaxed text-slate-300 relative group">
              <pre className="text-emerald-300/95">{currentDiff.upgradedCode}</pre>
            </div>
            <div className="text-[11px] text-emerald-400/90 bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-2.5">
              ✅ <strong>Kazanım:</strong> {currentDiff.benefit}
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Technical Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>1. Gaz & Bellek Verimliliği</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eski kodda her işlemde önce <code className="text-cyan-300">borrow_global&lt;VaultSignerCapability&gt;(admin_address)</code> çağrılarak signer capability alınıyor, oradan <code className="text-cyan-300">get_signer_capability_address</code> ile kasa adresi hesaplanıyordu. Yeni mimaride doğrudan <code className="text-cyan-300">borrow_global_mut&lt;Vault&gt;(vault_address)</code> yapılarak gereksiz ara adım iptal edildi.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>2. Çoklu Kasa & Bağımsız Kimlik</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eski yapıda bir admin adresi yalnızca TEK BİR kasaya sahip olabiliyordu, çünkü <code className="text-indigo-300">VaultSignerCapability</code> admin adresinde tekildir. Yeni mimaride kasa bağımsız bir adrestir; tek bir yönetici veya çoklu imzalı (multi-sig) cüzdan dilediği kadar kasayı yönetebilir.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Güvenli Mülkiyet Devri (Bonus)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eski mimaride kasa adresi admin adresine bağlı olduğu için kasanın yönetimini devretmek imkansızdı. Doğrudan <code className="text-amber-300">vault_address</code> mimarisi sayesinde <code className="text-amber-300">transfer_admin</code> fonksiyonu eklenerek fon taşımaksızın kasa sahipliği güvenle aktarılabilir hale getirildi.
          </p>
        </div>
      </div>
    </div>
  );
};
