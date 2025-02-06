import { generateOccurrence, getInvoiceDate } from "../utils/scheduler.js";
import BaseModel from "./base.js";
import SchoolModel from "./school.js";
import {ChargeStatus} from "../const.js";

export default class ChargePlanModel extends BaseModel {
    constructor(db) {
        super(db, 'charge-plans');
    }

    async create(body) {
        const newChargePlanId = await super.create(body);
        return newChargePlanId;
    }

    async createRecurringChargePlans(schoolId, students, chargeTemplates, occurrenceType, sysRecurringFrequency, sysRecurringMonthday, startTimestamp, endTimestamp) {
        const charges = [];
        const dates = generateOccurrence(sysRecurringFrequency, sysRecurringMonthday, startTimestamp, endTimestamp);
        console.log('recurring occurrance dates:', dates);
        for (let j = 0; j < chargeTemplates.length; j++) {
            const item = chargeTemplates[j];

            for (let i = 0; i < students.length; i++) {
                const student = students[i];
                const contact = student.payingContact;
                const payingContact = contact ? { 
                    _id: contact._id, 
                    firstName: contact.firstName, 
                    lastName: contact.lastName,
                    email: contact.email,
                    phone: contact.phone,
                    stripeCustomerId: contact.stripeCustomerId 
                } 
                : 
                null;
                const plan = {
                    student: { _id: student._id, firstName: student.firstName, lastName: student.lastName },
                    payingContact,
                    school: {_id: schoolId},
                    chargeTemplate: item, // possibly no id ??
                    occurrenceType,
                    startTimestamp,
                    endTimestamp,
                }
                console.log('plan to create:', plan);
                const _id = await super.create(plan);

                for (let k = 0; k < dates.length; k++) {
                    const instance = {
                        ...plan,
                        chargePlanId: _id.toString(),
                        invoiceTimestamp: dates[k].getTime(),
                        status: ChargeStatus.NEW,
                    }

                    charges.push(instance);
                }
            }
        }
        return charges;
    }

    async batchCreate(db, body, headers) {
        const {students, chargeTemplates, occurrenceType } = body;
        const items = [];

        for(let i=0; i<chargeTemplates.length; i++){
            const chargeTemplate = chargeTemplates[i];
            if(chargeTemplate._id){
                items.push({...chargeTemplate, inLibrary: true});
            }else{
                items.push({...chargeTemplate, _id: ObjectId.createFromHexString().toString(), inLibrary: false});
            }
        }
        
        const schoolModel = new SchoolModel(db);
        const school = await schoolModel.findById(headers.schoolid);
        const schoolId = school._id.toString();
        const {recurringPeriod, recurringMonthday, gracePeriod} = school.paymentSettings;
        
        const sysRecurringFrequency = recurringPeriod ? recurringPeriod : 'monthly';
        const sysRecurringMonthday = recurringMonthday ? parseInt(recurringMonthday) : 5;

        // calc instances date
        if(occurrenceType === 'one-time'){
            console.log('one-time original charge plan invoice date', body.invoiceTimestamp);
            const invoiceDate = getInvoiceDate(body.invoiceTimestamp, sysRecurringMonthday, sysRecurringFrequency);
            const instances = [];
            for(let i=0; i<students.length; i++){
                const student = students[i];
                for(let j=0; j<items.length; j++){
                    const item = items[j];
                    const contact = student.payingContact;
                    const payingContact = contact ? { 
                        _id: contact._id, 
                        firstName: contact.firstName, 
                        lastName: contact.lastName,
                        email: contact.email,
                        phone: contact.phone,
                        stripeCustomerId: contact.stripeCustomerId 
                    } : null;
                    const plan = {
                        student: {_id: student._id, firstName: student.firstName, lastName: student.lastName},
                        payingContact,
                        school: {_id: schoolId},
                        chargeTemplate: item,
                        occurrenceType,
                        invoiceTimestamp: new Date(invoiceDate).getTime(), // fix me !
                    }
                    const _id = await super.create(plan);
                    instances.push({chargePlanId: _id.toString(), ...plan, status: ChargeStatus.NEW}); // need new invoice date
                }
            }
            // console.log({instances});
            return instances;
        }else{
            console.log('recurring original charge plan:', body);
            const {startTimestamp, endTimestamp} = body;
            const instances = await this.createRecurringChargePlans(schoolId, students, items, occurrenceType, sysRecurringFrequency, sysRecurringMonthday, startTimestamp, endTimestamp);
            return instances;
        }
    }
}
