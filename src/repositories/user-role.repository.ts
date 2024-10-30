import { DefaultCrudRepository } from '@loopback/repository';
import { UserRole } from '../models';
import { RethinkDBDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class UserRoleRepository extends DefaultCrudRepository<UserRole, typeof UserRole.prototype.id> {
  constructor(@inject('datasources.rethinkdb') dataSource: RethinkDBDataSource) { // Updated inject key
    super(UserRole, dataSource);
  }
}
