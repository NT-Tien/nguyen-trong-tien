import { Collection, MongoClient } from 'mongodb';
import { appSettings } from './appsettings';

class MongoDBService {

  private static client: MongoClient;
  private static dbName: string;

  constructor() {
    const uri = `${appSettings.mongo.url}`;
    MongoDBService.client = new MongoClient(uri);
    MongoDBService.dbName = appSettings.mongo.dbName || 'test';
    console.log(`[${MongoDBService.name}] MongoDB client initialized`);
  }


  async getDb(dbName: string = MongoDBService.dbName) {
    return MongoDBService.client.db(dbName);
  }

  startSession() {
    return MongoDBService.client.startSession();
  }

  async closeSession(session: any) {
    return session.endSession();
  }

  async getCollection(collectionName: string): Promise<Collection<Document>> {
    try {
      const db = await this.getDb();
      return db.collection(collectionName) as Collection<Document>;
    } catch (error) {
      console.error(`Failed to get collection ${collectionName}:`, error);
      throw new Error(`Failed to get collection ${collectionName}`);
    }
  }

}

export const mongoDBService = new MongoDBService();