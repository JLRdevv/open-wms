import { Injectable } from '@nestjs/common';
import { WarehousesRepository } from './warehouses.repository';

@Injectable()
export class WarehousesService {
  constructor(private readonly warehousesRepository: WarehousesRepository) {}
}
