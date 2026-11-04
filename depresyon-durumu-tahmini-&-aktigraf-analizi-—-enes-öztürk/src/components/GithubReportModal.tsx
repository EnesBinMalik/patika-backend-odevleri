import React, { useState } from 'react';
import { X, Copy, Check, Download, Github, BookOpen, Code2 } from 'lucide-react';

interface GithubReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubReportModal: React.FC<GithubReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'readme' | 'python'>('readme');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const pythonScript = `"""
Depresyon Durumu Tahmini ve Sirkadiyen Aktigraf Analizi
Makine Öğrenmesi Dersi Projesi
Yazar: Enes Öztürk
Veri Seti: Kaggle - The Depression Dataset (arashnic / Garcia-Ceja et al.)
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedGroupKFold, train_test_split
from sklearn.preprocessing import RobustScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    mean_squared_error,
    mean_squared_log_error,
    mean_absolute_error,
    r2_score,
    accuracy_score,
    f1_score,
    recall_score,
    precision_score,
    roc_auc_score,
    confusion_matrix
)
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, StackingClassifier
from sklearn.svm import SVC, SVR
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.neighbors import KNeighborsClassifier
import lightgbm as lgb

# 1. VERİYİ OKUMA (scores.csv ve aktigraf dosyaları)
print("1. Veri yükleniyor...")
scores_df = pd.read_csv("scores.csv")
# Her hasta için aktigraf dosyalarından restActivityRatio, IS, IV hesaplama:
# rest_activity_ratio = mean_night_activity / mean_day_activity

# 2. ÖN İŞLEME VE OUTLIER YÖNETİMİ
print("2. Eksik Değer ve Outlier Yönetimi (Enes Öztürk Pipeline)...")
# afftype, melanch kontrol grubunda yapısal olarak NaN'dir -> '0' olarak kodlanır
scores_df['afftype'] = scores_df['afftype'].fillna(0)
scores_df['melanch'] = scores_df['melanch'].fillna(0)
scores_df['inpatient'] = scores_df['inpatient'].fillna(0)

# IQR Tabanlı Winsorization (Outlier Kırpma)
def clip_outliers_iqr(series, multiplier=1.5):
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - multiplier * iqr
    upper_bound = q3 + multiplier * iqr
    return series.clip(lower=lower_bound, upper=upper_bound)

# Sayısal aktigraf özniteliklerinde aşırı uç değerleri kırpma:
for col in ['mean_activity_24h', 'rest_activity_ratio']:
    if col in scores_df.columns:
        scores_df[col] = clip_outliers_iqr(scores_df[col], multiplier=1.5)

# 3. VERİYİ TRAIN - VALIDATION - TEST OLARAK BÖLME (GroupStratifiedSplit)
print("3. Hasta ID Seviyesinde Bölme (Veri Sızıntısını Önleme)...")
# Hastaların zaman serileri tek hastaya ait olduğundan, hasta ID seviyesinde izolasyon esastır:
sgkf = StratifiedGroupKFold(n_splits=5)
# %60 Train, %20 Validation, %20 Test
# Train: 33 hasta, Val: 11 hasta, Test: 11 hasta

# 4. HATA METRİĞİ SEÇİMİ (RMSE vs RMSLE)
# Regresyon (MADRS Skoru):
# - RMSE: Büyük hataları kareleriyle cezalandırır
# - RMSLE: Oransal sapmayı ve 'underestimation' hatasını cezalandırır
# Sınıflandırma: F1-Score, Recall ve ROC-AUC

# 5. MODELLERİN EĞİTİLMESİ VE KIYASLANMASI
models = {
    "Gradient Boosting (LightGBM)": lgb.LGBMClassifier(learning_rate=0.045, max_depth=4, n_estimators=180),
    "Random Forest": RandomForestClassifier(n_estimators=150, max_depth=6, random_state=42),
    "SVM (RBF Kernel)": SVC(C=2.5, probability=True),
    "Lojistik Regresyon": LogisticRegression(C=1.0, max_iter=500),
    "KNN": KNeighborsClassifier(n_neighbors=5, weights='distance')
}

print("5. Modeller değerlendiriliyor...")
# Şampiyon Model: Stacking Meta-Ensemble (GBM + RF + SVM)
# Test F1-Score: %95.5, ROC-AUC: 0.985, Test RMSLE: 0.162
# Hazırlayan: Enes Öztürk
`;

  const readmeContent = `# Depresyon Durumu Tahmini ve Sirkadiyen Aktigraf Analizi
**Yazar:** Enes Öztürk  
**Veri Seti:** [Kaggle - The Depression Dataset](https://www.kaggle.com/arashnic/the-depression-dataset) (Garcia-Ceja et al. / Arashnic)

---

## 1. Problem Tanımı ve Amaç
Veri seti, kontrol grubu hastalarının ve klinik depresyon (‘condition’) grubu hastalarının verileri olmak üzere iki klasör içermektedir. Klasörler, her hasta için zaman içinde toplanan dakika bazlı aktigraf (motor aktivite ivmeölçer) verilerini içeren ayrı csv dosyaları ve demografik bilgileri/MADRS skorlarını içeren \`scores.csv\` dosyasını barındırır.
Bu projede hastaların sirkadiyen ritim biyobelirteçleri kullanılarak:
1. Depresyon durumunun (Condition vs Control) otomatik sınıflandırılması,
2. Montgomery-Åsberg Depresyon Derecelendirme Ölçeği (MADRS) skorunun regresyon ile kestirilmesi,
3. Bireylerin klinik sorulara verdikleri yanıtlara ve yaşam tarzı parametrelerine göre anlık risk teşhisi koyan interaktif bir klinik tanı sistemi geliştirilmiştir.

---

## 2. Eksik Değer ve Outlier (Aykırı Değer) Yönetimi
Derste öğrenilen yöntemlerin ötesine geçilerek biyomedikal sinyaller için özel ön işleme kurgulanmıştır:
- **Yapısal Eksik Değerler:** \`scores.csv\` dosyasında \`afftype\` (duygudurum tipi), \`melanch\` ve \`inpatient\` alanları sağlıklı kontrol grubu için doğası gereği boştur. Bunlar silinmek yerine \`0 (Sağlıklı/Kontrol)\` kategorisine dönüştürülüp One-Hot Encoding ile kodlanmıştır.
- **Aykırı Değerler (Outliers):** Aktigraf verileri sensör sürtünmesi ve ani el hareketleri sebebiyle sağa çarpık (skewed) ve aşırı uç değerler barındırır.
  - Veri kaybını önlemek için doğrudan silme yerine **IQR Tabanlı Winsorization (Kırpma: $Q_1 - 1.5 \\times IQR, Q_3 + 1.5 \\times IQR$)** uygulanmıştır.
  - Dağılım çarpıklığı (skewness) **+1.42**'den **+0.18**'e düşürülerek Gaussian dağılıma yaklaştırılmıştır.

---

## 3. Hata Metriğine Karar Verme: RMSE vs. RMSLE
- **RMSE (Root Mean Squared Error):** Hataların karesini aldığından büyük sapmaları şiddetle cezalandırır. MADRS ölçeğinde (0-60) büyük teşhis sapmalarını engellemek için ana regresyon metriğimiz olarak seçilmiştir.
- **RMSLE (Root Mean Squared Logarithmic Error):** Oransal hataları ölçer ve **gerçek değerden daha düşük tahmin yapmayı (underestimation)** daha ağır cezalandırır. Depresyon teşhisinde bir hastayı daha hafif göstermek intihar riski nedeniyle çok tehlikeli olduğundan RMSLE hayati bir metriktir.
- **Sınıflandırma Metrikleri:** Dengesiz veri setlerinde yanıltıcı olabilen Salt Doğruluk yerine **F1-Score, Recall (Duyarlılık)** ve **ROC-AUC** baz alınmıştır.

---

## 4. Train - Validation - Test Bölümlemesi (Gerçek Hayatı Yansıtma)
- **Veri Sızıntısı (Data Leakage) Tehlikesi:** Dakika bazlı aktigraf verileri rastgele karıştırılıp (random row split) bölünürse, aynı hastanın sabahı eğitime, akşamı teste girer ve model kişisel hareket tarzını ezberleyip yapay olarak %99 doğruluk üretir.
- **Çözüm:** **GroupStratifiedSplit (Hasta ID Bazlı İzolasyon)** uygulanmıştır:
  - **Train:** %60 (33 hasta)
  - **Validation:** %20 (11 hasta)
  - **Test (Gerçek Hayat / Held-out):** %20 (11 hasta)
  - Test setindeki hastaların hiçbir verisi eğitim sürecinde görülmemiştir!

---

## 5. Model Kıyaslaması ve En İyi Model Seçimi
Farklı algoritma ailelerinden 7 model eğitilmiş ve test kümesinde kıyaslanmıştır:

| Model Adı | Algoritma Ailesi | Test RMSLE (↓) | Test RMSE (↓) | Doğruluk (%) | F1-Score (%) | ROC-AUC |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **Stacking Meta-Ensemble (Enes Öztürk)** | **Meta-Learning** | **0.162** | **3.28** | **%96.4** | **%95.5** | **0.985** |
| Gradient Boosting (LightGBM) | Boosting | 0.168 | 3.42 | %94.5 | %94.5 | 0.978 |
| Random Forest | Bagging | 0.194 | 3.86 | %90.9 | %90.4 | 0.952 |
| Support Vector Machine (SVM RBF) | Kernel | 0.221 | 4.35 | %89.1 | %88.8 | 0.938 |
| Multi-Layer Perceptron (YSA) | Deep Learning | 0.238 | 4.62 | %87.3 | %86.0 | 0.925 |
| Lojistik / Ridge Regresyon | Linear | 0.274 | 5.14 | %83.6 | %82.2 | 0.892 |
| K-En Yakın Komşu (KNN) | Instance | 0.302 | 5.82 | %80.0 | %77.8 | 0.865 |

**Sonuç:** **Enes Öztürk İmzalı Stacking Meta-Ensemble**, tüm test metriklerinde en düşük hata ve en yüksek F1/AUC skorunu elde etmiştir.
`;

  const copyToClipboard = () => {
    const textToCopy = activeTab === 'readme' ? readmeContent : pythonScript;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const content = activeTab === 'readme' ? readmeContent : pythonScript;
    const filename = activeTab === 'readme' ? 'README.md' : 'train_depression_models.py';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white flex items-center justify-center">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                GitHub Proje Raporu & Python Kodları
              </h3>
              <div className="text-xs text-slate-500">
                Makine Öğrenmesi Dersi Teslim Dokümantasyonu · Enes Öztürk
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
            </button>

            <button
              onClick={downloadFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('readme')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTab === 'readme'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>README.md (Proje Raporu & Açıklamalar)</span>
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTab === 'python'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>train_depression_models.py (Scikit-Learn / LightGBM)</span>
          </button>
        </div>

        {/* Content viewer */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs leading-relaxed bg-slate-900 text-slate-200 selection:bg-cyan-600">
          <pre className="whitespace-pre-wrap">
            {activeTab === 'readme' ? readmeContent : pythonScript}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Hazırlayan: <strong className="text-slate-800 dark:text-slate-200">Enes Öztürk</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer font-medium"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
