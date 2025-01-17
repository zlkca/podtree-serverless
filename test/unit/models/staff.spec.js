import StaffModel from "../../../models/staff";

describe('StaffModel', () => {
  let staffModel;
  let mockCollection;
  let mockDb;

  beforeEach(() => {
    // Mock collection methods
    mockCollection = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      toArray: jest.fn()
    };

    // Mock database
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };

    staffModel = new StaffModel(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return null if staff with email already exists', async () => {
      const staffData = {
        email: 'test@example.com',
        name: 'Test User'
      };

      // Mock findOne to return existing staff
      const existingStaff = { ...staffData, _id: 'existing-id' };
      mockCollection.findOne.mockResolvedValueOnce(existingStaff);

      const result = await staffModel.create(staffData);

      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: staffData.email });
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

//     it('should create new staff if email does not exist', async () => {
//       const staffData = {
//         email: 'new@example.com',
//         name: 'New User'
//       };

//       // Mock findOne to return null (no existing staff)
//       mockCollection.findOne.mockResolvedValueOnce(null);
      
//       // Mock insertOne to return an ID
//       const newId = 'new-staff-id';
//       mockCollection.insertOne.mockResolvedValueOnce({ insertedId: newId });

//       const result = await staffModel.create(staffData);

//       expect(result).toBe(newId);
//       expect(mockCollection.findOne).toHaveBeenCalledWith({ email: staffData.email });
//       expect(mockCollection.insertOne).toHaveBeenCalledWith(staffData);
//     });

//     it('should handle database errors during creation', async () => {
//       const staffData = {
//         email: 'test@example.com',
//         name: 'Test User'
//       };

//       mockCollection.findOne.mockRejectedValueOnce(new Error('Database error'));

//       await expect(staffModel.create(staffData)).rejects.toThrow('Database error');
//     });
//   });

//   describe('findInSchool', () => {
//     it('should find staff by userId when provided', async () => {
//       const query = { userId: 'user123' };
//       const headers = { schoolid: 'school123' };
//       const mockStaff = [
//         { _id: 'staff1', userId: 'user123', name: 'Test User' }
//       ];

//       mockCollection.toArray.mockResolvedValueOnce(mockStaff);

//       const result = await staffModel.findInSchool(query, headers);

//       expect(mockCollection.find).toHaveBeenCalledWith({ userId: query.userId });
//       expect(result).toEqual(mockStaff);
//     });

//     it('should use findInSchool from parent class when userId is not provided', async () => {
//       const query = { status: 'active' };
//       const headers = { schoolid: 'school123' };
//       const mockStaff = [
//         { _id: 'staff1', name: 'Test User', status: 'active' }
//       ];

//       // Spy on the parent class's findInSchool method
//       const findInSchoolSpy = jest.spyOn(staffModel, 'findInSchool');
//       mockCollection.toArray.mockResolvedValueOnce(mockStaff);

//       const result = await staffModel.findInSchool(query, headers);

//       expect(findInSchoolSpy).toHaveBeenCalledWith(query, headers);
//     });

//     it('should handle empty results', async () => {
//       const query = { userId: 'nonexistent' };
//       const headers = {};

//       mockCollection.toArray.mockResolvedValueOnce([]);

//       const result = await staffModel.findInSchool(query, headers);

//       expect(result).toEqual([]);
//       expect(mockCollection.find).toHaveBeenCalledWith({ userId: query.userId });
//     });

//     it('should handle database errors during search', async () => {
//       const query = { userId: 'user123' };
//       const headers = {};

//       mockCollection.toArray.mockRejectedValueOnce(new Error('Database error'));

//       await expect(staffModel.findInSchool(query, headers)).rejects.toThrow('Database error');
//     });
  });
});
