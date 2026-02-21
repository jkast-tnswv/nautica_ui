import { useEntityData } from '@core/hooks/useEntityData';
import type { RootState } from '@core/store';
import { fetchIslandAssignments } from '../slices/islandModelsSlice';
import type { IslandAssignment } from '@core/gen/island/api/island_pb';

export interface UseIslandAssignmentsReturn {
  assignments: IslandAssignment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIslandAssignments(): UseIslandAssignmentsReturn {
  const { data: assignments, ...rest } = useEntityData(
    fetchIslandAssignments,
    (state: RootState) => state.islandAssignments,
  );
  return { assignments, ...rest };
}
