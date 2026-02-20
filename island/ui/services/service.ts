import { GrpcBaseService } from '@core/services/base';
import { Island } from '@core/gen/island/api/island_connect';
import type {
  IslandListFirmwareResponse,
  IslandListAssignmentsResponse,
  IslandUploadFirmwareResponse,
  IslandDeleteFirmwareResponse,
  IslandAssignFirmwareResponse,
  IslandFirmwareActionResponse,
} from '@core/gen/island/api/island_pb';
import {
  IslandListFirmwareRequest,
  IslandUploadFirmwareRequest,
  IslandDeleteFirmwareRequest,
  IslandListAssignmentsRequest,
  IslandAssignFirmwareRequest,
  IslandFirmwareActionRequest,
} from '@core/gen/island/api/island_pb';
import type { PartialMessage } from "@bufbuild/protobuf";

export class IslandService extends GrpcBaseService {
  private client = this.createGrpcClient(Island);

  async listFirmware(): Promise<IslandListFirmwareResponse> {
    const req = new IslandListFirmwareRequest();
    return this.call(
      'ShowIslandFirmwareList',
      'island.Island',
      () => this.client.showIslandFirmwareList(req),
      req,
    );
  }

  async uploadFirmware(data: PartialMessage<IslandUploadFirmwareRequest>): Promise<IslandUploadFirmwareResponse> {
    const req = new IslandUploadFirmwareRequest(data);
    return this.call(
      'UploadIslandFirmware',
      'island.Island',
      () => this.client.uploadIslandFirmware(req),
      req,
      { isMutation: true },
    );
  }

  async deleteFirmware(firmwareId: string, owner: string): Promise<IslandDeleteFirmwareResponse> {
    const req = new IslandDeleteFirmwareRequest({ firmwareId, owner });
    return this.call(
      'DeleteIslandFirmware',
      'island.Island',
      () => this.client.deleteIslandFirmware(req),
      req,
      { isMutation: true },
    );
  }

  async listAssignments(): Promise<IslandListAssignmentsResponse> {
    const req = new IslandListAssignmentsRequest();
    return this.call(
      'ShowIslandAssignmentsList',
      'island.Island',
      () => this.client.showIslandAssignmentsList(req),
      req,
    );
  }

  async assignFirmware(data: PartialMessage<IslandAssignFirmwareRequest>): Promise<IslandAssignFirmwareResponse> {
    const req = new IslandAssignFirmwareRequest(data);
    return this.call(
      'AssignIslandFirmware',
      'island.Island',
      () => this.client.assignIslandFirmware(req),
      req,
      { isMutation: true },
    );
  }

  async updateFirmwareStatus(data: PartialMessage<IslandFirmwareActionRequest>): Promise<IslandFirmwareActionResponse> {
    const req = new IslandFirmwareActionRequest(data);
    return this.call(
      'UpdateIslandFirmwareStatus',
      'island.Island',
      () => this.client.updateIslandFirmwareStatus(req),
      req,
      { isMutation: true },
    );
  }
}
