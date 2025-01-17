'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import ParentModel from "../../models/parent";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const parentModel = new ParentModel(db);
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await parentModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await parentModel.findInSchool(queryStringParameters, headers);
        }else{
          return await parentModel.findInSchool({}, headers);
        }

      case 'POST':

        return await parentModel.create(JSON.parse(body));

      case 'PUT':
        if (pathParameters && pathParameters.id) {
            return await parentModel.updateById(pathParameters.id, JSON.parse(body));
        }
      case 'DELETE':
        if (pathParameters && pathParameters.id) {
            return await parentModel.deleteById(pathParameters.id);
          }
      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};
