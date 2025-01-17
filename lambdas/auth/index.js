'use strict';

const { connectDB, getDBClient } = require("../../db/dbClient");
const { formatResponse } = require("../helper");
const { login, signup } = require("./helper");

const dbClient = getDBClient();
module.exports.handler = async (event) => {
  try {
    const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
    const {method, path} = requestContext.http;
    const db = await connectDB(dbClient);
    console.log({ requestContext, headers, body, pathParameters, queryStringParameters });

    switch (method) {
      case 'POST':
        if(path === '/login'){
          const rsp = await login(body);
          return formatResponse(200, rsp);
        }else if(path == '/signup'){
          try {
            return  await signup(body);
          }catch(e){
            console.log(e);
            return formatResponse(500, { message: e.error });
          }
        }else if(path == '/logout'){
          const { email, token } = JSON.parse(body);
          const rsp = await logout(db, email, token);
          return rsp;
        }else if(path == '/change-password'){
          const { email, password } = JSON.parse(body);
          const rsp = await changePassword(db, email, password);
          return rsp;
        }else if(path == '/reset-password'){
          const { email, password } = JSON.parse(body);
          const rsp = await resetPassword(db, email, password);
          return rsp;
        }else{
          return formatResponse(404, { message: 'Not found' });
        }
    }
  }catch (e) {
    console.log(e);
    return formatResponse(500, { message: 'Something went wrong' });
  }
};
