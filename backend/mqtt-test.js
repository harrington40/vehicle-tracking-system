const { mqtt, io, iot } = require('aws-iot-device-sdk-v2');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '.env.local') });

(async () => {
    // Ensure required environment variables are set
    const requiredEnvVars = ['AWS_IOT_KEY_PATH', 'AWS_IOT_CERT_PATH', 'AWS_IOT_CA_PATH', 'AWS_IOT_CLIENT_ID', 'AWS_IOT_HOST'];
    requiredEnvVars.forEach((varName) => {
        if (!process.env[varName]) {
            throw new Error(`Environment variable ${varName} is required.`);
        }
    });

    // Log environment variables for debugging (optional)
    console.log('Loaded Environment Variables:', {
        AWS_IOT_KEY_PATH: process.env.AWS_IOT_KEY_PATH,
        AWS_IOT_CERT_PATH: process.env.AWS_IOT_CERT_PATH,
        AWS_IOT_CA_PATH: process.env.AWS_IOT_CA_PATH,
        AWS_IOT_CLIENT_ID: process.env.AWS_IOT_CLIENT_ID,
        AWS_IOT_HOST: process.env.AWS_IOT_HOST,
    });

    try {
        const clientBootstrap = new io.ClientBootstrap();
        const configBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(
            process.env.AWS_IOT_CERT_PATH,
            process.env.AWS_IOT_KEY_PATH
        );

        configBuilder.with_certificate_authority_from_path(undefined, process.env.AWS_IOT_CA_PATH);
        configBuilder.with_clean_session(true);
        configBuilder.with_client_id(process.env.AWS_IOT_CLIENT_ID);
        configBuilder.with_endpoint(process.env.AWS_IOT_HOST);

        const config = configBuilder.build();
        const client = new mqtt.MqttClient(clientBootstrap);
        const connection = client.new_connection(config);

        // Event Handlers
        connection.on('connect', () => console.log('Connected to AWS IoT'));
        connection.on('disconnect', () => console.log('Disconnected from AWS IoT'));
        connection.on('error', (error) => console.error('Connection Error:', error));

        // Connect to AWS IoT
        await connection.connect();
        console.log('Successfully connected to AWS IoT');

        // Subscribe to a topic
        await connection.subscribe('test/topic', mqtt.QoS.AtMostOnce, (topic, payload) => {
            const message = Buffer.from(payload).toString(); // Decode ArrayBuffer
            console.log(`Received message on topic ${topic}: ${message}`);
        });

        console.log('Subscribed to topic: test/topic');

        // Publish a test message
        const testMessage = JSON.stringify({ message: 'Hello from AWS IoT!' });
        await connection.publish('test/topic', testMessage, mqtt.QoS.AtMostOnce);
        console.log(`Published message to topic test/topic: ${testMessage}`);

        // Subscribe to additional topics (example)
        await connection.subscribe('another/topic', mqtt.QoS.AtMostOnce, (topic, payload) => {
            const message = Buffer.from(payload).toString(); // Decode ArrayBuffer
            console.log(`Received message on topic ${topic}: ${message}`);
        });

        console.log('Subscribed to topic: another/topic');

        // Keep the connection open for 10 seconds
        setTimeout(async () => {
            console.log('Disconnecting from AWS IoT...');
            await connection.disconnect();
        }, 10000);
    } catch (error) {
        console.error('Error:', error);
    }
})();
