import { useEntityData, type UseEntityDataOptions } from '@core/hooks/useEntityData';
import { fetchOceanCircuits } from '../slices/oceanCircuitsSlice';
import type { OceanCircuit } from '@core/gen/ocean/api/ocean_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { OceanCircuitListRequest } from '@core/gen/ocean/api/ocean_pb';

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
    (state: any) => state.oceanCircuits,
    options,
  );
  return { circuits, ...rest };
}
