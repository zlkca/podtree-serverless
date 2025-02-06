import { ObjectId } from 'mongodb';

export default class BaseModel {
  constructor(db, collectionName) {
    if (!db) {
      throw new Error('Database connection is required');
    }
    this.db = db;
    this.collectionName = collectionName;
    this.collection = this.db.collection(this.collectionName);
  }

  async create(data) {
    try {
      const result = await this.collection.insertOne({
        ...data,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      });
      return result.insertedId;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const item = await this.collection.findOne({ _id: ObjectId.createFromHexString(id) });
      if (item && item._id) {
        const data = {...item, _id: item._id.toString()};
        return data;
      }else{
        return item;
      }
    } catch (error) {
      console.error(`Error finding ${this.collectionName} by id:`, error);
      throw error;
    }
  }
  
  async findOne(query) {
    try {
      const result = await this.collection.findOne(query);
      if (result && result._id) {
        const data = {...result, _id: result._id.toString()};
        return data;
      }else{
        return result;
      }
    } catch (error) {
      console.error(`Error finding ${this.collectionName} by id:`, error);
      throw error;
    }
  }
  
  async findAll() {
    try {
      return await this.collection.find({}).toArray();
    } catch (error) {
      console.error(`Error finding all ${this.collectionName}:`, error);
      throw error;
    }
  }

  async find(query = {}, options = {}) {
    if(!query){
      query = {};
    }
    try {
      const result = await this.collection.find(query, options).toArray();
      if(result && result.length > 0){
        return result.map(doc => ({
          ...doc,
          _id: doc._id.toString()
        }));
      }
      return [];
    } catch (error) {
      // console.error(`Error finding ${this.collectionName}:`, error);
      throw error;
    }
  }

  async updateOne(model, query, doc) {
    try {
      const data = await this.collection.updateOne(query, doc);
      return { data, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  async updateById(id, updateData) {
    try {
      const result = await this.collection.updateOne(
        { _id: ObjectId.createFromHexString(id) },
        { 
          $set: { ...updateData, updatedAt: new Date().getTime() }
        },
        { returnDocument: 'after' }
      );
      return result;
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async deleteById(id) {
    try {
      const result = await this.collection.deleteOne({ _id: ObjectId.createFromHexString(id) });
      return result.deletedCount;
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  async insertMany(docs) {
    try {
      const result = await this.collection.insertMany(docs);
      return result.insertedIds;
    } catch (error) {
      console.error(`Error inserting many ${this.collectionName}:`, error);
      throw error;
    }
  }

  async updateMany(query, updateData) {
    try {
      const result = await this.collection.updateMany(
        query,
        { $set: { ...updateData, updatedAt: new Date().getTime() } }
      );
      console.log('updateMany result:', result);
      return result.modifiedCount;
    } catch (error) {
      console.log('updateMany error:', error);
      console.error(`Error updating many ${this.collectionName}:`, error);
      throw error;
    }
  }

  async findInSchool(query, headers, options){
    const schoolId = headers.schoolid;
    if(!schoolId){
      return [];
    }
    return await this.find({...query, 'school._id': schoolId}, options);
  }
}
