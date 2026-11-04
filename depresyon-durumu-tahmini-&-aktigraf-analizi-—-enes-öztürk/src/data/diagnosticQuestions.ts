import { DiagnosticQuestion } from '../types/depression';

/**
 * Validated Clinical Diagnostic Questions
 * Based on Montgomery-Åsberg Depression Rating Scale (MADRS) & PHQ-9 & Actigraph sleep-wake criteria.
 * Curated for Depression State Estimation by Enes Öztürk.
 */
export const CLINICAL_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'q1_mood',
    category: 'mood',
    text: '1. Son iki haftada kendinizi ne sıklıkla kederli, karamsar veya çökkün hissettiniz?',
    subtext: 'İçsel keder, nedensiz üzüntü hissi ve neşelenememe durumu (MADRS Madde 1-2).',
    options: [
      { label: 'Hemen hemen hiç', score: 0, description: 'Normal duygudurum, geçici üzüntüler kolay atlatılıyor.' },
      { label: 'Birkaç gün (Hafif)', score: 1, description: 'Zaman zaman iç sıkıntısı, ancak dikkat dağıtılabiliyor.' },
      { label: 'Günlerin yarısından fazlasında', score: 2, description: 'Belirgin keder hissi, neşelenmekte güçlük.' },
      { label: 'Neredeyse her gün ve sürekli', score: 3, description: 'Derin, sürekli ve dindirilemeyen karamsarlık ve acı.' },
    ],
  },
  {
    id: 'q2_anhedonia',
    category: 'mood',
    text: '2. Normalde zevk aldığınız aktivitelere veya hobilerinize karşı ilginizde azalma var mı?',
    subtext: 'Anhedoni (zevk alamama), sosyal geri çekilme ve isteksizlik (PHQ-9 Madde 1).',
    options: [
      { label: 'Hayır, ilgim ve aldığım zevk normal', score: 0, description: 'Aktivitelere istekli ve keyifle katılım.' },
      { label: 'Hafif azalma var', score: 1, description: 'Eskiye nazaran biraz daha az tatmin edici.' },
      { label: 'Belirgin ilgi kaybı', score: 2, description: 'Çoğu şeye karşı ilgisizlik, isteksizce yapma.' },
      { label: 'Tamamen zevk alamama (Hiçbir şeyden tat almıyorum)', score: 3, description: 'Tam anhedoni, hiçbir şey keyif vermiyor.' },
    ],
  },
  {
    id: 'q3_sleep_latency',
    category: 'sleep',
    text: '3. Gece uykuya dalma süreniz ve gece uyanmalarınız nasıl seyrediyor?',
    subtext: 'Aktigraf verilerinde görülen sirkadiyen uyku parçalanması ve insomnia (MADRS Madde 4).',
    options: [
      { label: 'Normal (15-25 dk içinde deliksiz uyku)', score: 0, description: 'Sağlıklı sirkadiyen uyku döngüsü.' },
      { label: 'Hafif güçlük (30-45 dk dalma süresi)', score: 1, description: 'Bazen geciken uyku veya 1 kez uyanma.' },
      { label: 'Orta düzeyde uykusuzluk (1 saatten uzun, sık bölünme)', score: 2, description: 'Gece boyunca 2-3 kez huzursuz uyanış.' },
      { label: 'Şiddetli uykusuzluk / Sabah 04:00 erken uyanma', score: 3, description: 'Gece boyunca motor huzursuzluk, erken uyanıp uyuyamama.' },
    ],
  },
  {
    id: 'q4_daytime_activity',
    category: 'actigraphy',
    text: '4. Gün içerisindeki fiziksel hareketliliğiniz ve adım/aktivite düzeyiniz nasıl?',
    subtext: 'Aktigraf 24s ortalama ivme ve psikomotor yavaşlama biyobelirteci.',
    options: [
      { label: 'Yüksek ve dinamik (8.000+ adım / düzenli hareket)', score: 0, description: 'Kontrol grubu normu: Yüksek gündüz aktivite pikleri.' },
      { label: 'Orta düzey (4.000 - 8.000 adım / olağan rutin)', score: 1, description: 'Hafif yorgunluk hissi olsa da gün boyu hareket.' },
      { label: 'Düşük (2.000 - 4.000 adım / genelde oturma/uzanma)', score: 2, description: 'Depresif hipoaktivite başlangıcı, hareket isteksizliği.' },
      { label: 'Çok düşük / Sedanter (< 2.000 adım / yataktan çıkamama)', score: 3, description: 'Ağır psikomotor retardasyon, günün çoğunu yatakta geçirme.' },
    ],
  },
  {
    id: 'q5_psychomotor',
    category: 'psychomotor',
    text: '5. Konuşmanızda, düşüncelerinizde veya hareketlerinizde belirgin yavaşlama (veya aşırı huzursuzluk) hissediyor musunuz?',
    subtext: 'Psikomotor retardasyon veya ajitasyon belirtisi (MADRS Madde 7).',
    options: [
      { label: 'Hayır, düşünce ve beden hızım normal', score: 0, description: 'Akıcı konuşma ve koordineli motor hız.' },
      { label: 'Hafif ağırlık ve yavaşlık hissi', score: 1, description: 'İşleri başlatırken vücutta ağırlık hissi.' },
      { label: 'Belirgin yavaşlama (Çevremdekiler de fark ediyor)', score: 2, description: 'Konuşurken duraksama, mimiklerde donukluk.' },
      { label: 'Ağır motor donukluk veya sürekli yerinde duramama', score: 3, description: 'Hareket etmek için devasa irade çabası veya panik huzursuzluğu.' },
    ],
  },
  {
    id: 'q6_fatigue',
    category: 'somatic',
    text: '6. Sabah uyandığınızda ve gün boyu enerji düzeyiniz nasıl?',
    subtext: 'Biyolojik yorgunluk, asteni ve sabah çökkünlüğü (Diurnal mood variation).',
    options: [
      { label: 'Sabah dinç uyanırım, gün boyu enerjim yeterli', score: 0, description: 'Normal sirkadiyen enerji ritmi.' },
      { label: 'Sabahları biraz zor uyanırım, sonradan açılırım', score: 1, description: 'Hafif sabah yorgunluğu.' },
      { label: 'Sürekli tükenmiş ve enerjisiz hissederim', score: 2, description: 'Basit günlük rutinler bile ağır bir yük gibi gelir.' },
      { label: 'Tam tükenmişlik (Basit bir duş almak bile imkansız)', score: 3, description: 'Ağır enerji çöküşü, fiziksel ve zihinsel tükenme.' },
    ],
  },
  {
    id: 'q7_concentration',
    category: 'cognitive',
    text: '7. Kitap okuma, iş yapma veya film izleme sırasında odaklanma güçlüğü yaşıyor musunuz?',
    subtext: 'Bilişsel yavaşlama, karar vermede güçlük ve dikkat dağınıklığı (MADRS Madde 6).',
    options: [
      { label: 'Hayır, odaklanmam gayet net', score: 0, description: 'Görevleri dikkatle ve planlı tamamlama.' },
      { label: 'Bazen aklım dağılıyor', score: 1, description: 'Stres altında hafif konsantrasyon kaybı.' },
      { label: 'Sık sık odaklanamıyorum, kararsızlık çekiyorum', score: 2, description: 'İş veya okuma hızında belirgin düşüş.' },
      { label: 'Hiçbir şeye odaklanamıyorum, basit kararları bile alamıyorum', score: 3, description: 'Ciddi bilişsel sis, felç edici kararsızlık.' },
    ],
  },
  {
    id: 'q8_pessimism',
    category: 'mood',
    text: '8. Geleceğe dair beklentileriniz ve umudunuz ne durumda?',
    subtext: 'Karamsar düşünceler, suçluluk ve geleceğe dair ümitsizlik (MADRS Madde 9).',
    options: [
      { label: 'Geleceğe umutla ve pozitif bakıyorum', score: 0, description: 'Gerçekçi ve iyimser gelecek planları.' },
      { label: 'Zaman zaman endişeliyim ama genel olarak umutluyum', score: 1, description: 'Normal dönemsel kaygılar.' },
      { label: 'Gelecek çoğunlukla karanlık ve belirsiz görünüyor', score: 2, description: 'Belirgin kötümserlik, her şeyin kötü gideceği inancı.' },
      { label: 'Tam bir ümitsizlik ve çaresizlik içindeyim', score: 3, description: 'Hiçbir şeyin düzelmeyeceğine dair mutlak inanç.' },
    ],
  },
];
