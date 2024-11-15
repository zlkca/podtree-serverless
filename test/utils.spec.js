import { expect } from 'chai';
import { generateRecurringDates } from "../src/utils.js";

describe('generateRecurringDates', () => {
  it('should generate weekly recurring dates', () => {
    const startAt = 1705766400000; // Sat Jan 20 2024 12:00:00 GMT+0000
    const endAt = 1708358400000;   // Mon Feb 19 2024 12:00:00 GMT+0000
    const frequency = 1;
    const unit = 'week';

    const result = generateRecurringDates(startAt, endAt, frequency, unit, ["Fri"]);

    expect(result).to.deep.equal([
      1706284800000, // Fri Jan 26 2024 12:00:00 GMT+0000
      1706889600000, // Fri Feb 02 2024 12:00:00 GMT+0000
      1707494400000, // Fri Feb 09 2024 12:00:00 GMT+0000
      1708099200000  // Fri Feb 16 2024 12:00:00 GMT+0000 
      ]);

    });

    it('should generate weekly recurring dates with multiple weekdays', () => {
      const startAt = 1705766400000; // Sat Jan 20 2024 12:00:00 GMT+0000
      const endAt = 1708358400000;   // Mon Feb 19 2024 12:00:00 GMT+0000
      const frequency = 1;
      const unit = 'week';
  
      const result = generateRecurringDates(startAt, endAt, frequency, unit, ["Mon", "Wed", "Sat"]);

      expect(result).to.deep.equal(
        [
          1705939200000, // 2024-01-22T12:00:00.000Z (Mon, 22 Jan 2024 12:00:00 GMT)
          1706112000000, // 2024-01-24T12:00:00.000Z (Wed, 24 Jan 2024 12:00:00 GMT)
          1705766400000, // 2024-01-20T12:00:00.000Z (Sat, 20 Jan 2024 12:00:00 GMT)
          1706544000000, // 2024-01-29T12:00:00.000Z (Mon, 29 Jan 2024 12:00:00 GMT)
          1706716800000, // 2024-01-31T12:00:00.000Z (Wed, 31 Jan 2024 12:00:00 GMT)
          1706371200000, // 2024-01-27T12:00:00.000Z (Sat, 27 Jan 2024 12:00:00 GMT)
          1707148800000, // 2024-02-05T12:00:00.000Z (Mon, 05 Feb 2024 12:00:00 GMT)
          1707321600000, // 2024-02-07T12:00:00.000Z (Wed, 07 Feb 2024 12:00:00 GMT)
          1706976000000, // 2024-02-03T12:00:00.000Z (Sat, 03 Feb 2024 12:00:00 GMT)
          1707753600000, // 2024-02-12T12:00:00.000Z (Mon, 12 Feb 2024 12:00:00 GMT)
          1707926400000, // 2024-02-14T12:00:00.000Z (Wed, 14 Feb 2024 12:00:00 GMT)
          1707580800000, // 2024-02-10T12:00:00.000Z (Sat, 10 Feb 2024 12:00:00 GMT)
          1708358400000, // 2024-02-19T12:00:00.000Z (Mon, 19 Feb 2024 12:00:00 GMT)
          1708185600000, // 2024-02-17T12:00:00.000Z (Sat, 17 Feb 2024 12:00:00 GMT)
        ]);
    });
  // Uncomment and update other test cases as needed

  it('should generate daily recurring dates', () => {
    const startAt = 1705766400000; // Sat Jan 20 2024 12:00:00 GMT+0000
    const endAt = 1706025600000;   // Tue Jan 23 2024 12:00:00 GMT+0000
    const frequency = 1;
    const unit = 'day';

    const result = generateRecurringDates(startAt, endAt, frequency, unit);

    expect(result).to.deep.equal([
      1705766400000, // Sat Jan 20 2024 12:00:00 GMT+0000
      1705852800000, // Sun Jan 21 2024 12:00:00 GMT+0000
      1705939200000, // Mon Jan 22 2024 12:00:00 GMT+0000
      1706025600000  // Tue Jan 23 2024 12:00:00 GMT+0000
    ]);
  });

  it('should generate monthly recurring dates', () => {
    const startAt = 1705766400000; // Sat Jan 20 2024 12:00:00 GMT+0000
    const endAt = 1716297600000;   // Mon May 20 2024 12:00:00 GMT+0000
    const frequency = 1;
    const unit = 'month';
  
    const result = generateRecurringDates(startAt, endAt, frequency, unit);

    expect(result).to.deep.equal([
      1705766400000, // Sat Jan 20 2024 12:00:00 GMT+0000
      1708444800000, // Tue Feb 20 2024 12:00:00 GMT+0000
      1710946800000, // Wed Mar 20 2024 12:00:00 GMT+0000
      1713625200000, // Sat Apr 20 2024 12:00:00 GMT+0000
      1716217200000  // Mon May 20 2024 12:00:00 GMT+0000
    ]);
  });

  it('should handle frequency greater than 1', () => {
    const startAt = 1705766400000; // Sat Jan 20 2024 12:00:00 GMT+0000
    const endAt = 1708358400000;   // Mon Feb 19 2024 12:00:00 GMT+0000
    const frequency = 2;
    const unit = 'day';

    const result = generateRecurringDates(startAt, endAt, frequency, unit);

    expect(result).to.deep.equal([
      1705766400000, // Sat Jan 20 2024 12:00:00 GMT+0000
      1705939200000, // Mon Jan 22 2024 12:00:00 GMT+0000
      1706112000000, // Wed Jan 24 2024 12:00:00 GMT+0000
      1706284800000, // Fri Jan 26 2024 12:00:00 GMT+0000
      1706457600000, // Sun Jan 28 2024 12:00:00 GMT+0000
      1706630400000, // Tue Jan 30 2024 12:00:00 GMT+0000
      1706803200000, // Thu Feb 01 2024 12:00:00 GMT+0000
      1706976000000, // Sat Feb 03 2024 12:00:00 GMT+0000
      1707148800000, // Mon Feb 05 2024 12:00:00 GMT+0000
      1707321600000, // Wed Feb 07 2024 12:00:00 GMT+0000
      1707494400000, // Fri Feb 09 2024 12:00:00 GMT+0000
      1707667200000, // Sun Feb 11 2024 12:00:00 GMT+0000
      1707840000000, // Tue Feb 13 2024 12:00:00 GMT+0000
      1708012800000, // Thu Feb 15 2024 12:00:00 GMT+0000
      1708185600000, // Sat Feb 17 2024 12:00:00 GMT+0000
      1708358400000  // Mon Feb 19 2024 12:00:00 GMT+0000
    ]);
  });

  it('should handle start and end dates on the same day', () => {
    const startAt = 1705766400000; // Sat Jan 20 2024 12:00:00 GMT+0000
    const endAt = 1705766400000;   // Sat Jan 20 2024 12:00:00 GMT+0000
    const frequency = 1;
    const unit = 'day';

    const result = generateRecurringDates(startAt, endAt, frequency, unit);

    expect(result).to.deep.equal([1705766400000]);
  });

  it('should return empty array if start date is after end date', () => {
    const startAt = 1708358400000; // Mon Feb 19 2024 12:00:00 GMT+0000
    const endAt = 1705766400000;   // Sat Jan 20 2024 12:00:00 GMT+0000
    const frequency = 1;
    const unit = 'day';

    const result = generateRecurringDates(startAt, endAt, frequency, unit);

    expect(result).to.deep.equal([]);
  });

  it('should handle weekly recurrence with specific weekdays', () => {
    const startAt = 1705766400000; // Sat Jan 20 2024 12:00:00 GMT+0000 (Saturday)
    const endAt = 1707580800000;   // Sat Feb 10 2024 12:00:00 GMT+0000 (Saturday)
    const frequency = 1;
    const unit = 'week';
    const weekdays = ['Tue', 'Thu'];

    const result = generateRecurringDates(startAt, endAt, frequency, unit, weekdays);
    expect(result).to.deep.equal([
      1706025600000, // Tue Jan 23 2024 12:00:00 GMT+0000
      1706198400000, // Thu Jan 25 2024 12:00:00 GMT+0000
      1706630400000, // Tue Jan 30 2024 12:00:00 GMT+0000
      1706803200000, // Thu Feb 01 2024 12:00:00 GMT+0000
      1707235200000, // Tue Feb 06 2024 12:00:00 GMT+0000
      1707408000000, // Thu Feb 08 2024 12:00:00 GMT+0000
    ]);
  });

  // it('should throw error for invalid unit', () => {
  //   const startAt = 1705766400000;
  //   const endAt = 1708358400000;
  //   const frequency = 1;
  //   const unit = 'invalid';

  //   expect(() => {
  //     generateRecurringDates(startAt, endAt, frequency, unit);
  //   }).to.throw('Invalid unit: invalid');
  // });

  // it('should throw error for invalid weekdays', () => {
  //   const startAt = 1705766400000;
  //   const endAt = 1708358400000;
  //   const frequency = 1;
  //   const unit = 'week';
  //   const weekdays = ['Mon', 'InvalidDay'];

  //   expect(() => {
  //     generateRecurringDates(startAt, endAt, frequency, unit, weekdays);
  //   }).to.throw('Invalid weekday: InvalidDay');
  // });
});
