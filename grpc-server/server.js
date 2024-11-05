const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const rethinkdb = require('rethinkdb');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const path = require('path');


const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, 'protos', 'service.proto'),
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage;

let dbConnection;
rethinkdb.connect({ host: 'localhost', port: 28015, db: 'vehicle_tracking' }, (err, conn) => {
    if (err) {
        console.error('Error connecting to RethinkDB:', err);
        process.exit(1);
    } else {
        console.log('Connected to RethinkDB');
        dbConnection = conn;
    }
});

// Existing GetUser implementation
function getUser(call, callback) {
    const email = call.request.email.trim();
    rethinkdb.table('Users').filter({ email }).run(dbConnection, (err, cursor) => {
        if (err) {
            callback({ code: grpc.status.INTERNAL, message: 'Error querying the database' });
            return;
        }

        cursor.toArray((err, result) => {
            if (err) {
                callback({ code: grpc.status.INTERNAL, message: 'Error processing database result' });
            } else if (result.length === 0) {
                callback({ code: grpc.status.NOT_FOUND, message: 'User not found' });
            } else {
                callback(null, {
                    id: result[0].id,
                    name: result[0].name,
                    email: result[0].email,
                    password: result[0].password,
                });
            }
        });
    });
}

// Existing AddUser implementation
async function addUser(call, callback) {
    const { name, email, password } = call.request;

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10); // Adjust rounds if needed

        const result = await rethinkdb.table('Users').insert({
            name,
            email,
            password: hashedPassword, // Store the hashed password
        }).run(dbConnection);

        if (result.inserted === 1) {
            callback(null, { success: true, user_id: result.generated_keys[0] });
        } else {
            callback({ code: grpc.status.INTERNAL, message: 'User creation failed' });
        }
    } catch (error) {
        console.error('Error adding user:', error);
        callback({ code: grpc.status.INTERNAL, message: 'Error inserting user into database' });
    }
}

// New method to verify reset token
async function verifyResetToken(call, callback) {
    const { token } = call.request;

    try {
        const cursor = await rethinkdb.table('Users').filter({ resetToken: token }).run(dbConnection);
        const users = await cursor.toArray();

        if (users.length === 0) {
            callback(null, { valid: false });
        } else {
            callback(null, { valid: true });
        }
    } catch (error) {
        console.error('Error verifying reset token:', error);
        callback({ code: grpc.status.INTERNAL, message: 'Error verifying token' });
    }
}

// New method to reset password
async function resetPassword(call, callback) {
    const { token, newPassword } = call.request;

    try {
        const cursor = await rethinkdb.table('Users').filter({ resetToken: token }).run(dbConnection);
        const users = await cursor.toArray();

        if (users.length === 0) {
            callback(null, { success: false, message: 'Invalid or expired token' });
            return;
        }

        const userId = users[0].id;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await rethinkdb.table('Users').get(userId).update({
            password: hashedPassword,
            resetToken: null  // Clear the reset token after resetting the password
        }).run(dbConnection);

        callback(null, { success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        callback({ code: grpc.status.INTERNAL, message: 'Failed to reset password' });
    }
}

// Create the gRPC server and add methods
const server = new grpc.Server();
server.addService(serviceProto.AuthService.service, { getUser, addUser, verifyResetToken, resetPassword });

const PORT = '0.0.0.0:50051';
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind gRPC server:', err);
        return;
    }
    console.log(`gRPC server running at ${PORT}`);
    server.start();
});
