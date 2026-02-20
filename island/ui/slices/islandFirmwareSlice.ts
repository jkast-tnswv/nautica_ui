import { createEntitySlice } from '@core/store/createEntitySlice';
import type { IslandFirmware } from '@core/gen/island/api/island_pb';
import { getServices } from '@core/services';

const slice = createEntitySlice<IslandFirmware>({
  name: 'islandFirmware',
  fetch: {
    type: 'islandFirmware/fetch',
    fn: async () => {
      const response = await getServices().island.listFirmware();
      return response.islandFirmwares;
    },
  },
});

export const fetchIslandFirmware = slice.fetchThunk;
export default slice.reducer;
