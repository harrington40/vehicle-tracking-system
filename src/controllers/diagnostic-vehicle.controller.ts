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
  Diagnostic,
  Vehicle,
} from '../models';
import {DiagnosticRepository} from '../repositories';

export class DiagnosticVehicleController {
  constructor(
    @repository(DiagnosticRepository) protected diagnosticRepository: DiagnosticRepository,
  ) { }

  @get('/diagnostics/{id}/vehicles', {
    responses: {
      '200': {
        description: 'Array of Diagnostic has many Vehicle',
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
    return this.diagnosticRepository.vehicles(id).find(filter);
  }

  @post('/diagnostics/{id}/vehicles', {
    responses: {
      '200': {
        description: 'Diagnostic model instance',
        content: {'application/json': {schema: getModelSchemaRef(Vehicle)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Diagnostic.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vehicle, {
            title: 'NewVehicleInDiagnostic',
            exclude: ['id'],
            optional: ['diagnosticId']
          }),
        },
      },
    }) vehicle: Omit<Vehicle, 'id'>,
  ): Promise<Vehicle> {
    return this.diagnosticRepository.vehicles(id).create(vehicle);
  }

  @patch('/diagnostics/{id}/vehicles', {
    responses: {
      '200': {
        description: 'Diagnostic.Vehicle PATCH success count',
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
    return this.diagnosticRepository.vehicles(id).patch(vehicle, where);
  }

  @del('/diagnostics/{id}/vehicles', {
    responses: {
      '200': {
        description: 'Diagnostic.Vehicle DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Vehicle)) where?: Where<Vehicle>,
  ): Promise<Count> {
    return this.diagnosticRepository.vehicles(id).delete(where);
  }
}
