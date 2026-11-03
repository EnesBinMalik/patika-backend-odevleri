/**
 * @license
 * Copyright 2026 Enes Öztürk — tüm hakları saklıdır
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { soundFx } from '../services/soundFx';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  ShieldAlert, 
  Tag,
  Sparkles,
  Lock
} from 'lucide-react';

export interface NeuralNote {
  id: string;
  title: string;
  content: string;
  category: 'INTEL' | 'CORE' | 'LOG' | 'ENCRYPTED';
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  isEncrypted?: boolean;
}

const DEFAULT_NOTES: NeuralNote[] = [
  {
    id: 'note-1',
    title: 'AuraSync // Gerçek ve Kurgu Sınırı',
    content: 'Bu arayüzde gerçek olan: navigator.getBattery() okuması, deviceorientation eğimi, localStorage kalıcılığı, Web Audio osilatör sesleri ve requestAnimationFrame canvas animasyonu. Kurgu olan: terminal sync/decrypt çıktıları, throughput/latency rakamları, "quantum kernel" marka ifadeleri.',
    category: 'CORE',
    priority: 'HIGH',
    timestamp: '2026-11-03 04:15:00',
  },
  {
    id: 'note-2',
    title: 'Enes Öztürk Tasarım Direktifi',
    content: 'Glassmorphism katmanları obsidian #05050a tabanında, neon cyan #00f3ff ve emerald #00ff66 vurgusuyla kurulur. 3D eğim 15 derece altında sönümlenir; mobil dokunma hedefleri 44px altına inmez.',
    category: 'INTEL',
    priority: 'CRITICAL',
    timestamp: '2026-11-03 04:10:22',
  },
  {
    id: 'note-3',
    title: 'Veri Akışı Kaydı',
    content: 'Uygulama sunucuya veri göndermez: fetch, WebSocket veya EventSource yok. Tek dış kaynak Google Fonts yazı tipleridir. Notlar ve ses tercihi tarayıcının localStorage alanında düz metin olarak tutulur — gerçek şifreleme uygulanmaz.',
    category: 'LOG',
    priority: 'NORMAL',
    timestamp: '2026-11-03 03:55:10',
  }
];

export const NeuralNotes: React.FC = () => {
  const [notes, setNotes] = useState<NeuralNote[]>(() => {
    try {
      const saved = localStorage.getItem('aurasync_neural_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved notes', e);
    }
    return DEFAULT_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Note modal/form state
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'INTEL' | 'CORE' | 'LOG' | 'ENCRYPTED'>('INTEL');
  const [newPriority, setNewPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('aurasync_neural_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to write notes to localStorage', e);
    }
  }, [notes]);

  const handleSelectNote = (id: string) => {
    soundFx.play('click');
    setActiveNoteId(id);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    soundFx.play('success');
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const created: NeuralNote = {
      id: 'note-' + Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      priority: newPriority,
      timestamp: timeStr,
      isEncrypted: newCategory === 'ENCRYPTED',
    };

    setNotes([created, ...notes]);
    setActiveNoteId(created.id);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.play('alert');
    const filtered = notes.filter(n => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0]?.id || '');
    }
  };

  const handleCopyNote = async (content: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      soundFx.play('chirp');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard fallback
    }
  };

  const handleResetDefaults = () => {
    soundFx.play('toggle');
    setNotes(DEFAULT_NOTES);
    setActiveNoteId(DEFAULT_NOTES[0].id);
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="cyber-glass rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00f3ff]" />
          <h2 className="font-orbitron text-sm font-bold tracking-wider text-slate-100 uppercase">
            Neural Notes // Memo Pad
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-tech text-slate-400" title="localStorage aurasync_neural_notes — düz metin, gerçek şifreleme yok">
            {notes.length} kayıt (localStorage)
          </span>
          <button
            onClick={() => {
              soundFx.play('click');
              setIsAdding(!isAdding);
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#00f3ff]/20 text-[#00f3ff] hover:bg-[#00f3ff]/30 border border-[#00f3ff]/40 transition-all shadow-[0_0_12px_rgba(0,243,255,0.2)]"
            title="Create New Neural Memo"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search neural memos..."
            className="w-full bg-black/40 border border-cyan-500/20 focus:border-[#00f3ff] rounded-xl pl-9 pr-3 py-2 text-xs font-mono-tech text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {['ALL', 'INTEL', 'CORE', 'LOG', 'ENCRYPTED'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundFx.play('click');
                setCategoryFilter(cat);
              }}
              className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-mono-tech whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50'
                  : 'bg-black/30 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* New Note Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddNote}
          className="bg-black/60 border border-[#00f3ff]/40 rounded-xl p-3 flex flex-col gap-3 shadow-[0_0_20px_rgba(0,243,255,0.15)] animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-orbitron font-semibold text-[#00f3ff]">
              + INJECT NEW NEURAL MEMO
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1"
            >
              Cancel
            </button>
          </div>

          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Memo Title (e.g., Cyber Grid Node 7)"
            className="bg-black/40 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs font-mono-tech text-white placeholder-slate-500 focus:outline-none focus:border-[#00f3ff]"
          />

          <textarea
            required
            rows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Memo içeriği (tarayıcıda düz metin olarak saklanır)..."
            className="bg-black/40 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs font-mono-tech text-white placeholder-slate-500 focus:outline-none focus:border-[#00f3ff] resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="bg-black/80 border border-cyan-500/30 text-slate-200 text-xs font-mono-tech rounded-lg px-2 py-1.5 focus:outline-none"
              >
                <option value="INTEL">INTEL</option>
                <option value="CORE">CORE</option>
                <option value="LOG">LOG</option>
                <option value="ENCRYPTED">ENCRYPTED</option>
              </select>

              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="bg-black/80 border border-cyan-500/30 text-slate-200 text-xs font-mono-tech rounded-lg px-2 py-1.5 focus:outline-none"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 bg-[#00f3ff] hover:bg-[#00d0dc] text-black font-orbitron font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all"
            >
              SAVE MEMO
            </button>
          </div>
        </form>
      )}

      {/* Notes List & Active Viewer */}
      {filteredNotes.length === 0 ? (
        <div className="p-6 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-cyan-500/20 rounded-xl">
          <p className="text-xs font-mono-tech text-slate-400">No neural memos found.</p>
          <button
            onClick={handleResetDefaults}
            className="text-xs font-mono-tech text-[#00f3ff] hover:underline"
          >
            Restore Default Intel Notes
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto no-scrollbar pr-1">
          {filteredNotes.map((note) => {
            const isActive = note.id === activeNoteId;
            return (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-black/50 border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.25)] ring-1 ring-[#00f3ff]/40'
                    : 'bg-black/25 border-cyan-500/15 hover:border-cyan-500/35 hover:bg-black/40'
                }`}
              >
                {/* Note metadata row */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono-tech">
                    <span className="text-[#00f3ff] font-bold">[{note.category}]</span>
                    <span className="text-slate-500">·</span>
                    <span className={note.priority === 'CRITICAL' ? 'text-rose-400 font-bold' : note.priority === 'HIGH' ? 'text-amber-400' : 'text-slate-400'}>
                      {note.priority}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-500">{note.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {note.isEncrypted && (
                      <span
                        className="min-h-[36px] flex items-center px-1.5 rounded-lg text-amber-400"
                        title="Yalnızca etiket: içerik localStorage düz metninde durur, şifrelenmez"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <button
                      onClick={(e) => handleCopyNote(note.content, note.id, e)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Copy memo text"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Purge memo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Title */}
                <h3 className="font-orbitron text-xs font-bold text-slate-100 tracking-wide mb-1">
                  {note.title}
                </h3>

                {/* Note Content preview */}
                <p className="text-xs font-mono-tech text-slate-300 line-clamp-2 leading-relaxed">
                  {note.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
