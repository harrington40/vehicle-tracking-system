import { Entity, model, property, hasMany} from '@loopback/repository';
import {Vehicle} from './vehicle.model';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @hasMany(() => Vehicle)
  vehicles: Vehicle[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}
