import { MongoClient, Db } from "mongodb";

  if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  const uri = process.env.MONGODB_URI;
let client: MongoClient;
let db: Db;

// Connection options to handle TLS/SSL issues with MongoDB Atlas
const options = {
  serverSelectionTimeoutMS: 5000,
  // Workaround for MongoDB Atlas TLS 1.3 compatibility issues
  ...(process.env.NODE_ENV === "development" && {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  }),
};

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  client = new MongoClient(uri, options);
}

export async function getDb(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db("simple-mango");
  }
  return db;
}
