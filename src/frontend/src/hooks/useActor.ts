import { useQuery } from "@tanstack/react-query";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

const ACTOR_QUERY_KEY = "actor";

export function useActor() {
  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY],
    queryFn: async () => {
      return await createActorWithConfig();
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
