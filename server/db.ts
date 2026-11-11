import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log('Connecting to provided MONGODB_URI...');
      await mongoose.connect(customUri);
      console.log('MongoDB connected successfully to external URI.');
      return;
    } catch (err) {
      console.warn('Failed to connect to external MONGODB_URI, falling back to embedded MongoDB:', err);
    }
  }

  try {
    console.log('Starting embedded MongoDB Server (Memory Instance)...');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'studenttrack_db',
      },
    });
    const uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`Embedded MongoDB connected successfully at ${uri}`);
  } catch (error) {
    console.error('Error starting embedded MongoDB Server:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
