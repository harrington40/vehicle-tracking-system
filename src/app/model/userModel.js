// Import the RethinkDB library
const r = require('rethinkdb');

// Database connection setup (adjust based on your RethinkDB configuration)
async function connect() {
    return await r.connect({ host: 'localhost', port: 28015, db: 'vehicle_tracking' });
}

// Function to add a new user
async function addUser(userData) {
    const conn = await connect();
    
    try {
        // Insert the user data into the "users" table
        const result = await r.table('Users').insert(userData).run(conn);
        
        // Check if insertion was successful
        if (result.inserted === 1) {
            return { success: true, id: result.generated_keys[0] };
        } else {
            throw new Error('User creation failed');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;  // Handle error in the gRPC layer
    } finally {
        conn.close();
    }
}

module.exports = {
    addUser,
};
