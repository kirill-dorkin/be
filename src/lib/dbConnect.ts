import mongoose, { ConnectOptions } from "mongoose";

const DB_URL = process.env.DB_URL as string;

if (!DB_URL) {
  throw new Error("Please define the DB_URL environment variable inside .env");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const options: ConnectOptions = {};
    cached!.promise = mongoose.connect(DB_URL, options).then((mongooseInstance) => {
      console.log("Connected to MongoDB");
      return mongooseInstance;
    });
  }

  cached!.conn = await cached!.promise!;
  return cached!.conn;
}
