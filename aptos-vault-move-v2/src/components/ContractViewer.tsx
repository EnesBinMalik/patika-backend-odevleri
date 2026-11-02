import React, { useState } from 'react';
import { 
  UPGRADED_MOVE_CODE, 
  MOVE_TESTS_CODE, 
  MOVE_TOML_CODE, 
  LEGACY_MOVE_CODE 
} from '../data/moveContracts';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Code2, 
  BookOpen, 
  ShieldCheck 
} from 'lucide-react';

interface FileTab {
  id: string;
  name: string;
  lang: string;
  code: string;
  description: string;
}

export const ContractViewer: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<string>('vault.move');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const files: FileTab[] = [
    {
      id: 'vault.move',
      name: 'sources/vault.move',
      lang: 'move',
      code: UPGRADED_MOVE_CODE,
      description: 'Doğrudan vault_address alan, get_vault_address kaldırılmış ve transfer_admin bonus fonksiyonu içeren güncel Aptos sözleşmesi.'
    },
    {
      id: 'vault_tests.move',
      name: 'sources/vault_tests.move',
      lang: 'move',
      code: MOVE_TESTS_CODE,
      description: 'Tüm senaryoları kapsayan Aptos Move birim testleri (#[test_only]), beklenen hata kontrolleri ve bonus test vakası.'
    },
    {
      id: 'Move.toml',
      name: 'Move.toml',
      lang: 'toml',
      code: MOVE_TOML_CODE,
      description: 'AptosFramework bağımlılığı ve deploy edilen sözleşme ile yönetici adres tanımlamaları.'
    },
    {
      id: 'legacy_vault.move',
      name: 'sources/legacy_vault.move',
      lang: 'move',
      code: LEGACY_MOVE_CODE,
      description: 'Eski, get_vault_address fonksiyonu ile admin_address üzerinden arama yapan referans kod.'
    }
  ];

  const currentFile = files.find(f => f.id === activeTabId) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.id;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Split lines for display
  const lines = currentFile.code.split('\n');
  const filteredIndices = searchQuery.trim()
    ? lines
        .map((line, idx) => (line.toLowerCase().includes(searchQuery.toLowerCase()) ? idx : -1))
        .filter(idx => idx !== -1)
    : null;

  return (
    <div className="space-y-4">
      {/* Top File Selector and Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {files.map(file => {
              const isActive = file.id === activeTabId;
              return (
                <button
                  key={file.id}
                  onClick={() => {
                    setActiveTabId(file.id);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-cyan-950/70 border border-cyan-500/80 text-cyan-300 font-bold shadow-sm'
                      : 'bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Search within code */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Kodda ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-36 sm:w-48 font-mono"
              />
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0"
              title="Panoya Kopyala"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0"
              title="Dosyayı İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{currentFile.description}</span>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="text-slate-300 font-medium">{currentFile.name}</span>
            <span className="text-slate-500">·</span>
            <span>{lines.length} satır</span>
          </div>
          {searchQuery && (
            <span className="text-cyan-400">
              {filteredIndices ? `${filteredIndices.length} eşleşme bulundu` : ''}
            </span>
          )}
        </div>

        <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto text-xs font-mono leading-relaxed select-text">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isMatched = searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-900/40 transition-colors ${
                      isMatched ? 'bg-cyan-950/40' : ''
                    }`}
                  >
                    <td className="w-12 text-right pr-4 text-slate-600 select-none tabular-nums font-mono text-[11px]">
                      {lineNum}
                    </td>
                    <td className="text-slate-200 whitespace-pre">
                      {/* Simple Move Syntax Coloring */}
                      <MoveSyntaxHighlighter line={line} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Lightweight client-side syntax highlighter for Move & TOML
const MoveSyntaxHighlighter: React.FC<{ line: string }> = ({ line }) => {
  if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }
  if (line.trim().startsWith('#[')) {
    return <span className="text-amber-400 font-semibold">{line}</span>;
  }
  if (line.trim().startsWith('use ')) {
    return <span className="text-purple-400">{line}</span>;
  }
  if (line.includes('public entry fun') || line.includes('public fun') || line.includes('fun ')) {
    return (
      <span className="text-cyan-300 font-semibold">
        {line}
      </span>
    );
  }
  if (line.includes('struct ') || line.includes('module ')) {
    return <span className="text-emerald-400 font-semibold">{line}</span>;
  }
  if (line.includes('assert!')) {
    return <span className="text-amber-300">{line}</span>;
  }
  if (line.includes('const ')) {
    return <span className="text-indigo-300">{line}</span>;
  }
  return <span>{line}</span>;
};
