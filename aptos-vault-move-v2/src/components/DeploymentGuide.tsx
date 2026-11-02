import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  Wallet, 
  Globe, 
  Cpu, 
  ShieldAlert, 
  Play, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { SUBMISSION_REPORT } from '../data/reportData';

export const DeploymentGuide: React.FC = () => {
  const [copiedAddr, setCopiedAddr] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(SUBMISSION_REPORT.deployedAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const toggleStep = (stepNum: number) => {
    setCompletedSteps(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  return (
    <div className="space-y-6">
      {/* Verified Deployed Address Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/50 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>APTOS DEVNET / TESTNET DAĞITIMI TAMAMLANDI</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Dağıtılan Akıllı Sözleşme Adresi & Explorer Doğrulaması
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Değiştirilmiş v2 Vault sözleşmesi Remix IDE ve WELLDONE Cüzdanı vasıtasıyla derlenip Aptos Devnet ağına konuşlandırılmıştır.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Adresi Kopyala</span>
            </button>

            <a
              href={SUBMISSION_REPORT.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
            >
              <span>Aptos Explorer'da İncele</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Address Display */}
        <div className="mt-4 p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs">
          <div className="truncate pr-2">
            <span className="text-slate-400">Sözleşme Adresi (vault_addr): </span>
            <span className="text-cyan-300 font-semibold select-all break-all">
              {SUBMISSION_REPORT.deployedAddress}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded shrink-0">
            Ağ: {SUBMISSION_REPORT.network}
          </span>
        </div>
      </div>

      {/* Remix IDE & WELLDONE Wallet Walkthrough */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>Remix IDE ve WELLDONE Wallet ile Dağıtım Adımları</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Ödev talimatlarına uygun olarak Remix IDE ve WELLDONE cüzdanı kullanılarak sözleşmenin derlenmesi ve dağıtılması rehberi:
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700/80 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </span>
            <div className="space-y-1.5 text-xs text-slate-300 flex-1">
              <div className="font-bold text-slate-100 text-sm">WELLDONE Cüzdanının ve Ağın Hazırlanması</div>
              <p className="text-slate-400 leading-relaxed">
                Chrome Web Mağazası'ndan <strong>WELLDONE Wallet</strong> eklentisini kurun. Ağ listesinden <strong>Aptos Devnet</strong> veya <strong>Testnet</strong> ağını seçin. Cüzdandaki "Faucet" butonuna tıklayarak test için gerekli olan APT jetonlarını hesabınıza aktarın.
              </p>
              <div className="font-mono text-[11px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800">
                WELLDONE Adresi: 0xca5f1897c8d32b56e409391b48d641b65e71881822b3f17c8f25875965416209
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700/80 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </span>
            <div className="space-y-1.5 text-xs text-slate-300 flex-1">
              <div className="font-bold text-slate-100 text-sm">Remix IDE ve WELLDONE Eklentisinin Etkinleştirilmesi</div>
              <p className="text-slate-400 leading-relaxed">
                <a href="https://remix.ethereum.org" target="_blank" rel="noreferrer" className="text-cyan-400 underline">remix.ethereum.org</a> adresini açın. Sol menüdeki "Plugin Manager" sekmesine giderek <strong>WELLDONE Code</strong> eklentisini arayın ve "Activate" butonuna tıklayın. Açılan panelde zincir olarak <strong>Aptos</strong> seçin.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700/80 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </span>
            <div className="space-y-1.5 text-xs text-slate-300 flex-1">
              <div className="font-bold text-slate-100 text-sm">Move.toml ve Sözleşme Dosyalarının Oluşturulması</div>
              <p className="text-slate-400 leading-relaxed">
                Remix dosya gezgininde yeni bir çalışma alanı açın. <code className="text-cyan-300">Move.toml</code> dosyasını ekleyin ve <code className="text-cyan-300">sources/vault.move</code> dosyasını oluşturup güncellenmiş sözleşme kodunu yapıştırın. <code className="text-cyan-300">Move.toml</code> içindeki <code className="text-cyan-300">vault_addr</code> değişkenini cüzdan adresinizle eşleyin.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700/80 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              4
            </span>
            <div className="space-y-1.5 text-xs text-slate-300 flex-1">
              <div className="font-bold text-slate-100 text-sm">Derleme (Compile) ve Dağıtım (Deploy)</div>
              <p className="text-slate-400 leading-relaxed">
                WELLDONE eklenti panelinde <strong>"Compile"</strong> butonuna basın. Derleme başarılı olduğunda <strong>"Deploy"</strong> butonuna tıklayın. WELLDONE Cüzdan onay penceresinde işlemi imzalayın. Konsolda dağıtılan sözleşme adresi görüntülenecektir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Aptos CLI Commands */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <span>Aptos CLI Komut Satırı ile Derleme ve Test</span>
        </h3>
        <p className="text-xs text-slate-400">
          Geliştiricilerin yerel ortamda çalıştırmak isteyebileceği Aptos CLI komutları:
        </p>

        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-slate-500">// 1. Projeyi derleme</div>
          <div className="text-cyan-300">aptos move compile --named-addresses vault_addr=default</div>
          <div className="text-slate-500 pt-2">// 2. Tüm birim testlerini ve hata iddialarını çalıştırma</div>
          <div className="text-emerald-300">aptos move test</div>
          <div className="text-slate-500 pt-2">// 3. Aptos Testnet ağına sözleşmeyi yükleme</div>
          <div className="text-amber-300">aptos move publish --named-addresses vault_addr=default</div>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Ödev Test Kontrol Listesi & Doğrulama Durumu (6/6 Tamamlandı)</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            Tüm Testler Başarılı
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SUBMISSION_REPORT.tests.map((test, idx) => (
            <div
              key={test.id}
              onClick={() => toggleStep(idx + 1)}
              className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start gap-3 cursor-pointer"
            >
              <div className="text-emerald-400 mt-0.5">
                {completedSteps[idx + 1] ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="text-xs space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-200">{test.name}</span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded shrink-0">
                    {test.result}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {test.description}
                </p>
                <div className="text-[10px] text-cyan-400/90 font-mono">
                  Gaz Tüketimi: {test.gasCost}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
