const r = require('rethinkdb');

// Connect to the RethinkDB server
async function createDatabaseAndTables() {
    try {
        const conn = await r.connect({ host: 'localhost', port: 28015 });

        const dbName = 'vehicle_tracking';

        // Check if the database exists, and create it if not
        const dbList = await r.dbList().run(conn);
        if (!dbList.includes(dbName)) {
            await r.dbCreate(dbName).run(conn);
            console.log(`Database ${dbName} created successfully.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }

        // Switch to the created or existing database
        conn.use(dbName);

        const tablesToCreate = [
            'Users',
            'Businesses',
            'Vehicles',
            'TelematicData',
            'RidesTrips',
            'Alerts'
        ];

        // Sample test data for each table
        const testData = {
            Users: {
                id: 'user1',
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: 'encryptedPassword123',
                phone: '+1234567890',
                role: 'manager',
                business_id: 'business1',
                created_at: new Date(),
                updated_at: new Date()
            },
            Businesses: {
                id: 'business1',
                name: 'Small Biz Co.',
                address: '123 Main St, Business City',
                contact_email: 'contact@smallbiz.com',
                phone: '+1234567891',
                created_at: new Date(),
                updated_at: new Date()
            },
            Vehicles: {
                id: 'vehicle1',
                type: 'car',
                make: 'Toyota',
                model: 'Corolla',
                year: 2021,
                registration_number: 'ABC123',
                tracker_id: 'tracker123',
                business_id: 'business1',
                status: 'active',
                created_at: new Date(),
                updated_at: new Date()
            },
            TelematicData: {
                id: 'telematic1',
                vehicle_id: 'vehicle1',
                latitude: 40.7128,
                longitude: -74.0060,
                speed: 60,
                engine_status: true,
                battery_level: 85,
                timestamp: new Date(),
                custom_data: { fuel_level: '75%', temperature: '22C' }
            },
            RidesTrips: {
                id: 'trip1',
                vehicle_id: 'vehicle1',
                user_id: 'user1',
                start_location: { latitude: 40.7128, longitude: -74.0060 },
                end_location: { latitude: 40.73061, longitude: -73.935242 },
                start_time: new Date(new Date().setHours(new Date().getHours() - 2)),
                end_time: new Date(),
                distance_travelled: 15.5,
                status: 'completed',
                created_at: new Date()
            },
            Alerts: {
                id: 'alert1',
                vehicle_id: 'vehicle1',
                alert_type: 'speed limit exceeded',
                description: 'Vehicle exceeded the speed limit of 50 km/h',
                timestamp: new Date()
            }
        };

        for (let table of tablesToCreate) {
            try {
                // Check if the table already exists
                const tableList = await r.tableList().run(conn);
                if (!tableList.includes(table)) {
                    await r.tableCreate(table).run(conn);
                    console.log(`Table ${table} created successfully.`);

                    // Insert test data for the created table
                    if (testData[table]) {
                        await r.table(table).insert(testData[table]).run(conn);
                        console.log(`Test data inserted into ${table}.`);
                    }
                } else {
                    console.log(`Table ${table} already exists. Skipping creation.`);
                }
            } catch (err) {
                console.error(`Error creating or inserting data into table ${table}: ${err.message}`);
            }
        }

        // Close the connection
        conn.close();
    } catch (err) {
        console.error(`Error connecting to RethinkDB: ${err.message}`);
    }
}

// Run the script
createDatabaseAndTables();
