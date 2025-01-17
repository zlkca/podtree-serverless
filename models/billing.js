import BaseModel from "./base.js";

export default class InvoiceModel extends BaseModel {
    constructor(db) {
      super(db, 'billings');
    }

    async create(body){
        const {invoiceDate} = body;
        const chargeModel = new ChargeModel(this.db);
        const charges = await chargeModel.find({invoiceDate});
        
        const billingMap = {};
        if(charges && charges.length > 0){
            // generate new bills
            for(let charge of charges){
                if(!billingMap[charge.student._id]){
                    const {student, payingContact, school, chargeTemplate, occurenceType, invoiceDate} = charge;
                    billingMap[charge.student._id] = {
                        student, payingContact, school, invoiceDate,
                        charges: [{
                            name: chargeTemplate.name,
                            description: chargeTemplate.description,
                            category: chargeTemplate.category,
                            amount: chargeTemplate.amount,
                            chargeTemplateId: chargeTemplate._id,
                            occurenceType, amount: charge.amount
                        }],
                        amount: chargeTemplate.amount
                    };
                }else{
                    billingMap[charge.student._id].charges.push({
                        name: charge.chargeTemplate.name,
                        description: charge.chargeTemplate.description,
                        category: charge.chargeTemplate.category,
                        amount: charge.chargeTemplate.amount,
                        chargeTemplateId: charge.chargeTemplate._id,
                        occurenceType, amount: charge.amount
                    });
                    billingMap[charge.student._id].amount += charge.amount;
                }
            }
            // fetch existing bills
            const billingModel = new BillingModel(this.db);        
            const billings = await billingModel.find({invoiceDate});
    
            // compare and update
            const updatedBillingMap = { ...billingMap };
            
            for (const dbBilling of billings) {
                const studentId = dbBilling.student._id.toString();
                const invoiceDate = dbBilling.invoiceDate.toISOString();
            
                // Check if there's a corresponding entry in billingMap
                if (billingMap[studentId] && billingMap[studentId].invoiceDate.toISOString() === invoiceDate) {
                    if (dbBilling.status === 'paid') {
                        // If status is 'paid', skip updating
                        delete updatedBillingMap[studentId]; // Remove from map to avoid re-saving
                    } else {
                        // Overwrite the existing record in the billingMap
                        updatedBillingMap[studentId] = {
                            ...updatedBillingMap[studentId],
                            _id: dbBilling._id // Retain the existing database _id
                        };
                    }
                }
            }
            
            // Prepare data for save or update
            const bulkOperations = [];
            
            // Add or update records in the database
            for (const studentId in updatedBillingMap) {
                const record = updatedBillingMap[studentId];
            
                if (record._id) {
                    // Update existing record
                    bulkOperations.push({
                        updateOne: {
                            filter: { _id: record._id },
                            update: { $set: record }
                        }
                    });
                } else {
                    // Insert new record
                    bulkOperations.push({
                        insertOne: {
                            document: record
                        }
                    });
                }
            }
            
            // Execute bulk operations
            if (bulkOperations.length > 0) {
                await billingModel.bulkWrite(bulkOperations);
            }
            
        }
        // const newInvoiceId = await super.create(body);
        return newInvoiceId;
    }

}