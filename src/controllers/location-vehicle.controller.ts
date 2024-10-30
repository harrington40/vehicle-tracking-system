import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Location,
  Vehicle,
} from '../models';
import {LocationRepository} from '../repositories';

export class LocationVehicleController {
  constructor(
    @repository(LocationRepository)
    public locationRepository: LocationRepository,
  ) { }

  @get('/locations/{id}/vehicle', {
    responses: {
      '200': {
        description: 'Vehicle belonging to Location',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Vehicle),
          },
        },
      },
    },
  })
  async getVehicle(
    @param.path.string('id') id: typeof Location.prototype.id,
  ): Promise<Vehicle> {
    return this.locationRepository.vehicle(id);
  }
}
