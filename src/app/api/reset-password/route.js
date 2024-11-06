// Import NextResponse for sending HTTP responses in a Next.js API route
import { NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import rethinkdb from 'rethinkdb';

const PROTO_PATH = './grpc-server/protos/service.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage.AuthService;
const client = new serviceProto(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

async function getDBConnection() {
  return await rethinkdb.connect({ host: 'localhost', port: 28015, db: 'vehicle_tracking' });
}

export async function POST(req) {
  let dbConnection;

  try {
    const { email } = await req.json();
    console.log(`Password reset request received for email: ${email}`);

    // Function to call the gRPC method
    const getUser = (email) => {
      return new Promise((resolve, reject) => {
        client.getUser({ email }, (error, response) => {
          if (error) {
            console.error('Error from gRPC server:', error);
            reject(error);
          } else {
            resolve(response);
          }
        });
      });
    };

    // Retrieve user data from gRPC
    const user = await getUser(email);

    if (!user) {
      console.warn(`User not found for email: ${email}`);
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    console.log(`User found. Sending password reset email to ${email}`);

    // Here you would typically generate a token and send a reset email
    // For example, you could use Nodemailer for sending emails
    // const resetToken = generateResetToken();
    // await sendResetEmail(email, resetToken);

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Error during password reset operation:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  } finally {
    if (dbConnection) {
      dbConnection.close();
      console.log('Database connection closed.');
    }
  }
}

// Helper function to generate a reset token
function generateResetToken() {
  // Implement token generation logic (e.g., using JWT or random string)
  return 'generated-reset-token';
}

// Helper function to send the reset email
async function sendResetEmail(email, token) {
  // Use an email service like Nodemailer to send the email
  // e.g., `await transporter.sendMail({ to: email, subject: "Password Reset", text: "Your reset token is: " + token });`
}
