'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import ProgramModel from "../../models/program";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const programModel = new ProgramModel(db);
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await programModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await programModel.findInSchool(queryStringParameters, headers);
        }else{
          return await programModel.findInSchool({}, headers);
        }

      case 'POST':
        return await programModel.create(JSON.parse(body));

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          return await programModel.updateById(pathParameters.id, JSON.parse(body));
        }
      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          return await programModel.deleteById(pathParameters.id);
        }
      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};
