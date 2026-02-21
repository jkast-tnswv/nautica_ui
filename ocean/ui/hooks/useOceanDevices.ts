import { useEntityData, type UseEntityDataOptions } from '@core/hooks/useEntityData';
import type { RootState } from '@core/store';
import { fetchOceanDevices } from '../slices/oceanDevicesSlice';
import type { OceanDevice } from '@core/gen/ocean/api/ocean_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { OceanDeviceListRequest } from '@core/gen/ocean/api/ocean_pb';

export type UseOceanDevicesOptions = UseEntityDataOptions<PartialMessage<OceanDeviceListRequest> | undefined>;

export interface UseOceanDevicesReturn {
  devices: OceanDevice[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOceanDevices(options: UseOceanDevicesOptions = {}): UseOceanDevicesReturn {
  const { data: devices, ...rest } = useEntityData(
    fetchOceanDevices,
    (state: RootState) => state.oceanDevices,
    options,
  );
  return { devices, ...rest };
}
