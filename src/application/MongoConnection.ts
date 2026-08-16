import { type Db, MongoClient } from 'mongodb';
import { type Config } from './config/Config.js';

export class MongoConnection {
  private constructor(
    private readonly client: MongoClient,
    private readonly db: Db,
  ) {}

  public static async create(config: Config): Promise<MongoConnection> {
    console.log(config.getMongoUrl());
    const client = new MongoClient(config.getMongoUrl());
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(config.getDbName());
    console.log(`Connected to MongoDB database: ${config.getDbName()}`);

    return new MongoConnection(client, db);
  }

  public getDb(): Db {
    return this.db;
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }
}
