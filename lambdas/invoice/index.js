'use strict';

import { connectDB, getDBClient } from "../../db/dbClient";
import InvoiceModel from "../../models/invoice";
import { formatResponse } from "../helper";

const dbClient = getDBClient();

export const handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    const invoiceModel = new InvoiceModel(db);
    switch (method) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await invoiceModel.findById(pathParameters.id);
        }else if(queryStringParameters){
          return await invoiceModel.findInSchool(queryStringParameters, headers);
        }else{
          return await invoiceModel.findInSchool({}, headers);
        }

      case 'POST':
        if(path === '/search/invoices'){
            const query = JSON.parse(body);
            return await invoiceModel.findInSchool(query, headers);
        }else{
            return await invoiceModel.create(JSON.parse(body));
        }

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          return await invoiceModel.updateById(pathParameters.id, JSON.parse(body));
        }
      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          return await invoiceModel.deleteById(pathParameters.id);
        }
      default:
        return formatResponse(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { error: 'Internal Server Error' });
  }
};
