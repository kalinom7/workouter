import { injectable } from 'inversify';
import { Db, MongoClient } from 'mongodb';

@injectable()
export class MongoConnection {
  private constructor(
    private readonly client: MongoClient,
    private readonly db: Db,
  ) {}
  public static async create(): Promise<MongoConnection> {
    const mongoUrl = process.env['MONGO_URL'];
    const dbName = process.env['MONGO_DATABASE'];

    if (typeof mongoUrl !== 'string' || mongoUrl.length === 0) {
      throw new Error('MONGO_URL is not defined.');
    }

    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(dbName);

    return new MongoConnection(client, db);
  }

  public getDb(): Db {
    return this.db;
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }
}
