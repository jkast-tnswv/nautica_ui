import { createEntitySlice } from '@core/store/createEntitySlice';
import type { IslandAssignment } from '@core/gen/island/api/island_pb';
import { getServices } from '@core/services';

const slice = createEntitySlice<IslandAssignment>({
  name: 'islandAssignments',
  fetch: {
    type: 'islandAssignments/fetch',
    fn: async () => {
      const response = await getServices().island.listAssignments();
      return response.islandAssignments;
    },
  },
});

export const fetchIslandAssignments = slice.fetchThunk;
export default slice.reducer;
