import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productionQueryKeys, refreshProductionQueries } from "../../application/queryKeys";
import { updateProductionRecord } from "../../runtime/productions.runtime";

function normalizePayload(payload) {
  if (payload?.mode === "bulk" && Array.isArray(payload.items)) {
    return payload.items.map((item) => ({
      id: item.id,
      values: item.values,
    }));
  }

  if (payload?.id && payload?.values) {
    return [
      {
        id: payload.id,
        values: payload.values,
      },
    ];
  }

  return [];
}

function applyUpdatesToCollection(data, updatesById) {
  if (!Array.isArray(data)) return data;

  return data.map((item) => {
    const patch = updatesById.get(item.id);
    if (!patch) return item;

    return {
      ...item,
      ...patch,
    };
  });
}

export const useUpdateProductionMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (payload?.mode === "bulk" && Array.isArray(payload.items)) {
        return Promise.all(
          payload.items.map((item) =>
            updateProductionRecord({
              id: item.id,
              values: item.values,
            })
          )
        );
      }

      return updateProductionRecord({
        id: payload.id,
        values: payload.values,
      });
    },

    onMutate: async (payload) => {
      const optimisticItems = normalizePayload(payload);

      await queryClient.cancelQueries({
        queryKey: productionQueryKeys.all,
      });

      const snapshots = queryClient.getQueriesData({
        queryKey: productionQueryKeys.all,
      });

      const updatesById = new Map(
        optimisticItems.map((item) => [item.id, item.values])
      );

      snapshots.forEach(([queryKey, previousData]) => {
        const nextData = applyUpdatesToCollection(previousData, updatesById);

        if (nextData !== previousData) {
          queryClient.setQueryData(queryKey, nextData);
        }
      });

      return {
        snapshots,
      };
    },

    onError: (_error, _payload, context) => {
      if (context?.snapshots?.length) {
        context.snapshots.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },

    onSuccess: async (result) => {
      const records = Array.isArray(result) ? result : [result];
      const updatesById = new Map(records.map((item) => [item.id, item]));

      const snapshots = queryClient.getQueriesData({
        queryKey: productionQueryKeys.all,
      });

      snapshots.forEach(([queryKey, previousData]) => {
        const nextData = applyUpdatesToCollection(previousData, updatesById);

        if (nextData !== previousData) {
          queryClient.setQueryData(queryKey, nextData);
        }
      });
    },

    onSettled: async () => {
      await refreshProductionQueries(queryClient);
    },
  });

  const moveOneOptimistic = async ({ id, values }) => {
    return mutation.mutateAsync({
      id,
      values,
    });
  };

  const moveManyOptimistic = async ({ items }) => {
    return mutation.mutateAsync({
      mode: "bulk",
      items,
    });
  };

  return {
    ...mutation,
    moveOneOptimistic,
    moveManyOptimistic,
  };
};
