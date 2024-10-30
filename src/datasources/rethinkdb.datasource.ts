import { inject, lifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as config from './rethinkdb.datasource.config.json';

@lifeCycleObserver('datasource')
export class RethinkDBDataSource extends juggler.DataSource {
  static dataSourceName = 'rethinkdb';

  constructor(
    @inject('datasources.config.rethinkdb', { optional: true })
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
