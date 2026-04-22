# CLAUDE.md

Bu dosya, Claude Code oturumlarının projeyi doğru kavramasını sağlamak için yazılmıştır.
Yeni bir oturum başladığında **önce bu dosyayı, sonra `docs/architecture-audit-phase-*.md` dosyalarını** oku.

---

## 1. Proje nedir

- **Ad:** `satis-panel` (iç ad: Sabırlar)
- **İş alanı:** Fındık işleme — üretim, sevkiyat, perakende satış ve lojistik paketleme optimizasyonu
- **Yığın:** Vite 8 · React 19 · React Router 7 · TanStack Query 5 · Supabase · Framer Motion · React Hook Form + Zod
- **Tip dili:** Şu an karma → `logistics-packaging-calculator` TypeScript, diğer modüller JavaScript
- **Dağıtım:** Supabase projesi + `supabase/functions/` altındaki Edge Functions (`create-user`, `login-lookup`, `resolve-login`)

### Komutlar

```bash
npm run dev      # Vite dev server
npm run build    # production build
npm run lint     # ESLint (hala kalan borçlar var, aşağıya bak)
npm run preview  # build'i önizle
```

Environment: `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` gerekli; yoksa `supabaseClient.js` throw eder.

---

## 2. Mimari omurga

Proje **Clean Architecture + Hexagonal**'ı pragmatik şekilde uyguluyor. Her iş modülü aynı 4 (+1) katmana sahip:

```
src/modules/<name>/
├── domain/          ← iş kuralları, entity'ler, value-object'ler, (ts) services
├── application/     ← use-case'ler (saf fonksiyonlar, DI ile), queryKeys, DTOs, mappers
├── infrastructure/  ← Supabase repository implementasyonları, statik data
├── runtime/         ← composition root: use-case'lere repository'leri bağlar
└── presentation/    ← React page'leri, component'ler, hook'lar
```

### Bağımlılık yönü (bozulmaz kural)

```
presentation → runtime → application (use-case) → domain
                              ↑
                     infrastructure (adapter)
```

- `presentation` **asla** `infrastructure`'ı veya `application/use-cases`'i doğrudan import etmez.
- `presentation` daima `runtime/*.runtime.js` üzerinden veri/mutation fonksiyonlarını alır.
- `application/use-cases/*` repository importu **yapmaz** — bağımlılığı parametre olarak alır.
- `runtime` tek composition noktasıdır; repository instance'larını bu katman bilir.

### Kanonik örnek

```js
// application/use-cases/createSale.js  — saf, DI alan fonksiyon
export async function createSale({ salesRepository, productsRepository, userId, organizationId, values }) { ... }

// runtime/sales.runtime.js              — composition
import { salesRepository } from "../infrastructure/repositories/salesRepository";
import { productsRepository } from "../../products/infrastructure/repositories/productsRepository";

export function createSaleRecord({ userId, organizationId, values }) {
  return createSale({ salesRepository, productsRepository, userId, organizationId, values });
}

// presentation/hooks/useSalesListQuery.js — sadece runtime'ı görür
import { listSales } from "../../runtime/sales.runtime";
```

Bu pattern'i **bozma**. Yeni modül eklerken de aynı şekilde kur.

---

## 3. Modül haritası

| Modül | Sorumluluk | Özel not |
|---|---|---|
| `auth` | Login, session yönetimi | Supabase Auth + `login-lookup` / `resolve-login` edge fn |
| `dashboard` | Panel ve KPI'lar | Diğer modüllerin runtime'ını tüketir |
| `sales` | Perakende satış kayıtları (çoklu ürün, KDV, ödeme/fatura durumu) | Referans implementasyon — en temiz örnek |
| `products` | Perakende ürün katalogu | |
| `productions` | Üretim lotları, sevkiyat planı, dispatch log'ları | Üretim ürün katalogu **statik** (`infrastructure/data/productionProducts.data.js`) |
| `reports` | Üretim ve satış raporları | `productions.runtime`'a bağımlı — başka modülün runtime'ını kullanabilen tek yer |
| `users` | Kullanıcı ve rol yönetimi | `create-user` edge fn ile |
| `organizations` | Multi-tenant organizasyon yönetimi | |
| `logistics-packaging-calculator` | Konteyner yükleme ve paketleme optimizasyonu | **TypeScript** · `domain/services/container-load-plan.service.ts` 36 KB algoritma · kendi route'larını `logisticsPackagingRoutes` olarak export eder |

