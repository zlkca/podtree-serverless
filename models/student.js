import { ObjectId } from "mongodb";
import BaseModel from "./base.js";
import ParentModel from "./parent.js";
import { formatPhoneNumber } from "../utils/index.js";

export default class StudentModel extends BaseModel {
    constructor(db) {
      super(db, 'students');
    }

    async create(body){
        const student = await super.findOne({ email: body.email});
        if(student){
            return null;
        }else{
            const newStudentId = await super.create(body);
            return newStudentId;
        }
    }

    async createWithParent(db, body){
        const student = await super.findById(body._id);
        if(student){
            return null;
        }else{
            if(body.contacts && body.contacts.length > 0){
                const parentModel = new ParentModel(db);
                const school = body.school;
                const contacts = [];

                for(let i = 0; i < body.contacts.length; i++){
                    const contact = body.contacts[i];
                    contact.phone = formatPhoneNumber(contact.phone);

                    if(contact.id){ // the id could be existing _id or random UI id
                        let parent = null;
                        if(ObjectId.isValid(contact.id)){
                            parent = await parentModel.findById(contact.id);
                        }

                        if(parent) { // fix me: email should not be updated
                            const updatedContact = { ...contact};
                            delete updatedContact.id;
                            await parentModel.updateById(contact.id, updatedContact);
                            contacts.push({id: contact.id, stripeCustomerId: parent.stripeCustomerId, status: parent.status, school, ...updatedContact});
                            if(contact.isPayingContact){
                                body.payingContact = {...parent, _id: parent._id.toString(), school, ...updatedContact};
                            }
                        }else{
                            const newContact = {firstName: contact.firstName, lastName: contact.lastName, email: contact.email, phone: contact.phone, school, status: 'unverified', isPayingContact: contact.isPayingContact};
                            const newParentId = await parentModel.create(newContact);
                            if(newParentId){
                                contacts.push({id: newParentId, ...newContact});
                                if(contact.isPayingContact){
                                    body.payingContact = {_id: newParentId.toString(), ...newContact};
                                }
                            }
                        }
                    }
                }
            }
            const newStudentId = await super.create(body);
            return newStudentId;
        }
    }


// export async function createStudent(db, body){
//     const model = new StudentModel(db);
//     const student = await model.findOne({ _id: body._id, birthday: body.birthday});
//     if(student){
//         return null;
//     }else{
//         if(body.contacts && body.contacts.length > 0){
//             const parentModel = new ParentModel(db);
//             const contacts = [];
            
//             for(let i = 0; i < body.contacts.length; i++){
//                 const contact = body.contacts[i];
//                 contact.phone = formatPhoneNumber(contact.phone);
                
//                 if(contact.id){
//                     let parent = null;
//                     if(ObjectId.isValid(contact.id)){
//                         const _id = ObjectId.createFromHexString(contact.id);
//                         parent = await parentModel.findOne({_id});
//                     }
                    
//                     if(parent) { // fix me email should not be updated
//                         const updatedContact = { ...contact};
//                         delete updatedContact.id;
//                         await parentModel.updateById(contact.id, updatedContact);
//                         contacts.push({id: contact.id, stripeCustomerId: parent.stripeCustomerId, status: parent.status, ...updatedContact});
//                         if(contact.isPayingContact){
//                             body.payingContact = {...parent, _id: parent._id.toString(), ...updatedContact};
//                         }
//                     }else{
//                         const newContact = {firstName: contact.firstName, lastName: contact.lastName, email: contact.email, phone: contact.phone,  status: 'unverified', isPayingContact: contact.isPayingContact};
//                         const newParentId = await parentModel.create(newContact);
//                         contacts.push({id: newParentId, ...newContact});
//                         if(contact.isPayingContact){
//                             body.payingContact = {_id: newParentId.toString(), ...newContact};
//                         }
//                     }
//                 }
//             }
//             // const ps = await parentModel.find({ _id: {$in: body.parents.map(pid => ObjectId.createFromHexString(pid))}});
//             // body.parents = ps.map(p => ({_id: p._id.toString(), firstName: p.firstName, lastName: p.lastName}));
//             // const pp = ps[0]; // fix me !!! ps.find(p => p.primary)[0];
//             // body.primaryParent = {_id: pp._id.toString(), firstName: pp.firstName, lastName: pp.lastName, stripeCustomerId: pp.stripeCustomerId};
//         }

//         const newStudentId = await model.create(body);
//         return newStudentId;
//     }
// }


// export async function updateStudent(db, id, body){
//     const model = new StudentModel(db);

//     if(body.contacts && body.contacts.length > 0){
//         const parentModel = new ParentModel(db);
//         const contacts = [];
        
//         for(let i = 0; i < body.contacts.length; i++){
//             const contact = body.contacts[i];
//             contact.phone = formatPhoneNumber(contact.phone);
            
//             if(contact.id){
//                 let parent = null;
//                 if(ObjectId.isValid(contact.id)){
//                     const _id = ObjectId.createFromHexString(contact.id);
//                     parent = await parentModel.findOne({_id});
//                 }
                
//                 if(parent) { // fix me email should not be updated
//                     const updatedContact = { ...contact};
//                     delete updatedContact.id;
//                     await parentModel.updateById(contact.id, updatedContact);
//                     contacts.push({id: contact.id, stripeCustomerId: parent.stripeCustomerId, ...updatedContact});
//                     if(contact.isPayingContact){
//                         body.payingContact = {...parent, _id: parent._id.toString(), ...updatedContact};
//                     }
//                 }else{
//                     const newContact = {firstName: contact.firstName, lastName: contact.lastName, email: contact.email, phone: contact.phone, isPayingContact: contact.isPayingContact};
//                     const newParentId = await parentModel.create(newContact);
//                     contacts.push({id: newParentId, ...newContact});
//                     if(contact.isPayingContact){
//                         body.payingContact = {_id: newParentId.toString(), status: 'unverified', ...newContact};
//                     }
//                 }
//             }
//         }
//         // const ps = await parentModel.find({ _id: {$in: body.parents.map(pid => ObjectId.createFromHexString(pid))}});
//         // body.parents = ps.map(p => ({_id: p._id.toString(), firstName: p.firstName, lastName: p.lastName}));
//         // const pp = ps[0]; // fix me !!! ps.find(p => p.primary)[0];
//         // body.primaryParent = {_id: pp._id.toString(), firstName: pp.firstName, lastName: pp.lastName, stripeCustomerId: pp.stripeCustomerId};
//     }
//     delete body._id;
//     const newStudentId = await model.updateById(id, body);
//     return newStudentId;
// }
}