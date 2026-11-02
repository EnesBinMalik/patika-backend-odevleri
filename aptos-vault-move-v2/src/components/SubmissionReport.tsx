import React, { useState } from 'react';
import { SUBMISSION_REPORT } from '../data/reportData';
import { 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Award,
  Sparkles
} from 'lucide-react';

export const SubmissionReport: React.FC = () => {
  const [copiedMd, setCopiedMd] = useState<boolean>(false);

  const generateMarkdownReport = () => {
    return `# APTOS VAULT AKILLI SÖZLEŞMESİ: DOĞRUDAN KASA ADRESİ (vault_address) MİMARİSİ VE TESTNET DAĞITIM RAPORU

**Öğrenci / Geliştirici:** ${SUBMISSION_REPORT.author}  
**E-posta:** ${SUBMISSION_REPORT.email}  
**Tarih:** ${SUBMISSION_REPORT.date}  
**Ağ:** ${SUBMISSION_REPORT.network}  
**Dağıtılan Sözleşme Adresi:** \`${SUBMISSION_REPORT.deployedAddress}\`  
**Aptos Explorer:** ${SUBMISSION_REPORT.explorerUrl}  
**Derleyici:** ${SUBMISSION_REPORT.compilerVersion}  

---

## 1. Yönetici Özeti (Executive Summary)
${SUBMISSION_REPORT.summary}

---

## 2. Bölüm 1: Yapılan Kod Değişiklikleri ve Mimari Dönüşüm
${SUBMISSION_REPORT.codeModifications.map((m, i) => `### ${m.title}\n${m.detail}\n`).join('\n')}

---

## 3. Bölüm 2: Dağıtım ve Doğrulama
- **Dağıtılan Ağ:** ${SUBMISSION_REPORT.network}
- **Sözleşme Adresi (vault_addr):** \`${SUBMISSION_REPORT.deployedAddress}\`
- **Dağıtım Aracı:** Remix IDE + WELLDONE Wallet
- **Explorer Bağlantısı:** [Aptos Devnet Explorer](${SUBMISSION_REPORT.explorerUrl})

---

## 4. Test Vakaları ve Sonuç Matrisi
| Test ID | Test Adı | Açıklama | Beklenen Durum | Sonuç | Gaz Tüketimi |
|---|---|---|---|---|---|
${SUBMISSION_REPORT.tests.map(t => `| ${t.id} | ${t.name} | ${t.description} | ${t.expectedStatus} | ${t.result} | ${t.gasCost} |`).join('\n')}

> **Okuma notu:** altı test \`contracts/package/sources/tests/vault_tests.move\` içinde yazılıdır ve
> \`aptos move test\` ile çalıştırılabilir; 2 tanesi \`#[expected_failure]\` ile abort yollarını doğrular.
> Gaz sütunundaki değerler teslim raporu tahminleridir, profiler ölçümü değildir.
> Devnet dağıtım iddiası zincir üstünde doğrulanamadı (adresin modül listesi boş döndü).

---

## 5. Karşılaşılan Zorluklar ve Çözümler
${SUBMISSION_REPORT.challengesAndSolutions.map((c, i) => `### ${i + 1}. ${c.challenge}\n**Çözüm:** ${c.solution}\n`).join('\n')}

---

## 6. Bonus Görev: transfer_admin Fonksiyonu ve Güvenlik Modeli Analizi
**Fonksiyon İmzası:** \`${SUBMISSION_REPORT.bonusAnalysis.functionName}\`

${SUBMISSION_REPORT.bonusAnalysis.securityImpact}

---
**Raporu Hazırlayan ve İmzalayan:**  
**${SUBMISSION_REPORT.author}**  
*Aptos Move Akıllı Sözleşme Geliştiricisi*
`;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <span>RESMİ ÖDEV TESLİM BELGESİ</span>
            <span>·</span>
            <span>İMZALI TEKNİK RAPOR</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Aptos Vault v2 Ödev Teslim ve Değerlendirme Raporu
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ödev teslim şartlarına uygun olarak hazırlanmış eksiksiz teknik doküman.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMd ? 'Kopyalandı' : 'Markdown Kopyala'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazdır / PDF Kaydet</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Document Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 shadow-md text-slate-200 leading-relaxed max-w-4xl mx-auto print:bg-white print:text-black print:p-0 print:border-none">
        
        {/* Document Header & Signature Badge */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6 print:border-slate-300">
          <div className="space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider print:text-cyan-800">
              AKILLI SÖZLEŞME ÖDEV TESLİM FORMU
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight print:text-black">
              Aptos Vault Akıllı Sözleşmesi Refaktörü & Dağıtım Raporu
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 print:text-slate-600 pt-1">
              <span>Tarih: {SUBMISSION_REPORT.date}</span>
              <span>·</span>
              <span>Ağ: {SUBMISSION_REPORT.network}</span>
              <span>·</span>
              <span>Aptos Move 2 / Aptos CLI</span>
            </div>
          </div>

          {/* Student Signature Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 shrink-0 print:border-slate-300 print:bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 font-bold text-sm">
              EÖ
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Öğrenci / İmzacı</div>
              <div className="text-sm font-bold text-slate-100 font-sans print:text-black">
                {SUBMISSION_REPORT.author}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {SUBMISSION_REPORT.email}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 print:text-black">
            <span className="text-cyan-400">1.</span>
            <span>Yönetici Özeti (Executive Summary)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed whitespace-pre-line">
            {SUBMISSION_REPORT.summary}
          </p>
        </section>

        {/* Section 2: Code Modifications */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 print:text-black">
            <span className="text-cyan-400">2.</span>
            <span>Bölüm 1: Yapılan Mimari & Kod Değişiklikleri</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            {SUBMISSION_REPORT.codeModifications.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 print:bg-slate-50 print:border-slate-200"
              >
                <div className="font-bold text-slate-200 print:text-black mb-1">
                  {item.title}
                </div>
                <div className="text-slate-400 print:text-slate-700 text-xs leading-relaxed">
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Deployment Details */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 print:text-black">
            <span className="text-cyan-400">3.</span>
            <span>Bölüm 2: Dağıtım Detayları & Testnet Doğrulaması</span>
          </h2>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs font-mono print:bg-slate-50 print:border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-400">Sözleşme Adresi (vault_addr):</span>
              <span className="text-cyan-300 font-bold select-all break-all print:text-black">
                {SUBMISSION_REPORT.deployedAddress}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-400">Hedef Ağ:</span>
              <span className="text-emerald-400 font-semibold">{SUBMISSION_REPORT.network}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-400">Aptos Explorer Bağlantısı:</span>
              <a
                href={SUBMISSION_REPORT.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 underline flex items-center gap-1 print:text-blue-600"
              >
                <span>explorer.aptoslabs.com/...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* Section 4: Test Results Table */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 print:text-black">
            <span className="text-cyan-400">4.</span>
            <span>Test Vakaları ve Doğrulama Matrisi (6 test)</span>
          </h2>
          <div className="rounded-lg border border-amber-800/60 bg-amber-950/30 px-3 py-2 text-[11px] leading-relaxed text-amber-200 print:border-amber-300 print:text-amber-900">
            <strong className="font-bold">Okuma notu:</strong> altı test{' '}
            <code className="font-mono">contracts/package/sources/tests/vault_tests.move</code>{' '}
            dosyasında yazılıdır ve <code className="font-mono">aptos move test</code> ile çalıştırılabilir.
            Aşağıdaki gaz değerleri teslim raporuna yazılmış <em>tahminlerdir</em>; profiler çıktısı değildir.
            Devnet dağıtım iddiası bu depoda zincir üstü doğrulanamadı (adresin modül listesi boş) —
            ayrıntı depo README'sinin 11. bölümünde.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
              <thead className="bg-slate-950 text-slate-300 print:bg-slate-100 print:text-black">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Test Senaryosu</th>
                  <th className="p-3">Beklenen Durum</th>
                  <th className="p-3">Sonuç</th>
                  <th className="p-3">Gaz Tüketimi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {SUBMISSION_REPORT.tests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-950/40">
                    <td className="p-3 font-mono font-bold text-cyan-400">{test.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200 print:text-black">{test.name}</div>
                      <div className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">{test.description}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-300">
                      {test.expectedStatus === 'EXPECTED_ABORT' ? (
                        <span className="text-amber-400 font-semibold">ABORT (Kod {test.abortCode})</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">SUCCESS</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {test.result}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">{test.gasCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Challenges and Solutions */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 print:text-black">
            <span className="text-cyan-400">5.</span>
            <span>Karşılaşılan Zorluklar ve Çözüm Yaklaşımları</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            {SUBMISSION_REPORT.challengesAndSolutions.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 print:bg-slate-50 print:border-slate-200"
              >
                <div className="font-bold text-slate-200 print:text-black mb-1">
                  {idx + 1}. {item.challenge}
                </div>
                <div className="text-slate-400 print:text-slate-700 text-xs leading-relaxed">
                  <strong>Çözüm:</strong> {item.solution}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Bonus Security Model Analysis */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 print:text-black">
              <span className="text-purple-400">6.</span>
              <span>Bonus Görev: Kasa Sahipliğinin Devri & Güvenlik Analizi</span>
            </h2>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700/60 px-2 py-0.5 rounded">
              BONUS
            </span>
          </div>

          <div className="p-4 bg-purple-950/20 rounded-xl border border-purple-900/40 space-y-3 text-xs sm:text-sm text-slate-300 print:bg-slate-50 print:border-slate-300 print:text-slate-800 leading-relaxed">
            <div className="font-mono text-xs text-purple-300 font-bold bg-slate-950 p-2.5 rounded border border-purple-900/50">
              Fonksiyon İmzası: {SUBMISSION_REPORT.bonusAnalysis.functionName}
            </div>
            <div className="whitespace-pre-line text-xs text-slate-300 print:text-slate-700">
              {SUBMISSION_REPORT.bonusAnalysis.securityImpact}
            </div>
          </div>
        </section>

        {/* Document Footer Signature */}
        <div className="border-t border-slate-800 pt-8 mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:border-slate-300">
          <div>
            <div className="text-xs text-slate-400 print:text-slate-600">Ödevi Teslim Eden:</div>
            <div className="text-base font-bold text-slate-100 font-sans print:text-black">
              {SUBMISSION_REPORT.author}
            </div>
            <div className="text-xs text-cyan-400 font-mono mt-0.5">
              İmza Onayı: Verified Move Developer (Enes Öztürk)
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Aptos Vault v2 Refactor Submission</div>
            <div>Belge ID: APTOS-VAULT-2026-EÖ38</div>
          </div>
        </div>

      </div>
    </div>
  );
};
