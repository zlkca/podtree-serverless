'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import ChargeModel from "../../models/charge";
import ChargePlanModel from "../../models/chargePlan";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const chargePlanModel = new ChargePlanModel(db);
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await chargePlanModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await chargePlanModel.findInSchool(queryStringParameters, headers);
        }else{
          return await chargePlanModel.findInSchool({}, headers);
        }

      case 'POST':
        if(path === '/search/chargePlans'){
          const query = JSON.parse(body);
          return await chargePlanModel.findInSchool(query, headers);
        }else if(path === '/batchChargePlans'){
          const instances = await chargePlanModel.batchCreate(db, JSON.parse(body), headers);
          if(instances && instances.length > 0){
            const chargeModel = new ChargeModel(db);
            return await chargeModel.insertMany(instances);
          }else{
            return [];
          }

        }else {
          return await chargePlanModel.create(JSON.parse(body));
        }

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          return await chargePlanModel.updateById(pathParameters.id, JSON.parse(body));
        }
      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          return await chargePlanModel.deleteById(pathParameters.id);
        }
      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};


