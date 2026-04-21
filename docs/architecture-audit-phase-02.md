# Architecture Audit – Faz 02

Bu fazın amacı, Faz 01'de görünür hale gelen modüler iskeleti daha tutarlı bir hale getirmek; presentation katmanındaki doğrudan infrastructure / use-case bağımlılıklarını daraltmak ve modül sınırlarını daha sürdürülebilir bir yapıya taşımaktır.

CSS temizliği bu fazda özellikle ertelenmiştir.

## Tespit

Faz 01 sonrasında ana akış korunmuş olsa da aşağıdaki yapısal kokular devam ediyordu:

- Birden fazla modülde presentation hook'ları doğrudan `infrastructure` veya `application/use-cases` import ediyordu.
- Query invalidation anahtarları bazı modüllerde dağınık duruyordu.
- `productions` modülünde application use-case'leri doğrudan repository import ederek composition sorumluluğunu kendi içine alıyordu.
- `reports` modülü, `productions` tarafındaki presentation hook'una bağlanıyordu; bu da modüller arası bağımlılığı presentation seviyesine taşıyordu.
- Lojistik / paketleme sayfalarında sayfa seviyesinde repository wiring vardı.
- Sales tarafında kalan son `watch()` kullanımı da kontrollü şekilde `useWatch()` modeline alınmalıydı.
- Bazı dosyalarda debug amaçlı `console.log` kalıntıları vardı.

## Sınıflandırma

### 1. Keep
- `src/app`
- `src/shared/*`
- Modüllerin mevcut presentation/page iskeleti
- Domain odaklı modül ayrımı

### 2. Refactor in place
- `auth`
- `dashboard`
- `organizations`
- `products`
- `users`
- `productions`
- `reports`
- `logistics-packaging-calculator`
- `sales`

### 3. Later / intentionally deferred
- CSS sadeleştirmesi
- Stil çakışmaları ve `:global(...)` odaklı temizlik
- Gerekirse modüller arası kalan düşük seviyeli presentation-query composition noktalarının ayrı bir public API katmanına alınması

## Bu fazda yapılan kontrollü refactor

### 1. Runtime / composition sınırı genişletildi
Aşağıdaki modüller için küçük ve kontrollü runtime katmanları oluşturuldu ya da aktif kullanıma alındı:

- `src/modules/auth/runtime/auth.runtime.js`
- `src/modules/dashboard/runtime/dashboard.runtime.js`
- `src/modules/organizations/runtime/organizations.runtime.js`
- `src/modules/products/runtime/products.runtime.js`
- `src/modules/users/runtime/users.runtime.js`
- `src/modules/productions/runtime/productions.runtime.js`
- `src/modules/logistics-packaging-calculator/runtime/logistics-packaging.runtime.js`

Amaç: presentation katmanının repository / use-case wiring sorumluluğunu taşımasını engellemek.

### 2. Query key standardizasyonu genişletildi
Aşağıdaki modüllerde query key'ler application seviyesinde toplandı:

- `dashboard`
- `organizations`
- `products`
- `users`
- `productions`

Bu sayede cache invalidation davranışı daha merkezi, daha okunur ve daha güvenli hale getirildi.

### 3. Productions application katmanı dependency-injection modeline çekildi
`productions/application/use-cases/*` dosyaları doğrudan infrastructure import etmek yerine bağımlılık alan saf fonksiyonlara dönüştürüldü.

Böylece:
- use-case'ler daha test edilebilir hale geldi,
- composition kararı runtime katmanına taşındı,
- presentation -> application -> runtime -> infrastructure akışı netleşti.

### 4. Productions presentation akışı sadeleştirildi
Aşağıdaki alanlar runtime/query-key standardına alındı:

- listeleme
- üretim oluşturma / güncelleme / silme mutation'ları
- dispatch plan sorgusu
- dispatch log sorgusu
- ürün opsiyonlarının form bileşenlerine taşınması
- dispatch oluşturma akışı

### 5. Reports modülü productions presentation katmanından ayrıştırıldı
`reports` artık `productions` modülünün presentation hook'una bağlanmıyor.

Bunun yerine:
- `productions/runtime/productions.runtime.js`
- `productions/application/queryKeys.js`

üzerinden kendi query hook'unu kuruyor.

Bu, modüller arası bağımlılığı daha doğru seviyeye indiriyor.

### 6. Users / Products / Organizations / Dashboard / Auth katmanları hizalandı
Bu modüllerde presentation hook'ları doğrudan repository ya da use-case import etmek yerine runtime ve ortak cache/query-key yardımcıları üzerinden çalışacak şekilde düzenlendi.

### 7. Logistics packaging sayfalarında wiring azaltıldı
Paketleme hesaplama / geçmiş / materyal / kural sayfalarındaki doğrudan repository bağlantıları runtime katmanına taşındı.

Bu modül artık sayfa seviyesinde daha az altyapı bilgisi taşıyor.

### 8. Sales tarafındaki son form gözlemi normalize edildi
`SaleItemsEditor` ve ilgili sayfa akışında kalan `watch()` kullanımı `useWatch()` modeline taşındı.

Bu değişiklik, form izleme davranışını daha kontrollü ve React Hook Form uyumlu hale getiriyor.

### 9. Debug kalıntıları temizlendi
Açık debug `console.log` kullanımları temizlendi.

## Faz 01'e göre değişim özeti

Faz 01 çıktısıyla karşılaştırıldığında bu fazda:

- **14 yeni dosya** eklendi
- **49 mevcut dosya** güncellendi
- Ana hedef modüller ortak bir runtime/query-key desenine yaklaştırıldı

## Doğrulama notu

Bu çalışma ortamında paket bağımlılıkları çevrimdışı olduğu için `npm ci`, `npm run build` ve `npm run lint` komutları güvenilir şekilde yeniden çalıştırılamadı.

Buna rağmen aşağıdaki yapısal doğrulamalar yapıldı:

- presentation altında doğrudan `infrastructure` importları grep ile kontrol edildi
- presentation altında doğrudan `application/use-cases` importları grep ile kontrol edildi
- `console.log` kalıntıları grep ile kontrol edildi
- kalan `watch()` kullanımları grep ile kontrol edildi
- eklenen / güncellenen düz JavaScript dosyalarında `node --check` ile sözdizimi doğrulaması yapıldı

## Sonraki adım

Bu noktadan sonra en doğru ilerleme:
1. Bu mimari turu koruyarak kullanıcıyla birlikte CSS planını açmak
2. Stil katmanını ayrı faz olarak ele almak
3. Gerekirse modüller arası kalan düşük riskli cross-module query bağımlılıklarını ikinci seviyede sadeleştirmek

Bu fazda özellikle rewrite yapılmadı; aktif davranışı koruyarak modüler sınırlar daraltıldı.
