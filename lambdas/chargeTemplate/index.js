'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import ChargeTemplateModel from "../../models/chargeTemplate";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const chargeTemplateModel = new ChargeTemplateModel(db);
    console.log({headers});
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await chargeTemplateModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await chargeTemplateModel.findInSchool(queryStringParameters, headers);
        }else{
          return await chargeTemplateModel.findInSchool({}, headers);
        }

      case 'POST':
        if(path === '/search/chargeTemplates'){
            const query = JSON.parse(body);
            return await chargeTemplateModel.findInSchool(query, headers);
        }else{
            return await chargeTemplateModel.create(JSON.parse(body));
        }

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          return await chargeTemplateModel.updateById(pathParameters.id, JSON.parse(body));
        }
      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          return await chargeTemplateModel.deleteById(pathParameters.id);
        }
      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};

