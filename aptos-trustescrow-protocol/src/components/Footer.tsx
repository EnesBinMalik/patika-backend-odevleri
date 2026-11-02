import React from 'react';
import { ShieldCheck, ExternalLink, Github, Mail } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER_URL } from '../data/initialData';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white tracking-tight">Aptos TrustEscrow Protocol</div>
              <div className="text-[11px] text-slate-400">
                Aptos Move Akıllı Sözleşmesi & Merkeziyetsiz Emanet Protokolü
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-xs">
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Aptos Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="mailto:enesbino38@gmail.com"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>enesbino38@gmail.com</span>
            </a>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            Geliştirici & Proje Sahibi: <strong className="text-slate-300 font-medium">Enes Öztürk</strong>
          </div>
          <div>
            Demo hesap adresi (dağıtılmamış): <code className="text-slate-400 font-mono">{CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}</code>
          </div>
        </div>
      </div>
    </footer>
  );
};
