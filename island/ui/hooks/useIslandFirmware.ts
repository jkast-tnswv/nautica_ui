import { useEntityData } from '@core/hooks/useEntityData';
import type { RootState } from '@core/store';
import { fetchIslandFirmware } from '../slices/islandFirmwareSlice';
import type { IslandFirmware } from '@core/gen/island/api/island_pb';

export interface UseIslandFirmwareReturn {
  firmware: IslandFirmware[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIslandFirmware(): UseIslandFirmwareReturn {
  const { data: firmware, ...rest } = useEntityData(
    fetchIslandFirmware,
    (state: RootState) => state.islandFirmware,
  );
  return { firmware, ...rest };
}