### Cross-module kuralı

Bir modül başka bir modülün **sadece `runtime` katmanını** import edebilir (örneği: `reports` → `productions/runtime`). `infrastructure`, `application/use-cases` veya `presentation/hooks` import etme.

---

## 4. Shared (paylaşılan) katman

```
src/shared/
├── components/ui/     ← Button, Input, Modal, Table, DatePicker, Field, ...
├── components/print/  ← yazdırma şablonları
├── components/system/ ← sistem-düzeyi bileşenler
├── constants/         ← DB_TABLES, PAGE_KEYS, ROUTES, roles, audit
├── lib/               ← supabaseClient, permissions, formatters, tenant, audit, error
├── styles/            ← ui.css, date-picker.css, print.css
└── utils/             ← currency, date, exporters
```

### Shared UI durumu

Phase 04 tamamlandı. Native `<button>`, `<input>`, `<select>`, `<textarea>`, `<table>` kullanımı presentation katmanında **sıfır**. Hepsi shared primitives üzerinden geçiyor. Yeni kod yazarken de shared UI kullan; native HTML öğesi ekleme.

Shared UI index: `src/shared/components/ui/index.js`

---

## 5. CSS katmanlama (Phase 05)

**Üç katmanlı model** — bunu bozma:

1. **`src/app/styles/index.css`** → reset, theme tokens, html/body/root, scrollbar, app shell, global typography, layout utilities
2. **`src/shared/styles/ui.css`** → shared UI primitive stilleri (button, input, modal, table, vs.)
3. **Modül-yerel CSS** → her modülün kendi `<name>.css` dosyası, page entry'sinde import edilir

Module CSS import yerleri:
- `LoginPage.jsx` → `auth.css`
- `DashboardPage.jsx` → `dashboard.css`
- `ProductsPage.jsx` → `products.css`
- `ReportsPage.jsx` → `reports.css`
- `SalesPage.jsx` / `NewSalePage.jsx` → `sales.css`
- `UsersPage.jsx` → `users.css`
- `productions` ve `logistics` kendi yerel CSS'ini presentation altında tutuyor

**Kural:** Global CSS'e modül-özel selector eklenmez. Modül-özel stil mutlaka ilgili modülün CSS dosyasına gider.

---

## 6. Veri ve state

### Supabase erişimi

- Tek client: `src/shared/lib/supabaseClient.js`
- Tablo adları: `src/shared/constants/database.js` → `DB_TABLES`
- Kolon isimleri de aynı dosyada (`SALES_COLUMNS`, `PRODUCTS_COLUMNS`, vs.) — magic string kullanma, sabitleri kullan
- Edge Function isimleri de burada: `EDGE_FUNCTIONS`
- Session storage key: `sabirlar-auth`

### React Query

- QueryClient: `src/app/providers/AppProviders.jsx` içinde
- Defaults: `refetchOnWindowFocus/Reconnect/Mount: false`, `retry: 0`, `staleTime: 5dk`, `gcTime: 10dk`
- **Query key'ler merkezi.** Her modülün `application/queryKeys.js` dosyasında tanımlı. Hook'larda inline `["sales", ...]` yazma, `salesQueryKeys.list(filters)` kullan.
- Invalidation için de aynı dosyada `refreshXxxQueries(queryClient)` helper'ları var.

### Multi-tenant

- `organizations` tablosu ve `organization_memberships` tablosu var.
- Her sorgu `organization_id` ile scope'lanmalı.
- `src/shared/lib/tenant.js` yardımcıları mevcut.

---

## 7. Yetkilendirme

### Rol modeli

`admin` · `manager` · `sales` · (diğerleri)

