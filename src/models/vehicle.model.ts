import {Entity, model, property, hasMany} from '@loopback/repository';
import {Location} from './location.model';

@model()
export class Vehicle extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: 'string',
  })
  vin?: string;

  @property({
    type: 'string',
  })
  diagnosticId?: string; // Add this property for the Diagnostic relation

  @property({
    type: 'string',
  })
  userId?: string; // Add this property for the User relation

  @hasMany(() => Location)
  locations: Location[];

  constructor(data?: Partial<Vehicle>) {
    super(data);
  }
}
