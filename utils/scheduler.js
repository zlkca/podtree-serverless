import { RRule } from 'rrule';
import { getMonthRangeByTimestamp } from './index';

export function generateOccurrence(freq, recurringMonthday, startTimestamp, endTimestamp){
    console.log('generateOccurence:', {freq, recurringMonthday, startTimestamp, endTimestamp})
    const byMonthday = recurringMonthday ? (recurringMonthday == "last" ? -1 : recurringMonthday) : 1;
    console.log({byMonthday})
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

// return date object
export function getInvoiceDate(currTimestamp, recurringMonthDay, frequency = 'monthly') {
    const {startTimestamp, endTimestamp} = getMonthRangeByTimestamp(currTimestamp);
    const startDate = new Date(startTimestamp);
    const endDate = new Date(endTimestamp);

    console.log({currTimestamp, startTimestamp, endTimestamp, recurringMonthDay})
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
    console.log({occurrences})
    const nextPayment = occurrences.find(date => date > startDate);
    console.log({nextPayment})
    return nextPayment || null;
}
