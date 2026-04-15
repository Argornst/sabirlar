import { useMemo } from 'react';
import { buildContainerLoadPlan } from '../../domain/services/container-load-plan.service';
import type {
  ContainerDimensions,
  ContainerLoadPlan,
  ContainerLoadPlanLotInput,
} from '../../domain/types/container-load-plan.type';

interface UseContainerLoadPlanParams {
  lots: ContainerLoadPlanLotInput[];
  container: ContainerDimensions;
}

export function useContainerLoadPlan({
  lots,
  container,
}: UseContainerLoadPlanParams): ContainerLoadPlan | null {
  return useMemo(() => {
    if (!lots.length) {
      return null;
    }

    return buildContainerLoadPlan({
      lots,
      container,
    });
  }, [lots, container]);
}