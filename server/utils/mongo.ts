import { MongoClient, type Collection, type Document } from "mongodb";

type MongoState = {
  clientPromise?: Promise<MongoClient>;
};

const mongoState = globalThis as typeof globalThis & { __cupiMongo?: MongoState };
mongoState.__cupiMongo ??= {};

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI chưa được cấu hình.");
  return uri;
}

async function getClient() {
  if (!mongoState.__cupiMongo!.clientPromise) {
    const client = new MongoClient(getMongoUri(), {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
    });
    mongoState.__cupiMongo!.clientPromise = client.connect().catch((error) => {
      mongoState.__cupiMongo!.clientPromise = undefined;
      throw error;
    });
  }
  return mongoState.__cupiMongo!.clientPromise;
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const client = await getClient();
  const database = client.db(process.env.MONGODB_DB || "cupi_store");
  const collection = database.collection<T>(name);
  await collection.createIndex({ slug: 1 }, { unique: true });
  return collection;
}

export async function pingMongo() {
  const client = await getClient();
  await client.db(process.env.MONGODB_DB || "cupi_store").command({ ping: 1 });
}
