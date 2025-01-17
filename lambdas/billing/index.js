'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import BillingModel from "../../models/billing";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const billingModel = new BillingModel(db);
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await billingModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await billingModel.findInSchool(queryStringParameters, headers);
        }else{
          return await billingModel.findInSchool({}, headers);
        }

      case 'POST':
        if(path === '/search/billings'){
            const query = JSON.parse(body);
            return await billingModel.findInSchool(query, headers);
        }else{
            return await billingModel.create(JSON.parse(body));
        }

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          return await billingModel.updateById(pathParameters.id, JSON.parse(body));
        }
      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          return await billingModel.deleteById(pathParameters.id);
        }
      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};
