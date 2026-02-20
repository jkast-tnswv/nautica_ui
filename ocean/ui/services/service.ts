import { GrpcBaseService } from '@core/services/base';
import { Ocean } from '@core/gen/ocean/api/ocean_connect';
import type {
  OceanDeviceListResponse,
  OceanCircuitListResponse,
} from '@core/gen/ocean/api/ocean_pb';
import {
  OceanDeviceListRequest,
  OceanCircuitListRequest,
} from '@core/gen/ocean/api/ocean_pb';
import type { PartialMessage } from "@bufbuild/protobuf";

export class OceanService extends GrpcBaseService {
  private client = this.createGrpcClient(Ocean);

  async listDevices(filters?: PartialMessage<OceanDeviceListRequest>): Promise<OceanDeviceListResponse> {
    const req = new OceanDeviceListRequest(filters);
    return this.call(
      'ShowOceanDeviceList',
      'ocean.Ocean',
      () => this.client.showOceanDeviceList(req),
      req,
    );
  }

  async listCircuits(filters?: PartialMessage<OceanCircuitListRequest>): Promise<OceanCircuitListResponse> {
    const req = new OceanCircuitListRequest(filters);
    return this.call(
      'ShowOceanCircuitList',
      'ocean.Ocean',
      () => this.client.showOceanCircuitList(req),
      req,
    );
  }
}
