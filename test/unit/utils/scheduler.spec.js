
import {getInvoiceDate} from '../../../utils/scheduler';

describe('getInvoiceDate', () => {
    let baseModel;
    let mockCollection;
    let mockDb;
  
    beforeEach(() => {
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should getInvoiceDate', async () => {
        const currTimestamp = 1737900122539; // Example timestamp
        const recurringMonthDay = 5;
        const result = getInvoiceDate(currTimestamp, recurringMonthDay);
        expect(result).toEqual(new Date('2025-01-05T05:00:00.000Z'));
    });
});