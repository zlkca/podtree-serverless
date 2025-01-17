import BaseModel from "./base.js";

export default class InvoiceModel extends BaseModel {
    constructor(db) {
      super(db, 'invoices');
    }

    async create(body){
        const invoice = await super.findOne({ email: body.email});
        if(invoice){
            return null;
        }else{
            const newInvoiceId = await super.create(body);
            return newInvoiceId;
        }
    }

}