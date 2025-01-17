import BaseModel from "./base.js";

export default class ProgramModel extends BaseModel {
    constructor(db) {
      super(db, 'programs');
    }

    async create(body){
        const program = await super.findOne({ email: body.email});
        if(program){
            return null;
        }else{
            const newProgramId = await super.create(body);
            return newProgramId;
        }
    }

}