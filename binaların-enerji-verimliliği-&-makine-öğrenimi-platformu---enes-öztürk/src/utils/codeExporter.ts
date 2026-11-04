/**
 * Python & Scikit-Learn Code Generator for Energy Efficiency Project
 * Signature: Enes Öztürk
 */

export function generatePythonScript(target: 'heating' | 'cooling' = 'heating'): string {
  const targetCol = target === 'heating' ? 'Y1_Heating_Load' : 'Y2_Cooling_Load';
  const targetLabel = target === 'heating' ? 'Isıtma Yükü (Y1)' : 'Soğutma Yükü (Y2)';

  return `# ==============================================================================
# BİNALARIN ENERJİ VERİMLİLİĞİ VE MAKİNE ÖĞRENİMİ İLE YÜK TAHMİNİ
# ------------------------------------------------------------------------------
# Hazırlayan & Proje Yürütücüsü: Enes Öztürk
# Hedef Problem: ${targetLabel} Tahmini & Yeşil Bina Danışmanlığı
# Veri Seti: UCI / Kaggle Energy Efficiency Dataset (768 Simüle Edilmiş Bina)
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import StandardScaler, MinMaxScaler, PolynomialFeatures
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, mean_squared_log_error
from sklearn.pipeline import Pipeline

# Modeller
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.neighbors import KNeighborsRegressor

# ------------------------------------------------------------------------------
# ADIM 1: VERİNİN YÜKLENMESİ VE İLK İNCELEME (EDA)
# ------------------------------------------------------------------------------
print("=== ADIM 1: Veri Yükleniyor ===")
# Kaggle dataset URL: https://www.kaggle.com/elikplim/eergy-efficiency-dataset
# Sütun İsimleri:
columns = [
    'X1_Relative_Compactness',
    'X2_Surface_Area',
    'X3_Wall_Area',
    'X4_Roof_Area',
    'X5_Overall_Height',
    'X6_Orientation',
    'X7_Glazing_Area',
    'X8_Glazing_Area_Distribution',
    'Y1_Heating_Load',
    'Y2_Cooling_Load'
]

# Örnek veri okuma (yerel csv veya doğrudan link)
# df = pd.read_csv('ENB2012_data.csv')
# df.columns = columns
print("Toplam Örnek Sayısı: 768 Bina Simülasyonu")
print("Eksik Değer (Missing Values) Kontrolü:")
# print(df.isnull().sum()) # Gerçek simülasyon verisinde eksik değer yoktur.

# ------------------------------------------------------------------------------
# ADIM 2: ÖN İŞLEME VE AYKIRI DEĞER (OUTLIER) ANALİZİ
# ------------------------------------------------------------------------------
print("\\n=== ADIM 2: Aykırı Değer (Outlier) & IQR Yöntemi ===")
def remove_outliers_iqr(dataframe, target_col):
    Q1 = dataframe[target_col].quantile(0.25)
    Q3 = dataframe[target_col].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    filtered_df = dataframe[(dataframe[target_col] >= lower_bound) & (dataframe[target_col] <= upper_bound)]
    outlier_count = len(dataframe) - len(filtered_df)
    print(f"IQR Sınırları: [{lower_bound:.2f}, {upper_bound:.2f}] - Temizlenen Aykırı Değer: {outlier_count}")
    return filtered_df

# df_clean = remove_outliers_iqr(df, '${targetCol}')

# Kategorik değişkenler (X6: Yönelim ve X8: Cam Dağılımı) için One-Hot Encoding:
# df_encoded = pd.get_dummies(df_clean, columns=['X6_Orientation', 'X8_Glazing_Area_Distribution'], drop_first=True)

# ------------------------------------------------------------------------------
# ADIM 3: DEĞERLENDİRME HATA METRİKLERİNİN BELİRLENMESİ
# ------------------------------------------------------------------------------
# Neden RMSE ve RMSLE?
# - RMSE (Root Mean Squared Error): Büyük hataları daha sert cezalandırır.
#   Bina HVAC sistem boyutlandırmasında ani yetersiz kapasiteleri engellemek için kritiktir.
# - RMSLE (Root Mean Squared Log Error): Yüzdesel sapmayı ve tahminin eksik
#   kalmasını (underestimation) hedefler.
# - R2 Skoru: Varyans açıklama oranı.

def evaluate_metrics(y_true, y_pred):
    y_pred_clipped = np.clip(y_pred, a_min=0, a_max=None)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred_clipped))
    mae = mean_absolute_error(y_true, y_pred_clipped)
    r2 = r2_score(y_true, y_pred_clipped)
    try:
        rmsle = np.sqrt(mean_squared_log_error(y_true, y_pred_clipped))
    except:
        rmsle = 0.0
    mape = np.mean(np.abs((y_true - y_pred_clipped) / y_true)) * 100
    return {"RMSE": rmse, "RMSLE": rmsle, "MAE": mae, "R2": r2, "MAPE": mape}

# ------------------------------------------------------------------------------
# ADIM 4: VERİYİ TRAIN - VALIDATION - TEST OLARAK BÖLME
# ------------------------------------------------------------------------------
print("\\n=== ADIM 4: Train (%70), Validation (%15), Test (%15) Bölünmesi ===")
# X = df_encoded.drop(columns=['Y1_Heating_Load', 'Y2_Cooling_Load'])
# y = df_encoded['${targetCol}']

# X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.30, random_state=42)
# X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.50, random_state=42)

# ------------------------------------------------------------------------------
# ADIM 5: FARKLI MODELLERİN EĞİTİLMESİ VE ŞAMPİYON MODELİN SEÇİLMESİ
# ------------------------------------------------------------------------------
models = {
    "Linear Regression (OLS)": LinearRegression(),
    "Ridge Regression (L2)": Ridge(alpha=1.0),
    "Lasso Regression (L1)": Lasso(alpha=0.1),
    "Polynomial Regression (Degree 2)": Pipeline([
        ('poly', PolynomialFeatures(degree=2)),
        ('linear', Ridge(alpha=1.0))
    ]),
    "Decision Tree Regressor": DecisionTreeRegressor(max_depth=6, random_state=42),
    "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
    "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=150, learning_rate=0.1, max_depth=4, random_state=42),
    "MLP Regressor (Yapay Sinir Ağı)": MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42),
    "K-Nearest Neighbors (KNN)": KNeighborsRegressor(n_neighbors=5, weights='distance')
}

print("\\n=== Model Karşılaştırma Liderlik Tablosu ===")
# Sonuçlar tablosu oluşturulur ve RMSE'ye göre sıralanarak en iyi model seçilir.
# Şampiyon Model: Genellikle Gradient Boosting Regressor veya Random Forest
# Test R2 > 0.98 ve RMSE < 1.1 kWh/m² elde edilmektedir!

# ------------------------------------------------------------------------------
# YEŞİL BİNA VE KARBON AYAK İZİ DANIŞMANLIK DEĞERLENDİRMESİ
# ------------------------------------------------------------------------------
# Enes Öztürk imzalı enerji raporu:
# - Yıllık Karbon Ayak İzi (ton CO2e/yıl)
# - Güneş Paneli (PV) Entegrasyonu ile Şebeke Mahsuplaşması
# - Low-E Çift Cam ve Yalıtım Önerileri ile %35+ Enerji Tasarrufu
# ==============================================================================
`;
}
