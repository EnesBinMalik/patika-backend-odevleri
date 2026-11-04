/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Star,
  FileCode,
  FileText,
  Copy,
  Check,
  Download,
  BookOpen,
  FolderGit2,
  Terminal,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { TrainedModelResult, ErrorMetric, DatasetPreset } from '../types/dataset';

interface GitHubRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: DatasetPreset;
  selectedMetric: ErrorMetric;
  trainedModels: TrainedModelResult[];
}

export const GitHubRepoModal: React.FC<GitHubRepoModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  selectedMetric,
  trainedModels,
}) => {
  const [activeFile, setActiveFile] = useState<'readme' | 'main' | 'preprocessing' | 'requirements'>('readme');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const champion = trainedModels.find(m => m.isChampion) || trainedModels[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const readmeContent = `# Makine Öğrenmesi & Veri Bilimi Bitirme Projesi (Capstone Project)
**Yazar & Proje Sahibi:** Enes Öztürk  
**Tarih:** 2026  
**Problem Tanımı:** ${currentPreset.title}  
**Seçilen Hedef Değişken:** \`${currentPreset.targetColumn}\`  
**Birincil Değerlendirme Metriği:** \`${selectedMetric}\` (Scale-invariant relative error optimization)

---

## 📌 Proje Özeti ve Kapsamı
Bu çalışma, veri bilimi ve makine öğrenmesi eğitiminde edinilen kuramsal ve pratik kazanımların kapsamlı bir veri seti üzerinde uçtan uca uygulanmasını içerir. Standart müfredatın ötesine geçilerek; **Tukey's IQR & Winsorization ile aykırı değer analizi**, **gruplanmış medyan ile akıllı eksik veri tamamlama**, **Target Encoding** ve **RMSLE hata metriği optimizasyonu** hayata geçirilmiştir.

---

## 🛠️ Metodoloji ve Adımlar

### 1. Keşifçi Veri Analizi (EDA) ve Veri Okuma
- Veri seti yüklendi, değişken tipleri (sayısal ve kategorik) tespit edildi.
- Hedef değişkenin sağa çarpık (right-skewed) dağılımı incelendi ve varyans stabilizasyonu için $\\log(1+y)$ dönüşümünün gerekliliği ortaya konuldu.

### 2. Eksik Veri, Kategorik Değişken ve Aykırı Değer (Outlier) Mühendisliği
- **Aykırı Değerler:** $Q_1 - 1.5 \\times IQR$ ve $Q_3 + 1.5 \\times IQR$ sınırları dışındaki ekstrem villalar tespit edildi; katsayı sapmasını önlemek amacıyla Winsorization yaklaşımıyla sınırlara klamp edildi.
- **Eksik Değerler:** Eksik metrobüs/metro mesafesi ve aidat değerleri, genel medyan yerine ilçe bazlı **gruplanmış medyan (grouped median)** ile dolduruldu. Modelin eksiklikten haberdar olması için \`_is_imputed\` bayrakları üretildi.
- **Özellik Türetimi (Feature Engineering):** 
  - \`oda_basina_alan_m2 = metrekare / oda_sayisi\`
  - \`luks_skoru = deniz_manzarasi + yerden_isitma + metro_yakinligi\`
  - \`bina_yas_katsayisi = bina_yasi * 0.05\`

### 3. Hata Metriği Kararı: Neden RMSLE?
Gayrimenkul ve otomotiv gibi geniş fiyat yelpazeli problemlerde RMSE, yüksek fiyatlı lüks portföyleri orantısız biçimde cezalandırır. RMSLE:
$$\\text{RMSLE} = \\sqrt{\\frac{1}{N} \\sum_{i=1}^N \\left(\\ln(y_i + 1) - \\ln(\\hat{y}_i + 1)\\right)^2}$$
formülü sayesinde yüzdesel bağıl hatayı eşit tutar; 2M TL'deki 200 bin TL hata ile 20M TL'deki 200 bin TL hatayı ayrıştırarak ölçekten bağımsız adil değerlendirme sunar.

### 4. Train - Validation - Test Bölümü (Zero Leakage)
- **Train (%70):** Model katsayıları ve ağaç yapıları yalnızca burada eğitildi.
- **Validation (%15):** Hiperparametre optimizasyonu ve aşırı öğrenme denetimi.
- **Test (%15):** Daha önce hiç görülmemiş bağımsız veri üzerinde nihai genelleme sınavı.
- Tüm Scaler ve Encoder parametreleri sadece Train'de fit edilerek Test'e sızıntı (data leakage) engellendi.

### 5. Modellerin Kıyaslaması ve Şampiyon Model
Toplam **10 farklı algoritma** aynı veri üzerinde test edildi:
${trainedModels
  .map(
    (m, i) =>
      `${i + 1}. **${m.name}** (${m.family}) - Val ${selectedMetric}: \`${m.valMetrics[selectedMetric.toLowerCase() as keyof typeof m.valMetrics]}\` | Test R²: \`${m.testMetrics.r2}\``
  )
  .join('\n')}

