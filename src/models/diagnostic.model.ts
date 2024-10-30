import { Entity, model, property, hasMany} from '@loopback/repository';
import {Vehicle} from './vehicle.model';

@model()
export class Diagnostic extends Entity {
  @property({
    type: 'string',
    id: true,  // Marks this property as the primary key
    generated: true,  // Automatically generates the ID
  })
  id?: string;

  @property({
    type: 'string',
  })
  vehicleId?: string;

  @property({
    type: 'string',
  })
  errorCode?: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'date',
  })
  timestamp?: string;

  @property({
    type: 'boolean',
  })
  severity?: boolean;

  @hasMany(() => Vehicle)
  vehicles: Vehicle[];

  constructor(data?: Partial<Diagnostic>) {
    super(data);
  }
}

export interface DiagnosticRelations {
  // describe navigational properties here
}

export type DiagnosticWithRelations = Diagnostic & DiagnosticRelations;
