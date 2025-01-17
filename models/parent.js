import BaseModel from "./base.js";

export default class ParentModel extends BaseModel {
    constructor(db) {
      super(db, 'parents');
    }

    async create(body){
        const parent = await super.findOne({ email: body.email});
        if(parent){
            return null;
        }else{
            const newParentId = await super.create(body);
            return newParentId;
        }
    }

    async findInSchool(query, headers){
        if(query.userId){
            return await super.find({userId: query.userId});
        }else{
            return await super.findInSchool(query, headers);
        }
    }
}