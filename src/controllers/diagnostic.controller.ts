import {
  Count,
  CountSchema,
  Filter,
  Where,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response, // Import response from @loopback/rest
} from '@loopback/rest';

import { Diagnostic } from '../models';
import { DiagnosticRepository } from '../repositories';

export class DiagnosticController {
  constructor(
    @repository(DiagnosticRepository)
    public diagnosticRepository: DiagnosticRepository,
  ) { }

  @post('/diagnostics')
  @response(200, {
    description: 'Diagnostic model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Diagnostic) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Diagnostic, {
            title: 'NewDiagnostic',
            exclude: ['id'],
          }),
        },
      },
    })
    diagnostic: Omit<Diagnostic, 'id'>,
  ): Promise<Diagnostic> {
    return this.diagnosticRepository.create(diagnostic);
  }

  @get('/diagnostics/count')
  @response(200, {
    description: 'Diagnostic model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.query.object('where', getModelSchemaRef(Diagnostic, { partial: true }))
    where?: Where<Diagnostic>,
  ): Promise<Count> {
    return this.diagnosticRepository.count(where);
  }

  @get('/diagnostics')
  @response(200, {
    description: 'Array of Diagnostic model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Diagnostic, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getModelSchemaRef(Diagnostic, { partial: true }))
    filter?: Filter<Diagnostic>,
  ): Promise<Diagnostic[]> {
    return this.diagnosticRepository.find(filter);
  }

  @patch('/diagnostics')
  @response(200, {
    description: 'Diagnostic PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Diagnostic, { partial: true }),
        },
      },
    })
    diagnostic: Diagnostic,
    @param.query.object('where', getModelSchemaRef(Diagnostic, { partial: true }))
    where?: Where<Diagnostic>,
  ): Promise<Count> {
    return this.diagnosticRepository.updateAll(diagnostic, where);
  }

  @get('/diagnostics/{id}')
  @response(200, {
    description: 'Diagnostic model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Diagnostic, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Diagnostic>,
  ): Promise<Diagnostic> {
    return this.diagnosticRepository.findById(id, filter);
  }

  @patch('/diagnostics/{id}')
  @response(204, {
    description: 'Diagnostic PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Diagnostic, { partial: true }),
        },
      },
    })
    diagnostic: Diagnostic,
  ): Promise<void> {
    await this.diagnosticRepository.updateById(id, diagnostic);
  }

  @put('/diagnostics/{id}')
  @response(204, {
    description: 'Diagnostic PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() diagnostic: Diagnostic,
  ): Promise<void> {
    await this.diagnosticRepository.replaceById(id, diagnostic);
  }

  @del('/diagnostics/{id}')
  @response(204, {
    description: 'Diagnostic DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.diagnosticRepository.deleteById(id);
  }
}
