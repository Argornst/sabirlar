# Design System

Bu doküman Sabırlar panelinin görsel ve etkileşim dil kurallarını tanımlar. Yeni bir sayfa, bileşen veya modül eklerken bu kurallara uyulur. Kurallardan sapma bilinçli bir karar olmalı ve kod yorumunda veya CLAUDE.md'de gerekçesi belirtilmeli.

## 1. Page Header

### Kural
Tüm modül sayfaları `<PageHeader variant="hero" eyebrow="..." title="..." description="..." actions={...} />` kullanır.

### Prop'lar
- `variant="hero"` — zorunlu. Default variant artık kullanılmıyor.
- `eyebrow` — modülün kategori etiketi. Büyük harf, letter-spacing'li, küçük puntolu. Örnekler: "LOJISTIK", "ÜRETİM", "SATIŞ", "KULLANICI", "ÜRÜN", "RAPOR", "PANEL".
- `title` — sayfanın ana başlığı. Türkçe, tek kelime tercih edilir (Ürünler, Satışlar, Üretimler). Kullanıcı yönetimi gibi çok kelimeli başlıklar eyebrow'a taşınır.
- `description` — 1-2 cümle, sayfanın ne işe yaradığını anlatan alt metin.
- `actions` — header'ın sağ tarafındaki buton slot'u.

### Eyebrow konvansiyonu (modül başına)
- Dashboard → "PANEL"
- Sales → "SATIŞ"
- Products → "ÜRÜN"
- Productions → "ÜRETİM"
- Reports → "RAPOR"
- Users → "KULLANICI"
- Logistics → "LOJİSTİK"

## 2. Buttons

Butonlar bağlama göre **6 tipe** ayrılır (§2.1–2.6); her tipin kendi varyantı, yerleşim ve davranış kuralı vardır. §2.7 hepsi için geçerli ortak kuralları toplar. Yeni bir buton eklerken önce hangi tipe ait olduğunu belirle, sonra ilgili alt bölümü uygula.

Tüm tipler `<Button>` shared primitive (`src/shared/components/ui/Button.jsx`) üzerinden render edilir — varyantlar `primary`, `secondary`, `danger`, `ghost`.

### 2.1 Header Buttons
**Bağlam:** `<PageHeader>` actions slot'undaki butonlar (sayfanın sağ üst köşesi).

**Varyant:** Daima `variant="secondary"` — flat, tek tip. Primary/secondary ayrımı yok; "Yeni Kayıt" gibi ana aksiyonlar bile secondary. Her buton eşit görsel ağırlığa sahip.

**İçerik sırası (soldan sağa):**
1. Phosphor ikon (18px)
2. Metin (Türkçe, kısa — 1-2 kelime)
3. Opsiyonel shortcut badge — `shortcut="Alt+X"` prop'u ile

**İstisna yasak:** Gradient primary buton ("Yeni Kayıt", "Yeni Satış" gibi) header'da kullanılmaz. Bir sayfada "ana aksiyon" görsel olarak vurgulanmak istenirse, sayfa gövdesinde belirgin bir CTA kartı olarak yer alır — header butonu olarak değil.

**Örnek:**
```jsx
<Button variant="secondary" shortcut="Alt+L" onClick={handleNewLot}>
  <Plus size={18} />
  Lot Ekle
</Button>
```

### 2.2 Form Submit Buttons
**Bağlam:** Form'ların altındaki ana gönderim butonu (ProductionForm, SaleForm vb.).

**Varyant:** `variant="primary"` — formdaki tek vurgulu eylem. İptal/sıfırla varsa onlar `variant="secondary"`.

**Tip:** `type="submit"` — form içindeyse zorunlu (click handler değil, form submit event tetiklemeli).

**Loading state:** Mutation pending durumunda `loading={mutation.isPending}` zorunlu — Button içeride spinner gösterir, `disabled` otomatik olur.

**Metin:** Aksiyon odaklı tam cümle kabul ("Üretim Kaydını Oluştur", "Satışı Tamamla"). Header'daki 1-2 kelimelik kısalık burada gerekmez.

**Yerleşim:** Form'un en altında, sağa hizalı. İptal varsa: iptal solda `secondary`, ana aksiyon sağda `primary`.

### 2.3 Panel/Card Action Buttons
**Bağlam:** Card veya panel içindeki yardımcı aksiyonlar — kart başlığı (sağ), footer veya gövde içinde inline.

