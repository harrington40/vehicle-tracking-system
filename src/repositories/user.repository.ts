import { DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import { User, Vehicle} from '../models';
import { RethinkDBDataSource } from '../datasources';
import { inject, Getter} from '@loopback/core';
import {VehicleRepository} from './vehicle.repository';

export class UserRepository extends DefaultCrudRepository<User, typeof User.prototype.id> {

  public readonly vehicles: HasManyRepositoryFactory<Vehicle, typeof User.prototype.id>;

  constructor(@inject('datasources.rethinkdb') dataSource: RethinkDBDataSource, @repository.getter('VehicleRepository') protected vehicleRepositoryGetter: Getter<VehicleRepository>,) { // Updated inject key
    super(User, dataSource);
    this.vehicles = this.createHasManyRepositoryFactoryFor('vehicles', vehicleRepositoryGetter,);
    this.registerInclusionResolver('vehicles', this.vehicles.inclusionResolver);
  }
}
