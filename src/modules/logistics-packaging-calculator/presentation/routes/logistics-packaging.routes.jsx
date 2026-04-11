import { Route } from 'react-router-dom';
import { LogisticsPackagingCalculatorPage } from '../pages/logistics-packaging-calculator-page';
import { LogisticsPackagingHistoryPage } from '../pages/logistics-packaging-history-page';
import { LogisticsPackagingMaterialsPage } from '../pages/logistics-packaging-materials-page';
import { LogisticsPackagingRulesPage } from '../pages/logistics-packaging-rules-page';

export const logisticsPackagingRoutes = (
  <>
    <Route
      path="/logistics/packaging-calculator"
      element={<LogisticsPackagingCalculatorPage />}
    />
    <Route
      path="/logistics/packaging-materials"
      element={<LogisticsPackagingMaterialsPage />}
    />
    <Route
      path="/logistics/packaging-rules"
      element={<LogisticsPackagingRulesPage />}
    />
    <Route
      path="/logistics/packaging-history"
      element={<LogisticsPackagingHistoryPage />}
    />
  </>
);