Varsayılan permission'lar: `src/shared/lib/permissions.js` → `getDefaultPagePermissionsByRoleName`
Kullanıcıya özel override: `users.page_permissions` JSONB kolonu (normalize edilerek uygulanır).

### Page key'ler

`src/shared/constants/permissions.js` → `PAGE_KEYS`. AppShell her menü öğesini bir PAGE_KEY'e bağlıyor; `canAccessPage(profile, pageKey)` kapıyı belirliyor.

### ⚠ Bilinen borç

`PAGE_KEYS` hâlâ eski halinde — **yeni modüller için ayrı key yok:**
- `productions`, `new-production`, `dispatch-plan` hepsi `PAGE_KEYS.PRODUCTS` üzerinden geçiyor
- `logistics-packaging-*` sayfalarının AppShell'de tanımlı permission'ı yok

Yetki modelini düzeltirken `PAGE_KEYS`, `ALL_PAGE_KEYS`, `getDefaultPagePermissionsByRoleName`, `getFirstAccessibleRoute` ve AppShell'deki `navigationItems` birlikte güncellenmeli.

---

## 8. Bilinen teknik borçlar

Bunlar audit dökümanlarında ve incelemede tespit edildi. Yeni iş yaparken bunlara dokunma (trigger değilse), ama refactor önceliği olarak bunları hedefle:

1. **`src/app/layouts/AppShell.jsx` — 1023 satır.** Navigasyon config'i, command-palette search, user menu, permission filtering, animation — hepsi tek dosyada. Alt bileşenlere ayrılmalı (`AppSidebar`, `AppTopbar`, `AppCommandMenu`, `navigation.config.js`).
2. **`logistics-packaging-calculator` — 589 KB.** Diğer modüllerden 4-5 kat büyük. Presentation altında 15+ bileşen klasörü; iç bölümlemeye gidebilir (örn. `calculator/`, `scenarios/`, `materials/`, `rules/`).
3. **TypeScript tutarsızlığı.** Sadece logistics modülü TS. Ya hepsini TS'e taşı ya da bir migration planı yaz — ama yarıda bırakma.
4. **Test altyapısı yok.** Vitest + React Testing Library için hazırlık gerek. Use-case'ler (saf fonksiyon oldukları için) test yazmak için en ideal yer — oradan başla.
5. **`PAGE_KEYS` güncel değil** (yukarıdaki 7. bölüme bak).
6. **README hâlâ Vite template.** Gerçek bir README yazılmalı.
7. **`shared/types/index.d.ts` boş dosya.** Ya dolsun ya silinsin.
8. **Sales tablosu legacy kolonlar içeriyor.** `createSale` use-case'i `primaryItem` bilgisini legacy single-item kolonlarına da yazıyor (`product_id`, `quantity`, `unit_price`, vs.). Bu geçici — eski UI / raporlarla uyum için. Yeni kod bu legacy alanlara yazmak **zorunda kalmadıkça** `sale_items` tablosunu kullanmalı.
9. **Build'de `:global(...)` uyarıları** logistics modülünün bazı CSS dosyalarında (örnek: compact-stack-preview, card-metrics) devam ediyor. `lp-layout.css` Phase 05 temizliği kapsamında (phase-05 sonrası düzeltmede) kapandı; kalan dosyalar ayrı bir temizlik pass'i bekliyor.
10. **ESLint hataları** hâlâ var: `AppShell.jsx`, logistics modülü, productions modülü, reports'un bir kısmı. CSS fazı değil, kod kalitesi sorunu.
11. **Light tema yarım uygulanmış.** AppShell ve shared UI primitives (PageHeader hero dahil) light token'larına tepki veriyor, ama modül sayfalarının gövdesindeki kartlar ve paneller hâlâ hardcoded koyu renkler kullanıyor — light temada okunaksızlaşıyor (beyaz metin açık arka plan üzerinde). Tespit edilen sayfa örnekleri: logistics modülünün hepsi (Paketleme Hesaplayıcı alt kartları, Malzemeler tablosu, Geçmiş paneli, Ürün Ambalaj Kuralları panelleri). Muhtemelen diğer modüllerde de var. Çözüm: tüm kart/panel CSS'lerinin shared theme token'ları (`var(--surface)`, `var(--border)`, `var(--text)`, `var(--muted)`) üzerinden geçmesi. Bağımsız bir faz olarak ele alınmalı — önerilen adı: **phase-06-theme-coverage**.
12. **Bundle size — tek chunk 3.3 MB (gzip 935 KB).** Vite build uyarısı: 500 kB üstü chunk'lar. Tüm modüller tek bundle'da birleştiriliyor; logistics modülünün ağır bağımlılıkları (Three.js, pdfmake, html2canvas, jspdf) her sayfa açılışında indirilmek zorunda kalıyor. Çözüm: React Router sayfalarında `React.lazy` + `Suspense` ile code splitting; özellikle logistics modülünün tamamı ve raporlar (exceljs, pdfmake) ayrı chunk olmalı. Ayrı bir iyileştirme fazı.

