function getUnixTime(s){
    const date = new Date(s);
    const unixTimestamp = date.getTime();
    return unixTimestamp;
}
function generateRecurringDatesTillNextMonth(startAt, frequency, unit) {
    const dates = [];

    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const endOfNextMonth = new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth() + 1, 0);

    let currentDate = new Date(startAt);

    while (currentDate <= endOfNextMonth) {
        if (currentDate >= currentMonthStart) {
            dates.push(new Date(currentDate)); // Clone the date object
        }

        // Increment the date by the specified recurrence interval
        if (unit === "days") {
            currentDate.setDate(currentDate.getDate() + frequency);
        } else if (unit === "weeks") {
            currentDate.setDate(currentDate.getDate() + frequency * 7);
        } else if (unit === "months") {
            currentDate.setMonth(currentDate.getMonth() + frequency);
        } else {
            throw new Error("Invalid unit. Must be 'days', 'weeks', or 'months'.");
        }
    }

    return dates;
}

function generateNextRecurringDates(startAt, frequency, unit, weekdays = [], count = 30) {
    const dates = [];
    let currentDate = new Date(startAt);

    const weekdayMap = {
        "Sun": 0,
        "Mon": 1,
        "Tue": 2,
        "Wed": 3,
        "Thu": 4,
        "Fri": 5,
        "Sat": 6
    };

    // Helper function to check if a date is on one of the specified weekdays
    function isValidWeekday(date) {
        if (weekdays.length === 0) return true; // No specific weekdays condition
        const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
        return weekdays.some(weekday => weekdayMap[weekday] === day);
    }

    while (dates.length < count) {
        if (unit === "week") {
            // Only add dates that match the specified weekdays
            if (isValidWeekday(currentDate)) {
                dates.push(new Date(currentDate)); // Clone the date object
            }

            // Increment by each day until the next valid weekday or next interval
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate.getDay() === weekdayMap["Sun"]) {
                // Jump to the next recurrence interval
                currentDate.setDate(currentDate.getDate() + (frequency - 1) * 7);
            }
        } else {
            dates.push(new Date(currentDate)); // Clone the date object
            
            // Increment the date by the specified recurrence interval
            if (unit === "day") {
                currentDate.setDate(currentDate.getDate() + frequency);
            } else if (unit === "month") {
                currentDate.setMonth(currentDate.getMonth() + frequency);
            } else {
                throw new Error("Invalid unit. Must be 'day', 'week', or 'month'.");
            }
        }
    }

    return dates;
}
// // Example usage
// const startAt = new Date(2024, 7, 10); // August 10, 2024 (Note: Months are 0-indexed in JavaScript)
// const frequency = 2;
// const unit = "weeks";

// const recurringDates = generateRecurringDates(startAt, frequency, unit);
// recurringDates.forEach(date => console.log(date.toISOString().split('T')[0]));
function generateRecurringDates(startAt, frequency, unit, start, end, weekdays = []) {
    const dates = [];
    let currentDate = new Date(startAt);
    const endDate = new Date(end);
    const weekdayMap = {
      "Sun": 0,
      "Mon": 1,
      "Tue": 2,
      "Wed": 3,
      "Thu": 4,
      "Fri": 5,
      "Sat": 6
    };
  
    // Helper function to check if a date is on one of the specified weekdays
    function isValidWeekday(date) {
      if (weekdays.length === 0) return true; // No specific weekdays condition
      const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
      return weekdays.some(weekday => weekdayMap[weekday] === day);
    }
  
    while (currentDate <= endDate) {
      if (unit === "day") {
        dates.push(new Date(currentDate)); // Clone the date object
        currentDate.setDate(currentDate.getDate() + frequency);
      } else if (unit === "week") {
        // Only add dates that match the specified weekdays
        if (isValidWeekday(currentDate)) {
          dates.push(new Date(currentDate)); // Clone the date object
        }
  
        // Increment by each day until the next valid weekday or next interval
        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate.getDay() === weekdayMap["Sun"]) {
          // Jump to the next recurrence interval
          currentDate.setDate(currentDate.getDate() + (frequency - 1) * 7);
        }
      } else if (unit === "month") {
        dates.push(new Date(currentDate)); // Clone the date object
        currentDate.setMonth(currentDate.getMonth() + frequency);
      } else {
        throw new Error("Invalid unit. Must be 'day', 'week', or 'month'.");
      }
    }
  
    // Filter out dates before the start date
    return dates.filter(date => date >= new Date(start));
  }
  
module.exports = {
    getUnixTime,
    generateRecurringDatesTillNextMonth,
    generateNextRecurringDates,
    generateRecurringDates
};