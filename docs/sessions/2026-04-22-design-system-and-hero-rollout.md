# 2026-04-22 — Design System + Hero Variant Rollout (oturum 2)

## Teslim edilen
- docs/design-system.md oluşturuldu — 4 bölüm (Page Header, Buttons, Icons, planlanan fazlar)
- 4 İngilizce sayfa başlığı Türkçe'ye çevrildi (Dashboard→Panel, Products→Ürünler, Sales→Satışlar, Users→Kullanıcılar)
- 9 sayfa hero variant'a geçirildi + eyebrow konvansiyonu uygulandı (PANEL, SATIŞ, ÜRÜN, ÜRETİM, RAPOR, KULLANICI)
- Logistics layout'ta eyebrow "Lojistik" → "LOJİSTİK" olarak düzeltildi
- Badge prop kullanımı kaldırıldı (design-system'e göre eyebrow ile mutually exclusive)
- Tüm sayfalarda hero altı spacing eşitlendi: base margin-bottom 24→40px, lp-layout gap 1.1rem→0

## Commit'ler
- 699c294 fix(i18n): localize page titles to Turkish (Dashboard, Products, Sales, Users)
- 210e768 refactor(ui): apply hero variant + eyebrow convention to all pages
- (+ iki docs commit'i bu oturum öncesinde)

## Tasarım kararları (docs/design-system.md'de kayıtlı)
- Tüm sayfalar variant="hero" kullanır; default variant artık kullanılmıyor
- Eyebrow ve badge mutually exclusive, eyebrow kazanır
- Butonlar flat tek tip (primary/secondary ayrımı yok) — Faz 3'te uygulanacak
- İkon ailesi Phosphor (Lucide sökülecek) — Faz 4'te uygulanacak

## Planlanan sonraki adımlar
- Faz 3: Tüm header butonlarını flat tek tip'e çevir, shortcut badge ekle, primary gradient butonları kaldır
- Faz 4: Phosphor migration — tüm Lucide kullanımlarını @phosphor-icons/react'a çevir, lucide-react package'ı sök

## Yarın için
Faz 3 ile başla. Önce shared Button bileşenine bak, kaç varyant var, nasıl çalışıyor anla. Sonra sayfa header action'larındaki mevcut primary/secondary kullanımlarını flat'e çevir. En son shortcut badge desteğini standartlaştır.