---

## 9. Çalışma prensipleri (senden beklenenler)

Tasarım ve görsel kararlar için `docs/design-system.md` — yeni sayfa veya bileşen eklerken oraya bak.

**Değişiklik yaparken:**

- Önce `docs/architecture-audit-phase-*.md` dosyalarını oku. Aktif bir faz varsa onun kurallarına uy.
- **Davranışı koruyan refactor** tercih et; görünür rewrite yapma. Audit'lerin tamamı bu felsefeyle yapılmış.
- Küçük, odaklı PR/commit'ler yap. Bir görevde hem AppShell parçalama hem TS geçiş yapma.
- Yeni bir use-case eklerken: `application/use-cases/*` içine saf fonksiyon yaz → `runtime/*.runtime.js`'e wiring ekle → `application/queryKeys.js`'e key ekle → presentation hook'unu runtime üzerinden bağla.
- Yeni bir UI öğesi eklerken: önce `src/shared/components/ui/index.js`'e bak. Varsa onu kullan. Yoksa shared'e ekle (geniş kullanım alanı varsa) veya modül-yerel yap.
- CSS: shared primitive ile mi, modül-yerel ile mi çözüleceğine karar ver. `app/styles/index.css`'e kesinlikle modül-özel selector ekleme.
- **Supabase erişimi her zaman repository katmanında.** Presentation veya use-case'te doğrudan `supabase.from(...)` çağrısı yapma.
- String olarak tablo/kolon/edge-function adı yazma — `src/shared/constants/database.js` sabitlerini kullan.

**Kod kalitesi:**

- Debug `console.log` bırakma (Phase 02'de temizlendi, geri girmesin).
- React Hook Form'da `watch()` yerine `useWatch()` kullan (compiler uyumluluğu).
- JSDoc ile tip ipuçları yaz (full TS geçişi olana dek).
- Zod schema'ları `domain/validators/` veya ilgili use-case'in yakınında tut.
- Import path'lerinde 3 seviyeden derin relative path'ler (`../../../../`) yerine `@/shared/...` alias'ını tercih et. `vite.config.js`'te `@` alias'ı `src/`'e bağlı; derin relative path'ler kırılgan ve seviye sayma hatalarına açık.

**İletişim:**

- Refactor teklif etmeden önce audit dökümanını kontrol et — orada zaten planlanmış olabilir.
- Büyük bir değişiklikten önce etkilenen modülleri özetle.
- Bir teknik borç kapattığında, ilgili audit dökümanına not düşmeyi öner.

---

## 10. Yol haritası adayları

Seçilmedi ama konuşuldu:

- **A**: `AppShell.jsx` parçalama — düşük risk, hemen başlanabilir
- **B**: Logistics modülü iç bölümleme
- **C**: Aşamalı TypeScript geçişi (domain → application → infrastructure → presentation sırasıyla)
- **D**: Vitest + RTL altyapısı, use-case'lerden başla
- **E**: Kalan ESLint borçlarını kapatma
- **F**: `PAGE_KEYS` yenileme (productions + logistics dahil)

Her biri bağımsız — hangisi seçilirse ona odaklanılmalı.
