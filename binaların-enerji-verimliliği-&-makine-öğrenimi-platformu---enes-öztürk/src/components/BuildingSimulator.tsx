import React, { useState, useMemo } from 'react';
import { predictCustomBuilding } from '../utils/mlEngine';
import { generateGreenConsultingReport } from '../utils/greenConsulting';
import { 
  Building, Sun, Compass, Sparkles, Sliders, Leaf, Zap, Shield, 
  ArrowRight, Download, Printer, DollarSign, Award
} from 'lucide-react';

export const BuildingSimulator: React.FC = () => {
  // Configurable building parameters based on dataset ranges
  const [compactness, setCompactness] = useState<number>(0.79);
  const [surfaceArea, setSurfaceArea] = useState<number>(637.0);
  const [wallArea, setWallArea] = useState<number>(343.0);
  const [roofArea, setRoofArea] = useState<number>(147.0);
  const [height, setHeight] = useState<number>(7.0); // 3.5 or 7.0
  const [orientation, setOrientation] = useState<number>(4); // 2: North, 3: East, 4: South, 5: West
  const [glazing, setGlazing] = useState<number>(0.25); // 0.0, 0.10, 0.25, 0.40
  const [glazingDist, setGlazingDist] = useState<number>(4); // 1: Uniform, 2: North, 3: East, 4: South, 5: West

  // Predict loads using the ML regression model
  const predictedLoads = useMemo(() => {
    return predictCustomBuilding({
      relativeCompactness: compactness,
      surfaceArea,
      wallArea,
      roofArea,
      overallHeight: height,
      orientation,
      glazingArea: glazing,
      glazingAreaDistribution: glazingDist
    });
  }, [compactness, surfaceArea, wallArea, roofArea, height, orientation, glazing, glazingDist]);

  // Generate Green Building Audit Report
  const consultingReport = useMemo(() => {
    return generateGreenConsultingReport({
      surfaceArea,
      wallArea,
      roofArea,
      overallHeight: height,
      glazingArea: glazing,
      heatingLoad: predictedLoads.heatingLoad,
      coolingLoad: predictedLoads.coolingLoad
    });
  }, [surfaceArea, wallArea, roofArea, height, glazing, predictedLoads]);

  // Orientation metadata
  const orientationNames: Record<number, string> = {
    2: 'Kuzey (North)',
    3: 'Doğu (East)',
    4: 'Güney (South)',
    5: 'Batı (West)'
  };

  const distributionNames: Record<number, string> = {
    0: 'Yok (Penceresiz)',
    1: 'Homojen Dağılım',
    2: 'Kuzey Ağırlıklı',
    3: 'Doğu Ağırlıklı',
    4: 'Güney Ağırlıklı (Pasif Isınma)',
    5: 'Batı Ağırlıklı'
  };

  // Sun azimuth for 3D visualizer
  const sunAngles: Record<number, { x: number; y: number; label: string }> = {
    2: { x: 200, y: 40, label: 'Kuzey Işınımı (Düşük Isı Kazancı)' },
    3: { x: 330, y: 70, label: 'Sabah Doğu Güneşi' },
    4: { x: 200, y: 90, label: 'Maksimum Güney Işınımı (Kışın İdeal)' },
    5: { x: 70, y: 80, label: 'Öğleden Sonra Batı Güneşi (Yazın Isınma Riski)' }
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span>CANLI SİMÜLATÖR</span>
              <span aria-hidden="true">·</span>
              <span>Enes Öztürk Yeşil Danışmanlık Motoru</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Etkileşimli 3D Bina Enerji Simülatörü & Yeşil Danışmanlık
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Bina parametrelerini değiştirerek makine öğrenimi modelinin anlık tahminlerini, enerji kimlik belgesini (EPC) ve karbon ayak izi optimizasyonunu izleyin.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Raporu Yazdır / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace: Left Controls, Right 3D Visualizer & Quick Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders & Parameter Controls */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Bina Geometrisi & Parametreler
            </h3>
            <span className="text-xs text-slate-500 font-mono">8 Değişken</span>
          </div>

          {/* Height Switch (3.5m vs 7.0m) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">X5: Kat Yüksekliği (m)</span>
              <span className="font-mono font-bold text-slate-900">{height} m</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setHeight(3.5);
                  setRoofArea(220.5);
                  setWallArea(294.0);
                  setSurfaceArea(735.0);
                  setCompactness(0.69);
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  height === 3.5
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Tek Katlı (3.5m)
              </button>
              <button
                onClick={() => {
                  setHeight(7.0);
                  setRoofArea(147.0);
                  setWallArea(343.0);
                  setSurfaceArea(637.0);
                  setCompactness(0.79);
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  height === 7.0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                İki Katlı (7.0m)
              </button>
            </div>
          </div>

          {/* Relative Compactness */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">X1: Göreceli Kompaktlık (RC)</span>
              <span className="font-mono font-bold text-slate-900">{compactness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.62"
              max="0.98"
              step="0.02"
              value={compactness}
              onChange={(e) => setCompactness(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.62 (Yayvan / Geniş)</span>
              <span>0.98 (Küp Şeklinde / Kompakt)</span>
            </div>
          </div>

          {/* Glazing Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">X7: Cam Alanı Oranı</span>
              <span className="font-mono font-bold text-slate-900">%{(glazing * 100).toFixed(0)}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0.0, 0.10, 0.25, 0.40].map((g) => (
                <button
                  key={g}
                  onClick={() => setGlazing(g)}
                  className={`py-1.5 px-2 text-xs font-mono font-semibold rounded border cursor-pointer ${
                    glazing === g
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  %{(g * 100).toFixed(0)}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">X6: Ana Cephe Yönelimi</span>
              <span className="font-mono font-bold text-emerald-800">{orientationNames[orientation]}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { code: 2, label: 'Kuzey' },
                { code: 3, label: 'Doğu' },
                { code: 4, label: 'Güney' },
                { code: 5, label: 'Batı' }
              ].map((o) => (
                <button
                  key={o.code}
                  onClick={() => setOrientation(o.code)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded border cursor-pointer ${
                    orientation === o.code
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Glazing Distribution */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">X8: Cam Alanı Dağılımı</span>
              <span className="font-mono font-bold text-slate-900">{glazingDist}</span>
            </div>
            <select
              value={glazingDist}
              onChange={(e) => setGlazingDist(parseInt(e.target.value))}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
            >
              <option value="1">1: Homojen Dağılım (Tüm cepheler eşit)</option>
              <option value="2">2: Kuzey Ağırlıklı Dağılım</option>
              <option value="3">3: Doğu Ağırlıklı Dağılım</option>
              <option value="4">4: Güney Ağırlıklı Dağılım (Güneş Kazancı)</option>
              <option value="5">5: Batı Ağırlıklı Dağılım</option>
            </select>
          </div>

          {/* Envelope Area Readouts */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <div className="text-slate-400">Yüzey (X2)</div>
              <div className="font-bold text-slate-800">{surfaceArea} m²</div>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <div className="text-slate-400">Duvar (X3)</div>
              <div className="font-bold text-slate-800">{wallArea} m²</div>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <div className="text-slate-400">Çatı (X4)</div>
              <div className="font-bold text-slate-800">{roofArea} m²</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Perspective + Real-Time Prediction Output */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3D SVG Isometric Building Viewport */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-md relative overflow-hidden text-white">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">3D İzometrik Bina Modeli</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-amber-300">{sunAngles[orientation].label}</span>
              </div>
            </div>

            {/* Canvas SVG */}
            <div className="h-72 w-full flex items-center justify-center relative">
              <svg viewBox="0 0 500 280" className="w-full h-full">
                {/* Defs for gradients & patterns */}
                <defs>
                  {/* Sun glow */}
                  <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                  {/* Roof texture */}
                  <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  {/* Wall Left Gradient (Shaded) */}
                  <linearGradient id="wallLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={height === 7.0 ? '#0f766e' : '#047857'} />
                    <stop offset="100%" stopColor="#064e3b" />
                  </linearGradient>
                  {/* Wall Right Gradient (Sun-lit) */}
                  <linearGradient id="wallRight" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  {/* Solar Ray Gradient */}
                  <linearGradient id="solarRay" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Ground grid */}
                <ellipse cx="250" cy="230" rx="190" ry="45" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

                {/* Sun icon based on orientation */}
                <g transform={`translate(${sunAngles[orientation].x}, ${sunAngles[orientation].y})`}>
                  <circle cx="0" cy="0" r="24" fill="url(#sunGlow)" />
                  <circle cx="0" cy="0" r="10" fill="#fbbf24" />
                  {/* Ray to building */}
                  <line x1="0" y1="0" x2={250 - sunAngles[orientation].x} y2={140 - sunAngles[orientation].y} stroke="#fde047" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                </g>

                {/* Dynamic Isometric Box calculation */}
                {/* Building floor scaling based on height */}
                {(() => {
                  const bHeight = height === 7.0 ? 110 : 60;
                  const bWidth = 90 * (compactness / 0.79);
                  const baseY = 210;
                  const centerX = 250;

                  // Corner points
                  const frontX = centerX;
                  const frontY = baseY;
                  const leftX = centerX - bWidth;
                  const leftY = baseY - 45;
                  const rightX = centerX + bWidth;
                  const rightY = baseY - 45;
                  const backX = centerX;
                  const backY = baseY - 90;

                  return (
                    <g>
                      {/* Left Wall */}
                      <polygon
                        points={`${leftX},${leftY} ${frontX},${frontY} ${frontX},${frontY - bHeight} ${leftX},${leftY - bHeight}`}
                        fill="url(#wallLeft)"
                        stroke="#065f46"
                        strokeWidth="1.5"
                      />

                      {/* Right Wall */}
                      <polygon
                        points={`${frontX},${frontY} ${rightX},${rightY} ${rightX},${rightY - bHeight} ${frontX},${frontY - bHeight}`}
                        fill="url(#wallRight)"
                        stroke="#047857"
                        strokeWidth="1.5"
                      />

                      {/* Roof (with Solar Panels if Roof Area >= 140) */}
                      <polygon
                        points={`${frontX},${frontY - bHeight} ${rightX},${rightY - bHeight} ${backX},${backY - bHeight} ${leftX},${leftY - bHeight}`}
                        fill="url(#roofGrad)"
                        stroke="#475569"
                        strokeWidth="1.5"
                      />

                      {/* Roof Solar Panels Representation */}
                      <g transform={`translate(${centerX - 30}, ${frontY - bHeight - 25}) skewX(-25) skewY(10)`}>
                        <rect x="0" y="0" width="55" height="22" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
                        <line x1="18" y1="0" x2="18" y2="22" stroke="#93c5fd" strokeWidth="0.8" />
                        <line x1="36" y1="0" x2="36" y2="22" stroke="#93c5fd" strokeWidth="0.8" />
                        <line x1="0" y1="11" x2="55" y2="11" stroke="#93c5fd" strokeWidth="0.8" />
                      </g>

                      {/* Glazing / Windows on Right Wall */}
                      {glazing > 0 && (
                        <g>
                          {/* Story 1 Windows */}
                          <polygon
                            points={`${frontX + 15},${frontY - 10} ${frontX + 45},${frontY - 22} ${frontX + 45},${frontY - 42} ${frontX + 15},${frontY - 30}`}
                            fill="#38bdf8"
                            fillOpacity={glazing * 2.2}
                            stroke="#bae6fd"
                            strokeWidth="1"
                          />
                          <polygon
                            points={`${frontX + 52},${frontY - 25} ${rightX - 10},${rightY - 6} ${rightX - 10},${rightY - 26} ${frontX + 52},${frontY - 45}`}
                            fill="#38bdf8"
                            fillOpacity={glazing * 2.2}
                            stroke="#bae6fd"
                            strokeWidth="1"
                          />

                          {/* Story 2 Windows if Height is 7.0m */}
                          {height === 7.0 && (
                            <>
                              <polygon
                                points={`${frontX + 15},${frontY - 60} ${frontX + 45},${frontY - 72} ${frontX + 45},${frontY - 92} ${frontX + 15},${frontY - 80}`}
                                fill="#38bdf8"
                                fillOpacity={glazing * 2.2}
                                stroke="#bae6fd"
                                strokeWidth="1"
                              />
                              <polygon
                                points={`${frontX + 52},${frontY - 75} ${rightX - 10},${rightY - 56} ${rightX - 10},${rightY - 76} ${frontX + 52},${frontY - 95}`}
                                fill="#38bdf8"
                                fillOpacity={glazing * 2.2}
                                stroke="#bae6fd"
                                strokeWidth="1"
                              />
                            </>
                          )}
                        </g>
                      )}

                      {/* Compass marker on base */}
                      <text x="250" y="255" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                        [Cephe: {orientationNames[orientation]}] · [Kat: {height}m]
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Thermal Aura Overlay */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Güneş Işınımı Kazancı: <strong>%{glazing * 100} Cam Alanı</strong></span>
              </div>
              <div className="text-slate-300 font-mono text-[11px]">
                Çatı Solar Potansiyeli: <strong>{consultingReport.solarPvCapacityKw} kWp</strong>
              </div>
            </div>
          </div>

          {/* Model Live Prediction Banner */}
          <div className="grid grid-cols-2 gap-4">
            {/* Heating Load Card */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Hedef 1: Isıtma Yükü (Y1)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 text-amber-900 font-mono">
                  Isıtma Sezonu
                </span>
              </div>
              <div className="text-3xl font-extrabold text-amber-950 font-mono tabular-nums mt-2">
                {predictedLoads.heatingLoad} <span className="text-sm font-sans font-medium text-amber-800">kWh/m²</span>
              </div>
              <div className="text-xs text-amber-800/80 mt-1">
                Kışın oda konfor sıcaklığını 21°C'de tutmak için gereken birim ısıl güç.
              </div>
            </div>

            {/* Cooling Load Card */}
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Hedef 2: Soğutma Yükü (Y2)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200/80 text-indigo-900 font-mono">
                  Soğutma Sezonu
                </span>
              </div>
              <div className="text-3xl font-extrabold text-indigo-950 font-mono tabular-nums mt-2">
                {predictedLoads.coolingLoad} <span className="text-sm font-sans font-medium text-indigo-800">kWh/m²</span>
              </div>
              <div className="text-xs text-indigo-800/80 mt-1">
                Yazın aşırı ısınmayı önlemek ve 24°C'de tutmak için gereken klima yükü.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Green Building Consulting Audit & Carbon Footprint Report */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Leaf className="w-4 h-4" />
              <span>EKOLOJİK & ENERJİ DANIŞMANLIK DEĞERLENDİRMESİ</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Binanın Enerji Kimlik Belgesi (EPC) ve Karbon Salımı
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Enerji Sınıfı:</span>
            <div
              className="px-3.5 py-1.5 rounded-lg text-white font-mono font-bold text-base shadow-xs"
              style={{ backgroundColor: consultingReport.energyClassColor }}
            >
              {consultingReport.energyClass} SINIFI
            </div>
          </div>
        </div>

        {/* 4 Carbon & Energy KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Yıllık Enerji Yoğunluğu</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {consultingReport.totalEnergyIntensity} <span className="text-xs font-sans text-slate-500">kWh/m²/yıl</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Toplam taban: {consultingReport.floorArea} m²</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Yıllık Karbon Ayak İzi</div>
            <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums mt-1">
              {consultingReport.carbonFootprintTons} <span className="text-xs font-sans text-slate-500">ton CO₂e/yıl</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">0.44 kg CO₂e / kWh şebeke faktörü</div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <div className="text-xs text-emerald-800 font-medium">Çatı Solar PV Üretimi</div>
            <div className="text-2xl font-bold text-emerald-900 font-mono tabular-nums mt-1">
              {consultingReport.solarAnnualGenerationMWh} <span className="text-xs font-sans text-emerald-700">MWh/yıl</span>
            </div>
            <div className="text-xs text-emerald-700 mt-1">
              Kurulu güç: {consultingReport.solarPvCapacityKw} kWp (%{consultingReport.solarOffsetPercent} mahsup)
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <div className="text-xs text-emerald-800 font-medium">Yatırım Geri Dönüş Süresi</div>
            <div className="text-2xl font-bold text-emerald-900 font-mono tabular-nums mt-1">
              {consultingReport.paybackPeriodYears} <span className="text-xs font-sans text-emerald-700">Yıl</span>
            </div>
            <div className="text-xs text-emerald-700 mt-1">
              Yıllık tasarruf: ${consultingReport.estimatedAnnualCostSavingsUsd.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Actionable Engineering Recommendations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              Uygulanabilir Yeşil Mühendislik & İyileştirme Yol Haritası
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              Tahmini Karbon Düşüşü: <strong>%{consultingReport.potentialSavingsPercent}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultingReport.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 font-mono">
                    {rec.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    -{rec.carbonReductionTons} ton CO₂/yıl
                  </span>
                </div>

                <h5 className="text-sm font-bold text-slate-900">{rec.titleTr}</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {rec.descriptionTr}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium">
                  <strong>Uygulama Adımı:</strong> {rec.practicalActionTr}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono text-slate-500">
                  <span>Tahmini Maliyet: <strong>${rec.costEstimateUsd.toLocaleString()}</strong></span>
                  <span>Amortisman: <strong>{rec.paybackYears} yıl</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
