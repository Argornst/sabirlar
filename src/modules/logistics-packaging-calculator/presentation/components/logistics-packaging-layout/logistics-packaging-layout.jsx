import PageHeader from '@/shared/components/ui/PageHeader';
import './logistics-packaging-layout.css';

export function LogisticsPackagingLayout({ title, description, actions, children }) {
  return (
    <div className="lp-layout">
      <PageHeader
        variant="hero"
        eyebrow="LOJİSTİK"
        title={title}
        description={description}
        actions={actions}
      />

      <div className="lp-layout__content">{children}</div>
    </div>
  );
}