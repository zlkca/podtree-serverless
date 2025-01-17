import BaseModel from "./base.js";

export default class SchoolModel extends BaseModel {
    constructor(db) {
      super(db, 'schools');
    }

    async create(body){
        const school = await super.findOne({ name: body.name});
        if(school){
            return null;
        }else{
            const newSchoolId = await super.create(body);
            return newSchoolId;
        }
    }
}