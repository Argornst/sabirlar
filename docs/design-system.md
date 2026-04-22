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

### Kural
Tüm header action butonları **flat, tek tip** — primary/secondary ayrımı yok. Her buton eşit görsel ağırlığa sahip.

### Stil
- Arka plan: subtle, düşük opaklı (LP'deki mevcut pattern — rgba beyaz)
- Border: ince, yarı şeffaf
- Hover: hafif arka plan tonu artışı
- Active: scale veya subtle color shift
- Border-radius: 12px (veya mevcut token)
- Padding ve font: LP'deki Temizle/Yeni Senaryo/Lot Ekle butonlarıyla aynı

### İçerik sırası (içeriden dışarıya)
1. İkon (sol)
2. Metin (orta)
3. Shortcut badge (sağ, opsiyonel)

### Shortcut badge
- Alt+X, Ctrl+K gibi klavye kısayolları için
- `<kbd>` elementi, subtle arka plan, monospace font
- Sadece klavye kısayolu olan aksiyonlarda kullanılır

### İstisna
Gradient primary buton ("Yeni Kayıt", "Yeni Satış" gibi) **kullanılmayacak**. Eğer bir sayfada "ana aksiyon" görsel olarak vurgulanmak istenirse, o aksiyon sayfanın gövdesinde belirgin bir CTA kartı olarak yer alır — header butonu olarak değil.

## 3. Icons

### Kural
Tüm ikonlar **Phosphor** ailesinden kullanılır. Lucide kullanılmaz.

### Import
```jsx
import { IconName } from "@phosphor-icons/react";
```

### Weight konvansiyonu
- Default state: `regular`
- Hover state: `fill` (mikro-etkileşim)
- Active/selected state: `bold`
- Disabled state: `light`

### Boyut
- Header butonlarında: 16-18px
- Sidebar'da: 20px
- Inline text'te (button dışında): em boyutu

## 4. Sonraki Fazlar (Planlanmış)

Bu doküman yazıldıktan sonra uygulanacak fazlar, sırasıyla:

1. **İngilizce başlık fix** — Dashboard, Products, Sales, Users → Türkçe (10 dk)
2. **Hero variant yayma** — 9 sayfa hero variant + eyebrow (1 saat)
3. **Button sistemi tekleştirme** — primary gradient butonları flat'e çevir, shortcut badge ekle (30 dk)
4. **Phosphor migration** — tüm Lucide kullanımları Phosphor'a, lucide-react package'ı sök (30-45 dk)
