'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import SchoolModel from "../../models/school";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const schoolModel = new SchoolModel(db);
    console.log({pathParameters, queryStringParameters});
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await schoolModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await schoolModel.find({...queryStringParameters});
        }else{
          return await schoolModel.find({});
        }

      case 'POST':
        if(path === '/search/schools'){
            const query = JSON.parse(body);
            return await schoolModel.find({...query});
        }else{
            return await schoolModel.create(JSON.parse(body));
        }

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          return await schoolModel.updateById(pathParameters.id, JSON.parse(body));
        }

      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          return await schoolModel.deleteById(pathParameters.id);
        }
      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};