**Varyant:** `variant="secondary"` (belirgin) veya `variant="ghost"` (yumuşak), kartın görsel ağırlığına göre seçilir. Header butonlarından bir kademe daha az dikkat çekmeli.

**Boyut:** Header butonlarıyla aynı yükseklikte; padding biraz dar olabilir.

**Çokluk:** Bir kartta 2'den fazla aksiyon varsa overflow menüye taşınır (`<DotsThree>` ikonu ile).

### 2.4 Filter/Toggle Buttons
**Bağlam:** Sekme/segment kontrolleri — birden fazla seçenekten biri aktif (örn: `dispatch-filter-tabs`, `dispatch-view-tabs`).

**Varyant:** `variant="ghost"` + modül-yerel `--active` modifier class'ı.

**State:** Aktif buton görsel olarak belirgin (border, background, font-weight); inaktif olanlar düşük kontrastlı.

**Grup:** Mantıksal olarak birbirine ait butonlar yan yana, 4-8px gap. Mobile'da wrap edilebilir.

**Toggle vs Tab:** Tek seçim (radio gibi) → tab pattern. Bağımsız on/off → her buton kendi state'ini taşır.

**Örnek:**
```jsx
<Button
  variant="ghost"
  className={`dispatch-filter-tab${active ? " dispatch-filter-tab--active" : ""}`}
  onClick={() => setFilter("week")}
>
  Bu Hafta
</Button>
```

### 2.5 Bulk Action Buttons
**Bağlam:** Tabloda bir veya daha fazla satır seçildiğinde görünen toplu işlem butonları (toplu sil, durum değiştir, dışa aktar).

**Yerleşim:** Tablonun üstünde sticky bir toolbar'da; sadece seçim varken görünür/aktif. Toolbar'ın solunda seçim sayısı gösterilir ("3 satır seçildi").

**Varyant:** Standart toplu aksiyon `variant="secondary"`; yıkıcı toplu aksiyon (toplu sil) `variant="danger"`.

**State:** Hiç seçim yoksa toolbar gizli veya tüm butonlar `disabled`. Yıkıcı aksiyonlar tıklandığında confirm modal şart.

**Çokluk:** 3'ten fazla aksiyon olursa "Daha fazla" overflow menüsüne toplanır.

### 2.6 Table Row Action Buttons
**Bağlam:** Tablo satırının sonundaki ikon-only aksiyonlar (düzenle, sil, detay, kopyala).

**Varyant:** `variant="ghost"`, ikon-only, kompakt (32-36px kare).

**İkon:** Phosphor, 16px, regular weight. Standart eşlemeler: `Pencil` (düzenle), `Trash` (sil), `Eye` (detay), `Copy` (kopyala).

**Tooltip zorunlu:** Tüm ikon-only butonlarda — `title` attribute veya tooltip wrapper. Erişilebilirlik için `aria-label` da set edilir.

**Yıkıcı aksiyonlar:** `variant="danger"` veya hover'da kırmızı tona kayan ghost. Sil tıklandığında confirm şart.

**Yerleşim:** Satırın sağ ucunda, sabit kolon. 3'ten fazla aksiyon varsa kebap menüye (`<DotsThreeVertical>`) toplanır.

### 2.7 Ortak Kurallar
Tüm buton tipleri için geçerli — sapmalar gerekçeli olmalı:

- **Bileşen:** Daima `<Button>` shared primitive — native `<button>`, `<a className="btn">`, ya da `motion.button` doğrudan kullanılmaz.
- **İkon:** Sadece **Phosphor** (bkz. §3); Lucide/heroicon import edilmez. Header'da 18px, satır içi/küçük butonda 16px.
- **Metin:** Türkçe. Aktif fiil veya isim. Tutarlı eşlemeler: "Kaydet", "Sil", "İptal", "Yeni Kayıt", "Üretim Kaydını Oluştur".
- **Shortcut badge:** Klavye kısayolu varsa `shortcut="Alt+X"` prop'u ile — Button bileşeni `<kbd className="ui-shortcut-badge">` olarak render eder. Header ve bulk action'larda yaygın; form submit'te genelde gerekmez.
- **Loading state:** Async/mutation aksiyonlarında `loading={mutation.isPending}` — spinner gösterir, `disabled` otomatik.
- **Disabled state:** `disabled` prop'u opacity + `cursor: not-allowed` ekler. Yıkıcı/önemli aksiyonlarda "neden disabled" tooltip ile açıklanır.
- **Animasyon:** Hover (`y: -1, scale: 1.01`) ve tap (`scale: 0.985`) framer-motion ile Button içinde tanımlı. Modül CSS'inden ek `transform` override yazılmaz.
- **CSS override yasak:** Modül CSS'inde `.modul-actions .ui-button { background: ... }` gibi shared button stillerini ezen compound selector yazılmaz. Yeni varyant gerekiyorsa `Button.jsx`'e eklenir; modül-yerel hack yapılmaz. *(Bu kuralın ihlali Faz 3 sırasında üretim sayfalarında bulunup temizlendi — `productions.css`'in `.production-header-actions` gradient override'ları silindi.)*
- **Light tema:** Tüm varyantlar `:root[data-theme="light"]` token'larına tepki vermeli — modül CSS'inde renk hardcode'lanmaz, `var(--surface)`, `var(--text)`, `var(--border)` kullanılır.