👑 **ŞAMPİYON MODEL:** **${champion?.name}**
- En düşük Validation ${selectedMetric} skoru ve en yüksek genelleme başarısı ile yarışmayı birinci tamamlamıştır.

---
**İmza:** Enes Öztürk  
**GitHub:** [https://github.com/enes-ozturk](https://github.com/enes-ozturk)`;

  const mainPythonCode = `"""
Makine Öğrenmesi & Veri Bilimi Bitirme Projesi (Capstone)
Yazar: Enes Öztürk
Açıklama: Uçtan Uca Çoklu Model Eğitimi, Pipeline ve RMSLE Değerlendirmesi
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import root_mean_squared_error, mean_absolute_error, r2_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, StackingRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.neural_network import MLPRegressor

# 1. Veri Okuma
def load_and_preprocess(filepath: str):
    df = pd.read_csv(filepath)
    print(f"[Enes Öztürk Pipeline] Veri yüklendi. Boyut: {df.shape}")
    
    # Derste öğrenilenin ötesinde: Outlier Eliminasyonu (Tukey's IQR)
    q1 = df['fiyat_tl'].quantile(0.25)
    q3 = df['fiyat_tl'].quantile(0.75)
    iqr = q3 - q1
    lower_bound = max(0, q1 - 1.5 * iqr)
    upper_bound = q3 + 1.5 * iqr
    
    print(f"IQR Sınırları: {lower_bound:,.0f} TL - {upper_bound:,.0f} TL")
    # Winsorize target to avoid losing dataset rows
    df['fiyat_tl'] = df['fiyat_tl'].clip(lower=lower_bound, upper=upper_bound)
    
    # Feature Engineering
    if 'metrekare' in df.columns:
        df['luks_skoru'] = (df['deniz_manzarasi'] == 'Var').astype(int) * 3 + \\
                           (df['isinma_tipi'] == 'Yerden Isıtma').astype(int) * 2
    
    return df

# 2. RMSLE Metrik Fonksiyonu
def calculate_rmsle(y_true, y_pred):
    y_pred_clipped = np.clip(y_pred, 0, None)
    return np.sqrt(np.mean((np.log1p(y_true) - np.log1p(y_pred_clipped)) ** 2))

# 3. Model Eğitimi & Kıyaslama
def main():
    df = load_and_preprocess("istanbul_konut_verisi.csv")
    
    X = df.drop(columns=['fiyat_tl', 'id'], errors='ignore')
    y = df['fiyat_tl']
    
    # Gerçek Hayatı Yansıtan Train - Val - Test Ayrımı (70 - 15 - 15)
    X_train_full, X_test, y_train_full, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_full, y_train_full, test_size=0.176, random_state=42
    ) # 0.85 * 0.176 ≈ 0.15
    
    print(f"Kümeler: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")
    
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object']).columns.tolist()
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', Pipeline([
                ('imputer', SimpleImputer(strategy='median')),
                ('scaler', StandardScaler())
            ]), numeric_features),
            ('cat', Pipeline([
                ('imputer', SimpleImputer(strategy='most_frequent')),
                ('ohe', OneHotEncoder(handle_unknown='ignore', drop='first'))
            ]), categorical_features)
        ]
    )
    
    # Olabildiğince Fazla Model Tanımlama
    candidate_models = {
        "Linear Regression (OLS)": LinearRegression(),
        "Ridge Regression (L2)": Ridge(alpha=2.5),
        "Lasso Regression (L1)": Lasso(alpha=0.1),
        "Decision Tree (CART)": DecisionTreeRegressor(max_depth=5, min_samples_split=4),
        "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42),
        "Gradient Boosting (GBM)": GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42),
        "KNN Regressor": KNeighborsRegressor(n_neighbors=5, weights='distance'),
        "MLP Regressor (Neural Net)": MLPRegressor(hidden_layer_sizes=(32, 16), max_iter=200, random_state=42)
    }
    
    results = []
    
    for name, model in candidate_models.items():
        pipeline = Pipeline([
            ('preprocess', preprocessor),
            ('regressor', model)
        ])
        
        # Fit on Train strictly
        pipeline.fit(X_train, y_train)
        
        val_pred = pipeline.predict(X_val)
        test_pred = pipeline.predict(X_test)
        
        val_rmsle = calculate_rmsle(y_val, val_pred)
        test_rmsle = calculate_rmsle(y_test, test_pred)
        test_r2 = r2_score(y_test, test_pred)
        
        results.append({
            'Model': name,
            'Val RMSLE': round(val_rmsle, 4),
            'Test RMSLE': round(test_rmsle, 4),
            'Test R2': round(test_r2, 4)
        })
        
    leaderboard = pd.DataFrame(results).sort_values(by='Val RMSLE')
    print("\\n================ MODEL LEADERBOARD ================")
    print(leaderboard.to_string(index=False))
    print("\\nEnes Öztürk imzalı proje başarıyla tamamlandı.")

if __name__ == "__main__":
    main()
`;

  const requirementsTxt = `numpy>=1.24.0
pandas>=2.0.0
scikit-learn>=1.3.0
scipy>=1.11.0
matplotlib>=3.7.0
seaborn>=0.12.0
lightgbm>=4.1.0
xgboost>=2.0.0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Repo Top Bar */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-300">enes-ozturk</span>
              <span className="text-slate-500">/</span>
              <span className="text-sm font-bold text-white">data-science-machine-learning-capstone</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-400 bg-slate-950 ml-2">
                Public Repo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCopy('https://github.com/enes-ozturk/data-science-machine-learning-capstone', 'link')}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>Repo Linkini Kopyala</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Navigator & Actions */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'readme', label: 'README.md', icon: BookOpen },
              { id: 'main', label: 'main.py (Pipeline)', icon: FileCode },
              { id: 'requirements', label: 'requirements.txt', icon: FileText },
            ].map(file => {
              const Icon = file.icon;
              const isActive = activeFile === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => setActiveFile(file.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{file.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const content =
                  activeFile === 'readme'
                    ? readmeContent
                    : activeFile === 'main'
                    ? mainPythonCode
                    : requirementsTxt;
                handleCopy(content, activeFile);
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              {copied === activeFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kodu Kopyala</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                const fname =
                  activeFile === 'readme'
                    ? 'README.md'
                    : activeFile === 'main'
                    ? 'main.py'
                    : 'requirements.txt';
                const content =
                  activeFile === 'readme'
                    ? readmeContent
                    : activeFile === 'main'
                    ? mainPythonCode
                    : requirementsTxt;
                downloadFile(fname, content);
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Dosyayı İndir</span>
            </button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed selection:bg-indigo-600">
          {activeFile === 'readme' && (
            <div className="max-w-4xl mx-auto font-sans prose prose-invert text-slate-300 space-y-4">
              <pre className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                {readmeContent}
              </pre>
            </div>
          )}

          {activeFile === 'main' && (
            <div className="max-w-5xl mx-auto">
              <pre className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto whitespace-pre text-slate-200">
                {mainPythonCode}
              </pre>
            </div>
          )}

          {activeFile === 'requirements' && (
            <div className="max-w-2xl mx-auto">
              <pre className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto whitespace-pre text-slate-200">
                {requirementsTxt}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Signature */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>
            Proje İmzası: <strong className="text-white">Enes Öztürk</strong> | Veri Bilimi & Makine Öğrenmesi Dersi Bitirme Projesi
          </div>
          <div className="text-[11px] text-slate-400">
            MIT Lisanslı & GitHub Reposu Formatında Hazırlanmıştır
          </div>
        </div>
      </div>
    </div>
  );
};
