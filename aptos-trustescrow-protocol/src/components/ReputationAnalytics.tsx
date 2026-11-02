import React from 'react';
import { Star, ShieldCheck, CheckCircle2, Award, ExternalLink, Activity } from 'lucide-react';
import { DEVELOPER_PROFILE, CONTRACTOR_PROFILES, CONTRACT_ADDRESS, EXPLORER_URL } from '../data/initialData';

export const ReputationAnalytics: React.FC = () => {
  const allProfiles = [DEVELOPER_PROFILE, ...CONTRACTOR_PROFILES];

  return (
    <div className="space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-teal-400" />
            <span>İtibar Panosu · Arayüz Verisi (zincir okuması yok)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            <code className="text-teal-300">reputation_registry.move</code> zincir üstü itibar yapısını tanımlar; buradaki sayılar ise modülden okunmayan, sabit arayüz verisidir.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Sözleşme Modülü: <span className="font-mono text-teal-400">trust_escrow::reputation_registry</span>
        </div>
      </div>

      {/* Featured Lead Architect Profile: Enes Öztürk */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <img
              src={DEVELOPER_PROFILE.avatar}
              alt={DEVELOPER_PROFILE.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-lg shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{DEVELOPER_PROFILE.name}</h3>
                <span className="text-[11px] font-semibold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/80">
                  Proje Sahibi & Sözleşme Mimarı
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {DEVELOPER_PROFILE.address}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
                {DEVELOPER_PROFILE.badges.map((badge, idx) => (
                  <span key={idx} className="text-slate-300">
                    {idx > 0 && <span className="text-slate-600 mr-2">·</span>}
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs sm:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-800 w-full md:w-auto justify-between md:justify-end">
            <div>
              <div className="text-slate-400">Tamamlanan Sözleşme</div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {DEVELOPER_PROFILE.completedContracts}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Toplam Hacim</div>
              <div className="text-xl font-bold font-mono text-teal-400 tabular-nums">
                {DEVELOPER_PROFILE.totalVolumeApt} APT
              </div>
            </div>
            <div>
              <div className="text-slate-400">Ortalama Puan</div>
              <div className="text-xl font-bold font-mono text-amber-400 flex items-center justify-end gap-1 tabular-nums">
                <Star className="w-4 h-4 fill-current" />
                <span>{DEVELOPER_PROFILE.rating.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Profiles Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Ağ Profili & Uzmanlık Etiketleri (demo veri)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allProfiles.map((profile) => (
            <div
              key={profile.address}
              className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{profile.name}</h4>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {profile.role === 'client' ? 'İşveren / Müşteri' : profile.role === 'contractor' ? 'Geliştirici / Yüklenici' : 'Bağımsız Hakem'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400 text-xs font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{profile.rating.toFixed(2)}</span>
                  <span className="text-slate-500 font-normal">({profile.reviewCount})</span>
                </div>
              </div>

              <div className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80 truncate">
                {profile.address}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-xs text-center">
                <div>
                  <div className="text-[10px] text-slate-500">Tamamlanan</div>
                  <div className="font-mono font-bold text-white tabular-nums">{profile.completedContracts} Kasa</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">İşlem Hacmi</div>
                  <div className="font-mono font-bold text-teal-400 tabular-nums">{profile.totalVolumeApt} APT</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Uyuşmazlık</div>
                  <div className="font-mono font-bold text-emerald-400 tabular-nums">%{profile.disputeRate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protocol Mechanism Explanation */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <span>Move Kaynak Korumalı İtibar Sistemi Nasıl Çalışır?</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Geleneksel web sitelerindeki itibar puanları silinebilir, manipüle edilebilir veya şirket veritabanlarında değiştirilebilir. Aptos TrustEscrow protokolünde ise her iş tamamlandığında <code className="text-teal-300">record_completion</code> fonksiyonu tetiklenir ve kullanıcının adresi altında yaşayan <code className="text-teal-300">ReputationProfile</code> Move kaynağı değişmez biçimde güncellenir.
        </p>
      </div>

    </div>
  );
};
