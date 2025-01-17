const { ObjectId } = require('mongodb');
import BaseModel from '../../../models/base';

describe('BaseModel - findInSchool', () => {
    let baseModel;
    let mockCollection;
    let mockDb;
  
    beforeEach(() => {
      // Create a mock for the collection with chained methods
      mockCollection = {
        find: jest.fn().mockReturnThis(), // Returns the mockCollection itself for chaining
        toArray: jest.fn() // Will be set per test case
      };
  
      // Mock the database with collection method
      mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection)
      };
  
      baseModel = new BaseModel(mockDb, 'testCollection');
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return empty array when schoolId is not provided in headers', async () => {
      const query = { status: 'active' };
      const headers = {};
  
      const result = await baseModel.findInSchool(query, headers);
  
      expect(result).toEqual([]);
      expect(mockCollection.find).not.toHaveBeenCalled();
    });
  
    it('should call find with combined query when schoolId is provided', async () => {
      const query = { status: 'active' };
      const headers = { schoolid: '507f1f77bcf86cd799439011' };
      const mockData = [
        { 
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          name: 'Test Item',
          status: 'active',
          school: { _id: headers.schoolid }
        }
      ];
      mockCollection.toArray.mockResolvedValueOnce(mockData);
  
      const result = await baseModel.findInSchool(query, headers);
      
      expect(mockCollection.find).toHaveBeenCalledWith({
        ...query,
        'school._id': headers.schoolid
      }, {});

      expect(result.length).toEqual(1);
      expect(result).toEqual([{
        ...mockData[0],
        _id: mockData[0]._id.toString()
      }]);
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
    });
  
    it('should return empty array when no documents match the query', async () => {
      const query = { status: 'active' };
      const headers = { schoolid: '507f1f77bcf86cd799439011' };
  
      // Mock empty response
      mockCollection.toArray.mockResolvedValueOnce([]);
  
      const result = await baseModel.findInSchool(query, headers);
  
      expect(mockCollection.find).toHaveBeenCalledWith({
        ...query,
        'school._id': headers.schoolid
      }, {});
      expect(result).toEqual([]);
    });
  
    it('should handle errors properly', async () => {
      const query = { status: 'active' };
      const headers = { schoolid: '507f1f77bcf86cd799439011' };
      const error = new Error('Database error');
  
      // Mock a rejected promise for error testing
      //   mockCollection.toArray.mockRejectedValueOnce(error);
      mockCollection.find.mockImplementationOnce(() => {
        throw error;
      });
      await expect(baseModel.findInSchool(query, headers))
        .rejects
        .toThrow('Database error');
    });
  
    it('should handle query with options', async () => {
      const query = { status: 'active' };
      const headers = { schoolid: '507f1f77bcf86cd799439011' };
      const options = { sort: { createdAt: -1 } };
      const mockData = [
        { 
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          name: 'Test Item',
          status: 'active',
          school: { _id: headers.schoolid }
        }
      ];
  
      mockCollection.toArray.mockResolvedValueOnce(mockData);
  
      const result = await baseModel.findInSchool(query, headers, options);
  
      expect(mockCollection.find).toHaveBeenCalledWith({
        ...query,
        'school._id': headers.schoolid
      }, options);

      expect(result).toEqual([{
        ...mockData[0],
        _id: mockData[0]._id.toString()
      }]);
    });
  });
