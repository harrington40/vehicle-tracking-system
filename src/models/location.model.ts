import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Vehicle} from './vehicle.model';

@model()
export class Location extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: 'string',
  })
  name?: string;

  @belongsTo(() => Vehicle)
  vehicleId: string;

  constructor(data?: Partial<Location>) {
    super(data);
  }
}
