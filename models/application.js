import BaseModel from "./base.js";

export default class ApplicationModel extends BaseModel {
    constructor(db) {
      super(db, 'applications');
    }

    async create(body){
        console.log({body})
        const application = await super.findOne({ 'student._id': body.student._id, 'program._id': body.program._id});
        if(application){
            return null;
        }else{
            const newApplicationId = await super.create(body);
            return newApplicationId;
        }
    }
}