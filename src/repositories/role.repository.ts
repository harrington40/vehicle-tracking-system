import { DefaultCrudRepository } from '@loopback/repository';
import { Role } from '../models';
import { RethinkDBDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class RoleRepository extends DefaultCrudRepository<Role, typeof Role.prototype.id> {
  constructor(@inject('datasources.rethinkdb') dataSource: RethinkDBDataSource) { // Adjusted inject key here
    super(Role, dataSource);
  }
}
