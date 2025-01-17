import {RRule} from 'rrule';

export function generateOccurrence(freq, recurringMonthday, startTimestamp, endTimestamp){

    const byMonthday = recurringMonthday ? (recurringMonthday == "last" ? -1 : recurringMonthday) : 1;

    if(freq === "daily"){
        const rule = new RRule({
            freq: RRule.DAILY,
            interval: 2,
            byweekday: null, // [RRule.MO, RRule.FR],
            dtstart: new Date(startTimestamp),
            until: new Date(endTimestamp)
          });
          return rule.all();
    }
    else if(freq === "weekly"){
        const rule = new RRule({
            freq: RRule.WEEKLY,
            interval: 1,
            dtstart: new Date(startTimestamp),
            until: new Date(endTimestamp)
          });
          return rule.all();
    }
    else if(freq === "monthly"){
        const rule = new RRule({
            freq: RRule.MONTHLY,
            interval: 1,
            dtstart: new Date(startTimestamp),
            until: new Date(endTimestamp),
            bymonthday: byMonthday
          });
          return rule.all();
    }
    else if(freq === "bi-weekly"){
        const rule = new RRule({
            freq: RRule.WEEKLY,
            interval: 2,
            dtstart: new Date(startTimestamp),
            until: new Date(endTimestamp)
          });
          return rule.all();
    }
    else if(freq === "yearly"){
        const rule = new RRule({
            freq: RRule.YEARLY,
            interval: 1,
            dtstart: new Date(startTimestamp),
            until: new Date(endTimestamp)
          });
          return rule.all();
    }
    else{
        const rule = new RRule({
            freq: RRule.MONTHLY,
            interval: 1,
            dtstart: new Date(startTimestamp),
            until: new Date(endTimestamp),
            bymonthday: byMonthday
          });
          return rule.all();
    } 
}

export function getNextInvoiceDate(currentDate, recurringMonthDay, frequency = 'monthly') {
    console.log("currentDate", currentDate);
    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // Look ahead 1 year to be safe
    console.log("startDate", startDate);
    console.log("endDate", endDate);
    let rule;
    
    switch(frequency.toLowerCase()) {
        case 'monthly':
            rule = new RRule({
                freq: RRule.MONTHLY,
                interval: 1,
                dtstart: startDate,
                until: endDate,
                bymonthday: recurringMonthDay === 'last' ? -1 : recurringMonthDay
            });
            break;
        case 'quarterly':
            rule = new RRule({
                freq: RRule.MONTHLY,
                interval: 3,
                dtstart: startDate,
                until: endDate,
                bymonthday: recurringMonthDay === 'last' ? -1 : recurringMonthDay
            });
            break;
        case 'yearly':
            rule = new RRule({
                freq: RRule.YEARLY,
                interval: 1,
                dtstart: startDate,
                until: endDate,
                bymonthday: recurringMonthDay === 'last' ? -1 : recurringMonthDay
            });
            break;
        default:
            throw new Error('Unsupported frequency');
    }

    // Get all occurrences and find the first one after the current date
    const occurrences = rule.all();
    const nextPayment = occurrences.find(date => date > startDate);
    
    return nextPayment || null;
}
