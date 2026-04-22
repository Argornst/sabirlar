# 2026-04-22 — Shared PageHeader Unification

## Teslim edilen
- Shared `PageHeader` hibrit genişletildi: `eyebrow` ve `variant="hero"` prop'ları eklendi. `eyebrow` ve `badge` mutually exclusive — `eyebrow` önceliklidir.
- Logistics modülündeki özel hero markup'ı shared PageHeader'a absorbe edildi; `LogisticsPackagingLayout` artık kendi header'ını çizmiyor.
- `lp-layout.css` 95 → 13 satır (ölü `__hero` sınıfları, `:global()` blokları, responsive overrides silindi).
- 4 logistics sayfasında `subtitle` → `description` prop tutarlılığı sağlandı; layout bileşeninde prop da rename edildi, köprü kaldırıldı.
- Shared UI CSS'ine eyebrow + hero variant stilleri eklendi (dark + light tema).

## Keşfedilen teknik borçlar (CLAUDE.md bölüm 8'e eklendi)
- Madde 11: Light tema yarım uygulanmış (phase-06-theme-coverage)
- Madde 12: Bundle size 3.3 MB, code splitting yok
- Madde 9 güncellendi: lp-layout.css temizlendi, kalan :global() uyarıları başka logistics CSS dosyalarında

## Eklenen konvansiyon
- Import'larda 3+ seviye derin relative path yerine `@/shared/...` alias'ı (CLAUDE.md bölüm 9)

## Commit'ler
- 8975a69 docs: add CLAUDE.md as source of truth, redirect AGENTS.md
- f8d324c refactor(ui): unify PageHeader across modules, absorb logistics hero variant
- 15cdcf8 docs: add import alias convention note

## Sonraki oturum için öneri
Phase-06 theme coverage. Kart/panel CSS'lerini shared token'lara (`var(--surface)`, `var(--border)`, `var(--text)`) geçirme pass'i. Bugün canlı olarak görülen light tema regresyonunu çözer.
