'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import ChargeModel from "../../models/charge";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const chargeModel = new ChargeModel(db);
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await chargeModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await chargeModel.findInSchool(queryStringParameters, headers);
        }else{
          return await chargeModel.findInSchool({}, headers);
        }

      case 'POST':
        if(path === '/search/charges'){
            const query = JSON.parse(body);
            return await chargeModel.findInSchool(query, headers);
        }else{
            return await chargeModel.create(JSON.parse(body));
        }

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          return await chargeModel.updateById(pathParameters.id, JSON.parse(body));
        }
      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          return await chargeModel.deleteById(pathParameters.id);
        }
      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};

