import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
  BelongsToAccessor,
} from '@loopback/repository';
import {RethinkDBDataSource} from '../datasources';
import {Location,  Vehicle} from '../models';
import {VehicleRepository} from './vehicle.repository';

export class LocationRepository extends DefaultCrudRepository<
  Location,
  typeof Location.prototype.id

> {
  public readonly locations: HasManyRepositoryFactory<Location, typeof Location.prototype.id>;
  public readonly vehicle: BelongsToAccessor<Vehicle, typeof Location.prototype.id>;

  constructor(
    @inject('datasources.rethinkdb') dataSource: RethinkDBDataSource,
    @repository.getter('VehicleRepository') protected vehicleRepositoryGetter: Getter<VehicleRepository>,
  ) {
    super(Location, dataSource);
    this.vehicle = this.createBelongsToAccessorFor('vehicle', vehicleRepositoryGetter);
    this.registerInclusionResolver('vehicle', this.vehicle.inclusionResolver);
  }
}