## 3. Icons

### Kural
Tüm ikonlar **Phosphor** ailesinden kullanılır. Lucide kullanılmaz; `lucide-react` paketi Faz 4'te sökülmüştür (bkz. §3 İcon Sözlüğü).

### Import
```jsx
import { IconName } from "@phosphor-icons/react";
```

### Weight konvansiyonu
- **Default state:** `regular` (action ikonları)
- **Hover state:** `fill` (mikro-etkileşim — opsiyonel)
- **Active/selected state:** `bold` (örnek: aktif tab, aktif filter)
- **Disabled state:** `light`
- **Status badge:** `fill` (durum bilgisi sabit, hover'a bağlı değil — ör. "Ödendi" Check, "Faturalandı" Receipt)

### Boyut
- Header butonlarında: 18px
- Satır içi / küçük butonlarda: 16px
- Sidebar'da: 20px
- Inline text'te (button dışında): em boyutu

### İcon Sözlüğü
Yeni icon eklerken önce bu tabloya bak. Burada olmayan bir kavram için icon seçtiğinde tabloyu güncelle — tutarlılık için tek kanon.

| Kavram | Phosphor Icon | Default Weight |
|---|---|---|
| Kaydet | `FloppyDisk` | regular |
| Sil | `Trash` | regular |
| Düzenle | `PencilSimple` | regular |
| Kapat | `X` | regular |
| Hata / Uyarı | `Warning` | fill |
| Başarı | `Check` | fill |
| Yeni Ekle | `Plus` | regular |
| Önceki | `CaretLeft` | regular |
| Sonraki | `CaretRight` | regular |
| Yukarı | `CaretUp` | regular |
| Aşağı | `CaretDown` | regular |
| Geri (navigation back) | `ArrowLeft` | regular |
| Spinner / Loading | `CircleNotch` | regular (CSS spin animasyonu ile) |
| Temizle (form/lot) | `Broom` | regular |
| Yeni Dosya / Senaryo | `FilePlus` | regular |
| Takvim | `CalendarBlank` | regular |
| Yazdır | `Printer` | regular |
| Liste görünümü | `ListBullets` | regular |
| 3D / Kutu / Konteyner | `Cube` | regular |
| Grid / Slot görünümü | `SquaresFour` | regular |
| Geçmiş | `ClockCounterClockwise` | regular |
| Fatura | `Receipt` | fill (status) |
| Bekleme / Boşta | `Minus` | regular |

### Spinner pattern
Loading state için `<CircleNotch>` kullanılır + CSS animasyonu ile döndürülür. LP modülünde mevcut `.lp-button__icon--spin` class'ı (`@keyframes lp-button-spin 0.8s linear infinite`) örnek pattern. Yeni modülde benzer bir keyframe + spin class tanımı yerine ileride shared bir `.ui-icon--spin` utility'sine taşınabilir.

## 4. Sonraki Fazlar (Planlanmış)

Bu doküman yazıldıktan sonra uygulanacak fazlar, sırasıyla:

1. **İngilizce başlık fix** — Dashboard, Products, Sales, Users → Türkçe (10 dk)
2. **Hero variant yayma** — 9 sayfa hero variant + eyebrow (1 saat)
3. **Button sistemi tekleştirme** — primary gradient butonları flat'e çevir, shortcut badge ekle (30 dk)
4. **Phosphor migration** — tüm Lucide kullanımları Phosphor'a, lucide-react package'ı sök (30-45 dk)
