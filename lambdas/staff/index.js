'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import StaffModel from "../../models/staff";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const staffModel = new StaffModel(db);
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await staffModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await staffModel.findInSchool(queryStringParameters, headers);
        }else{
          return await staffModel.findInSchool({}, headers);
        }

      case 'POST':
        return await staffModel.create(JSON.parse(body));

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          return await staffModel.updateById(pathParameters.id, JSON.parse(body));
        }
      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          return await staffModel.deleteById(pathParameters.id);
        }
      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};
