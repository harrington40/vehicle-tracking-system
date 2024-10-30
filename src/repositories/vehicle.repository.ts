import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { RethinkDBDataSource } from '../datasources';
import { Vehicle} from '../models';

export class VehicleRepository extends DefaultCrudRepository<
  Vehicle,
  typeof Vehicle.prototype.id
> {
  constructor(
    @inject('datasources.rethinkdb') dataSource: RethinkDBDataSource,
  ) {
    super(Vehicle, dataSource);
  }
}
