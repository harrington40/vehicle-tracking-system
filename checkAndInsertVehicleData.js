const r = require('rethinkdb');

// Connect to RethinkDB
r.connect({ host: 'localhost', port: 28015 }, async (err, conn) => {
  if (err) {
    console.error('Error connecting to RethinkDB:', err);
    return;
  }
  console.log('Connected to RethinkDB');

  try {
    // Check if the database exists
    const dbList = await r.dbList().run(conn);
    if (!dbList.includes('VehicleDB')) {
      console.log('Database VehicleDB does not exist. Creating it...');
      await r.dbCreate('VehicleDB').run(conn);
      console.log('Database VehicleDB created successfully.');
    } else {
      console.log('Database VehicleDB already exists.');
    }

    // Check if the table exists
    const tableList = await r.db('VehicleDB').tableList().run(conn);
    if (!tableList.includes('vehicle')) {
      console.log('Table vehicle does not exist. Creating it...');
      await r.db('VehicleDB').tableCreate('vehicle').run(conn);
      console.log('Table vehicle created successfully.');

      // Create indexes for the table
      console.log('Creating indexes...');
      await r.db('VehicleDB').table('vehicle').indexCreate('vin').run(conn);
      await r.db('VehicleDB').table('vehicle').indexCreate('make').run(conn);
      await r.db('VehicleDB').table('vehicle').indexCreate('owner.name').run(conn);
      console.log('Indexes created successfully.');
    } else {
      console.log('Table vehicle already exists.');
    }

    // Sample data for cars
    const carData = [
      {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        vin: '1HGCM82633A123456',
        owner: {
          name: 'John Doe',
          contact: 'john.doe@example.com',
          phone: '+1234567890'
        },
        status: 'active',
        registeredDate: new Date(),
      },
      {
        id: '2',
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        vin: '2HGCM82633A654321',
        owner: {
          name: 'Jane Smith',
          contact: 'jane.smith@example.com',
          phone: '+0987654321'
        },
        status: 'active',
        registeredDate: new Date(),
      },
      {
        id: '3',
        make: 'Ford',
        model: 'F-150',
        year: 2020,
        vin: '3FTFW1E52LKE12345',
        owner: {
          name: 'Bob Johnson',
          contact: 'bob.johnson@example.com',
          phone: '+1122334455'
        },
        status: 'maintenance',
        registeredDate: new Date(),
      }
    ];

    // Insert data into the 'vehicle' table
    const result = await r.db('VehicleDB').table('vehicle').insert(carData, { conflict: 'replace' }).run(conn);
    console.log('Data inserted successfully:', result);

  } catch (err) {
    console.error('Error during operation:', err);
  } finally {
    conn.close();
  }
});
