# Architecture Audit – Faz 01

Bu repo için ilk hedef, davranışı değiştirmeden aktif modüler yapıyı görünür kılmak ve eski paralel katmanları temizlemektir.

## Tespit

- Aktif giriş hattı: `src/main.jsx -> src/app/* -> src/modules/* -> src/shared/*`
- Paralel ve artık kullanılmayan eski yüzey:
  - `src/pages/*`
  - `src/presentation/*`
  - `src/components/Layout.jsx`
  - `src/lib/supabase.js`
  - `src/App.css`
  - `src/index.css`
- Sales modülünde presentation katmanı doğrudan infrastructure repository'lerini import ediyordu.
- Sales modülünde ilgili query invalidation anahtarları tekrar tekrar farklı hook'larda yazılıyordu.
- `NewSalePage` içinde `watch()` kullanımı React Hook Form compiler lint kuralına takılıyordu.

## Sınıflandırma

### 1. Keep
- `src/app`
- `src/modules/*/presentation/pages`
- `src/shared/components/ui`
- `src/shared/lib`

### 2. Refactor in place
- `src/modules/sales/presentation/hooks/*`
- `src/modules/sales/presentation/pages/NewSalePage.jsx`
- `src/shared/components/ui/DatePicker.jsx`

### 3. Remove / deprecate
- Eski top-level UI yüzeyi (`src/pages`, `src/presentation`, `src/components`, `src/lib`)

## Bu fazda yapılan kontrollü refactor

1. Kullanılmayan legacy top-level katman kaldırıldı.
2. Sales modülü için küçük bir runtime composition katmanı eklendi:
   - `src/modules/sales/runtime/sales.runtime.js`
3. Sales modülünde ortak query invalidation anahtarları tek yerde toplandı:
   - `src/modules/sales/application/queryKeys.js`
4. Sales presentation hook'ları doğrudan repository import etmek yerine runtime katmanını kullanacak şekilde düzenlendi.
5. `NewSalePage` içinde `watch()` yerine `useWatch()` ile izlenen alanlar ayrıştırıldı.
6. Aktif paylaşılan UI bileşenlerinde düşük riskli lint uyarlamaları yapıldı.
7. `vite.config.js` ESM uyumlu hale getirildi.

## Sonraki faz adayları

- Products modülü için benzer composition/runtime sınırı kurmak
- Users modülündeki presentation -> infrastructure bağımlılıklarını azaltmak
- Reports modülünde üretim rapor bağımlılıklarını application düzeyinde toplamak
- CSS sadeleştirmesini en sona bırakmak
