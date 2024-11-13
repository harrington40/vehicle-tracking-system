// src/lib/rethinkdb.js
import rethinkdbdash from 'rethinkdbdash';

let db = null;

function initializeDB() {
  if (!db) {
    db = rethinkdbdash({
      host: 'localhost',    // Replace with your host if different
      port: 28015,          // Default RethinkDB port
      db: 'vehicle_tracking', // Replace with your database name
    });
  }
  return db;
}

export default initializeDB;
