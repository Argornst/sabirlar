import { StackSummary } from '../stack-summary/stack-summary';

export function CalculatorStackSection({ stacks }) {
  return (
    <div className="lp-panel">
      <StackSummary stacks={stacks} />
    </div>
  );
}