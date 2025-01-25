import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({region: 'us-east-1'});

export async function invokeFunction(functionName, payload) {
  try {
      const input = {
          FunctionName: functionName, 
          InvocationType: "Event", 
          Payload: Buffer.from(JSON.stringify(payload), "utf8"),
      };
      const command = new InvokeCommand(input);
      const res  = await lambdaClient.send(command);
  } catch (e) {
    console.log("error triggering function", e);
  }
}

export const formatResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "https://admin.podtree.ca",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
    },
    body: JSON.stringify(body),
});

