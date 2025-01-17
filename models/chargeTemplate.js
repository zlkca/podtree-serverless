import BaseModel from "./base.js";

export default class ChargeTemplateModel extends BaseModel {
    constructor(db) {
      super(db, 'charge-templates');
    }

    async create(body){
        const newChargeTemplateId = await super.create(body);
        return newChargeTemplateId;
    }
}