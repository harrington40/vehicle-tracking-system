import { inject, Getter} from '@loopback/core';
import { DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import { RethinkDBDataSource } from '../datasources';
import { Diagnostic, DiagnosticRelations, Vehicle} from '../models';
import {VehicleRepository} from './vehicle.repository';

export class DiagnosticRepository extends DefaultCrudRepository<
  Diagnostic,
  typeof Diagnostic.prototype.id,
  DiagnosticRelations
> {

  public readonly vehicles: HasManyRepositoryFactory<Vehicle, typeof Diagnostic.prototype.id>;

  constructor(
    @inject('datasources.rethinkdb') dataSource: RethinkDBDataSource, @repository.getter('VehicleRepository') protected vehicleRepositoryGetter: Getter<VehicleRepository>,
  ) {
    super(Diagnostic, dataSource);
    this.vehicles = this.createHasManyRepositoryFactoryFor('vehicles', vehicleRepositoryGetter,);
    this.registerInclusionResolver('vehicles', this.vehicles.inclusionResolver);
  }
}
