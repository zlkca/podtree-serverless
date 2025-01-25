'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import ApplicationModel from "../../models/application";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const applicationModel = new ApplicationModel(db);
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await applicationModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await applicationModel.findInSchool(queryStringParameters, headers);
        }else{
          return await applicationModel.findInSchool({}, headers);
        }

      case 'POST':
        if(path === '/batch-applications'){
          return await applicationModel.batchCreate(JSON.parse(body));
        }else{
          return await applicationModel.create(JSON.parse(body));
        }

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          return await applicationModel.updateById(pathParameters.id, JSON.parse(body));
        }

      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          return await applicationModel.deleteById(pathParameters.id);
        }
      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};

