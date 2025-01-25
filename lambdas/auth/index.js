'use strict';

const { connectDB, getDBClient } = require("../../db/dbClient");
const { default: StaffModel } = require("../../models/staff");
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
            console.log("signup", body);
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
      case 'GET':
        if(path === '/verifySignup'){
          const staffModel = new StaffModel(db);
          console.log('verify signup');
          console.log({queryStringParameters})
          const userId = queryStringParameters.userId;
          const code = queryStringParameters.passcode;
          await staffModel.verifySignup(code, userId);
          return {
            statusCode: 302, // HTTP status for redirection
            headers: {
                Location: 'https://admin.podtree.ca/login', // Redirect URL
            },
            body: null,
        };
        }
    }
  }catch (e) {
    console.log(e);
    return formatResponse(500, { message: 'Something went wrong' });
  }
};

