import { injectable } from 'inversify';
import { Db, MongoClient } from 'mongodb';

@injectable()
export class MongoConnection {
  private client: MongoClient | undefined;
  private db: Db | undefined;

  public async connect(): Promise<void> {
    const mongoUrl = process.env['MONGO_URL'];
    const dbName = process.env['MONGO_DATABASE'];

    if (typeof mongoUrl !== 'string' || mongoUrl.length === 0) {
      throw new Error(
        'MONGO_URL is not defined. Add it to your .env file and start the app with node --env-file .env.',
      );
    }

    this.client = new MongoClient(mongoUrl);
    await this.client.connect();
    this.db = this.client.db(dbName);
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('MongoConnection not connected yet — call connect() first');
    }

    return this.db;
  }

  public async disconnect(): Promise<void> {
    if (!this.client) {
      throw new Error('MongoConnection client is not defined');
    }
    await this.client?.close();
  }
}
