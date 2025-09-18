import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (!uri) {
  console.warn('MONGODB_URI environment variable is not set. MongoDB features are disabled until it is provided.');
}

type GlobalWithMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const globalWithMongo = global as GlobalWithMongo;

export async function connectDB(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not configured.');
  }

  if (clientPromise) {
    return clientPromise;
  }

  if (process.env.NODE_ENV === 'development') {
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise!;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export default connectDB;

export async function getDatabase(dbName?: string): Promise<Db> {
  const clientConnection = await connectDB();
  return clientConnection.db(dbName || process.env.MONGODB_DB || 'bekg');
}

export async function getCollection(collectionName: string, dbName?: string) {
  const db = await getDatabase(dbName);
  return db.collection(collectionName);
}

export async function isConnected(): Promise<boolean> {
  try {
    const connection = await connectDB();
    await connection.db('admin').command({ ping: 1 });
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('MongoDB connection error:', error);
    }
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  try {
    if (!clientPromise) {
      return;
    }

    const connection = await clientPromise;
    await connection.close();
    clientPromise = null;
    client = null;

    if (process.env.NODE_ENV === 'development') {
      delete globalWithMongo._mongoClientPromise;
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}
