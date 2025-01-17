import BaseModel from "./base.js";

export default class ChargeModel extends BaseModel {
    constructor(db) {
      super(db, 'charges');
    }

    async create(body){
        const newChargeId = await super.create(body);
        return newChargeId;
    }

}