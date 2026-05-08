import mongoose from 'mongoose';

const LOCAL_MONGO_URI = 'mongodb://localhost:27017/personal-os-lite';

type DatabaseEnv = Record<string, string | undefined>;

function isTruthyEnv(value: string | undefined): boolean {
  return value === '1' || value === 'true' || value === 'yes';
}

function shouldRequireDatabase(env: DatabaseEnv = process.env): boolean {
  return env.NODE_ENV === 'production' || isTruthyEnv(env.REQUIRE_MONGODB);
}

function resolveMongoUri(env: DatabaseEnv = process.env): string {
  if (env.MONGO_URI) {
    return env.MONGO_URI;
  }

  if (shouldRequireDatabase(env)) {
    throw new Error('MONGO_URI is required when MongoDB is required.');
  }

  return LOCAL_MONGO_URI;
}

async function connectDB(): Promise<void> {
  const databaseRequired = shouldRequireDatabase();
  const mongoUri = resolveMongoUri();

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (databaseRequired) {
      throw new Error(`MongoDB connection failed: ${message}`);
    }

    console.warn('MongoDB connection failed (service will continue running):', message);
    console.warn('Set REQUIRE_MONGODB=true or NODE_ENV=production to fail startup when MongoDB is unavailable.');
  }
}

export { connectDB, resolveMongoUri, shouldRequireDatabase };
