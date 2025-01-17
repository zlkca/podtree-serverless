'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import StudentModel from "../../models/student";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const studentModel = new StudentModel(db);
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await studentModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await studentModel.findInSchool(queryStringParameters, headers);
        }else{
          return await studentModel.findInSchool({}, headers);
        }

      case 'POST':
        console.log('POST', JSON.parse(body));
        return await studentModel.createWithParent(db, JSON.parse(body));

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          return await studentModel.updateById(pathParameters.id, JSON.parse(body));
        }
      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          return await studentModel.deleteById(pathParameters.id);
        }

      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};

