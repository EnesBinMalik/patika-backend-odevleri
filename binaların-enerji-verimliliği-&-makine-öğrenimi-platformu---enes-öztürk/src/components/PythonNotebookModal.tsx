import React, { useState } from 'react';
import { generatePythonScript } from '../utils/codeExporter';
import { X, Copy, Check, Download, FileCode, ExternalLink } from 'lucide-react';

interface PythonNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonNotebookModal: React.FC<PythonNotebookModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [targetType, setTargetType] = useState<'heating' | 'cooling'>('heating');

  if (!isOpen) return null;

  const scriptCode = generatePythonScript(targetType);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bina_enerji_verimliligi_enes_ozturk_${targetType}.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Python & Scikit-Learn Kaynak Kodu (Jupyter / Colab)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Enes Öztürk İmzalı · Kaggle Energy Efficiency Proje Reposu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg p-0.5 bg-slate-200 text-xs font-semibold mr-2">
              <button
                onClick={() => setTargetType('heating')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  targetType === 'heating' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Isıtma Yükü (Y1)
              </button>
              <button
                onClick={() => setTargetType('cooling')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  targetType === 'cooling' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Soğutma Yükü (Y2)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs text-emerald-300 leading-relaxed">
          <pre className="whitespace-pre-wrap">{scriptCode}</pre>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Gereksinimler:</span>
            <span>numpy, pandas, scikit-learn, matplotlib, seaborn</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kodu Kopyala</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.py Dosyasını İndir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
