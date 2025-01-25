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

    async batchCreate(body){
        console.log({body});
        const applications = [];
        // const application = await super.findOne({ 'student._id': body.student._id, 'program._id': body.program._id});
        body.students.map(student => {
            const parent = student.payingContact;
            applications.push({
                student: { _id: student._id, firstName: student.firstName, lastName: student.lastName, birthday: student.birthday },
                parent: { _id: parent._id, firstName: parent.firstName, lastName: parent.lastName, email: parent.email, stripeCustomerId: parent.stripeCustomerId },
                program: body.program,
                planStartDate: body.planStartDate,
                status: 'pending',
                school: student.school
            });
        })
        if(applications && applications.length > 0){
            return await super.insertMany(applications);
        }else{
            return null;
        }
    }
}