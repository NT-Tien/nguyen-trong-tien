import { ObjectId } from "mongodb";
import { mongoDBService } from "../common/mongodb.service";
import { handleSearch } from "../utils/search.tool";

export interface User {
  _id?: any;
  name: string;
  email: string;
  createdAt: Date;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserModel {

  async getAllUsers(): Promise<User[]> {
    const user_collection = await mongoDBService.getCollection('users');
    const docs = await user_collection.find().toArray();
    return docs as unknown as User[];
  }

  async getUsersWithSearch(queryParams: any): Promise<PaginatedUsers> {
    const user_collection = await mongoDBService.getCollection('users');

    const { filterQuery, sortQuery } = handleSearch(queryParams);
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await user_collection.countDocuments(filterQuery);

    const docs = await user_collection
      .find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      users: docs as unknown as User[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getUserById(id: string): Promise<User | undefined> {
    const user_collection = await mongoDBService.getCollection('users');
    const doc = await user_collection.findOne({ _id: new ObjectId(id) });
    return doc as unknown as User | undefined;
  }

  async createUser(name: string, email: string): Promise<User> {
    const user_collection = await mongoDBService.getCollection('users');
    const newUser: User = {
      name,
      email,
      createdAt: new Date()
    };
    await user_collection.insertOne(newUser as any);
    return newUser;
  }

   async updateUser(id: string, name: string, email: string): Promise<User | undefined> {
    const user_collection = await mongoDBService.getCollection('users');
    const _id = new ObjectId(id);
    const result = await user_collection.updateOne({ _id }, { $set: { name, email } });
    if (result.modifiedCount === 1) {
      const updated = await user_collection.findOne({ _id });
      return updated as unknown as User | undefined;
    }
    return undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user_collection = await mongoDBService.getCollection('users');
    const result = await user_collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }
}
