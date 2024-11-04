import r from 'rethinkdb';

const connection = await r.connect({
  host: 'localhost',
  port: 28015,
  db: 'your_database_name',
});

export default {
  table: (tableName) => r.table(tableName),
  run: (query) => query.run(connection),
};
