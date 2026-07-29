import { injectable } from 'inversify';

@injectable()
export class Config {
  public getMongoUrl(): string {
    const mongoUrl = process.env['MONGO_URL'];
    if (typeof mongoUrl !== 'string' || mongoUrl.length === 0) {
      throw new Error('MONGO_URL is not defined.');
    }

    return mongoUrl;
  }

  public getDbName(): string {
    const dbName = process.env['MONGO_DATABASE'];
    if (typeof dbName !== 'string' || dbName.length === 0) {
      throw new Error('MONGO_DATABASE is not defined.');
    }

    return dbName;
  }
}
