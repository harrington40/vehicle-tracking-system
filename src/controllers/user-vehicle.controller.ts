import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  Vehicle,
} from '../models';
import {UserRepository} from '../repositories';

export class UserVehicleController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/vehicles', {
    responses: {
      '200': {
        description: 'Array of User has many Vehicle',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Vehicle)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Vehicle>,
  ): Promise<Vehicle[]> {
    return this.userRepository.vehicles(id).find(filter);
  }

  @post('/users/{id}/vehicles', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Vehicle)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vehicle, {
            title: 'NewVehicleInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) vehicle: Omit<Vehicle, 'id'>,
  ): Promise<Vehicle> {
    return this.userRepository.vehicles(id).create(vehicle);
  }

  @patch('/users/{id}/vehicles', {
    responses: {
      '200': {
        description: 'User.Vehicle PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vehicle, {partial: true}),
        },
      },
    })
    vehicle: Partial<Vehicle>,
    @param.query.object('where', getWhereSchemaFor(Vehicle)) where?: Where<Vehicle>,
  ): Promise<Count> {
    return this.userRepository.vehicles(id).patch(vehicle, where);
  }

  @del('/users/{id}/vehicles', {
    responses: {
      '200': {
        description: 'User.Vehicle DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Vehicle)) where?: Where<Vehicle>,
  ): Promise<Count> {
    return this.userRepository.vehicles(id).delete(where);
  }
}
