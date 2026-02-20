import { GrpcBaseService } from '@core/services/base';
import { Harbor } from '@core/gen/harbor/api/harbor_connect';
import type {
  HarborResponse,
  HarborListResponse,
} from '@core/gen/harbor/api/harbor_pb';
import {
  HarborRequest,
  HarborListRequest,
} from '@core/gen/harbor/api/harbor_pb';
import type { PartialMessage } from "@bufbuild/protobuf";

export class HarborService extends GrpcBaseService {
  private client = this.createGrpcClient(Harbor);

  async embark(data: PartialMessage<HarborRequest>): Promise<HarborResponse> {
    const req = new HarborRequest(data);
    return this.call(
      'Embark',
      'harbor.Harbor',
      () => this.client.embark(req),
      req,
      { isMutation: true },
    );
  }

  async disembark(data: PartialMessage<HarborRequest>): Promise<HarborResponse> {
    const req = new HarborRequest(data);
    return this.call(
      'Disembark',
      'harbor.Harbor',
      () => this.client.disembark(req),
      req,
      { isMutation: true },
    );
  }

  async list(filters?: PartialMessage<HarborListRequest>): Promise<HarborListResponse> {
    const req = new HarborListRequest(filters);
    return this.call(
      'List',
      'harbor.Harbor',
      () => this.client.list(req),
      req,
    );
  }
}
