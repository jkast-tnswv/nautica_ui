import { useEntityData, type UseEntityDataOptions } from '@core/hooks/useEntityData';
import { fetchOceanCircuits } from './oceanCircuitsSlice';
import type { OceanCircuit } from '@core/gen/ocean/api/ocean_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { OceanCircuitListRequest } from '@core/gen/ocean/api/ocean_pb';
import type { RootState } from '@core/store';

export type UseOceanCircuitsOptions = UseEntityDataOptions<PartialMessage<OceanCircuitListRequest> | undefined>;

export interface UseOceanCircuitsReturn {
  circuits: OceanCircuit[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOceanCircuits(options: UseOceanCircuitsOptions = {}): UseOceanCircuitsReturn {
  const { data: circuits, ...rest } = useEntityData(
    fetchOceanCircuits,
    (state: RootState) => state.oceanCircuits,
    options,
  );
  return { circuits, ...rest };
}
