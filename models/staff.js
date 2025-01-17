import BaseModel from "./base.js";

export default class StaffModel extends BaseModel {
    constructor(db) {
      super(db, 'staffs');
    }

    async create(body){
        const staff = await super.findOne({ email: body.email});
        if(staff){
            return null;
        }else{
            const newStaffId = await super.create(body);
            return newStaffId;
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