import { GrpcBaseService } from '@core/services/base';
import { Shipwright } from '@core/gen/shipwright/api/shipwright_connect';
import type {
  ShipwrightJobResponse,
  ShipwrightJobListResponse,
  ShipwrightJobDetailsResponse,
} from '@core/gen/shipwright/api/shipwright_pb';
import {
  ShipwrightJobRequest,
  ShipwrightJobListRequest,
  ShipwrightJobDetailsRequest,
} from '@core/gen/shipwright/api/shipwright_pb';
import type { PartialMessage } from "@bufbuild/protobuf";

export class ShipwrightService extends GrpcBaseService {
  private client = this.createGrpcClient(Shipwright);

  async createConfigureJob(data: PartialMessage<ShipwrightJobRequest>): Promise<ShipwrightJobResponse> {
    const req = new ShipwrightJobRequest(data);
    return this.call(
      'CreateShipwrightConfigureJob',
      'shipwright.Shipwright',
      () => this.client.createShipwrightConfigureJob(req),
      req,
      { isMutation: true },
    );
  }

  async listJobs(filters?: PartialMessage<ShipwrightJobListRequest>): Promise<ShipwrightJobListResponse> {
    const req = new ShipwrightJobListRequest(filters);
    return this.call(
      'ShowShipwrightJobsList',
      'shipwright.Shipwright',
      () => this.client.showShipwrightJobsList(req),
      req,
    );
  }

  async getJobDetails(jobId: string): Promise<ShipwrightJobDetailsResponse> {
    const req = new ShipwrightJobDetailsRequest({ jobId });
    return this.call(
      'ShowShipwrightJobDetails',
      'shipwright.Shipwright',
      () => this.client.showShipwrightJobDetails(req),
      req,
    );
  }
}
