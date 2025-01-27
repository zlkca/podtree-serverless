import { getCurrentMonthRange } from "../utils/index.js";
import { getInvoiceDate } from "../utils/scheduler.js";
import BaseModel from "./base.js";
import ChargeModel from "./charge.js";
import SchoolModel from "./school.js";

export default class InvoiceModel extends BaseModel {
    constructor(db) {
        super(db, 'invoices');
    }

    async generateInvoices(schoolId) {
        const currTimestamp = new Date().getTime();
        const schoolModel = new SchoolModel(this.db);
        const school = await schoolModel.findById(schoolId);
        const recurringMonthDay = school.paymentSettings.recurringMonthday;
        const invoiceDate = getInvoiceDate(currTimestamp, recurringMonthDay);
        console.log({invoiceDate})
        const invoiceTimestamp = invoiceDate.getTime();
        const chargeModel = new ChargeModel(this.db);
        const {startTimestamp, endTimestamp} = getCurrentMonthRange();
        console.log({startTimestamp, endTimestamp})
        const charges = await chargeModel.find({ 
            invoiceTimestamp: {"$gt": startTimestamp,"$lt": endTimestamp}, 
            "school._id": schoolId
        });
        console.log({charges})
        // Aggregate charges by studentId
        const invoiceMap = {};
        charges.forEach(charge => {
            if (!invoiceMap[charge.student._id]) {
                invoiceMap[charge.student._id] = {
                    student: charge.student,
                    school: {_id: school._id.toString()},
                    amount: 0,
                    invoiceTimestamp: invoiceTimestamp,
                    items: [],
                    createdAt: currTimestamp
                };
            }
            invoiceMap[charge.student._id].amount += charge.chargeTemplate.amount;
            invoiceMap[charge.student._id].items.push({
                _id: charge.chargeTemplate._id.toString(),
                name: charge.chargeTemplate.name,
                description: charge.chargeTemplate.description,
                amount: charge.chargeTemplate.amount,
                createdAt: charge.chargeTemplate.createdAt
            })
        });
        console.log({invoiceMap});
        // Convert the map to an array of invoices
        const invoices = Object.values(invoiceMap);
        console.log({invoices})
        if(invoices && invoices.length > 0){
            return await super.insertMany(invoices);
        }
        return null;
    }

}