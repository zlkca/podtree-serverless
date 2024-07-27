// import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require("@aws-sdk/client-apigatewaymanagementapi");
exports.handler = async function(event) {
    const {requestContext: {routeKey, domainName, stage, connectionId}} = event;
    let code = 1;
    console.log({event})

    if (routeKey === "$connect") {
        // Connect Route
        return {
            statusCode: 200,
            body: JSON.stringify(
                {
                    message: 'Connect',
                    input: event,
                }
            ),
        };
    }

    if (routeKey === "$disconnect") {
        // Disconnect Route
        return {
            statusCode: 200,
            body: JSON.stringify(
                {
                    message: 'Disconnect',
                    input: event,
                }
            ),
        };
    }
    const url = `https://${domainName}/${stage}`;
    const apiClient = new ApiGatewayManagementApiClient({
        apiVersion: '2018-11-29',
        endpoint: url,
    })
    await apiClient.send(new PostToConnectionCommand(
        {
          ConnectionId: connectionId, // connectionId of the receiving ws-client
          Data: JSON.stringify({
            from: connectionId,
            data: "hello websocket"
          }),
        }
    ));
    // switch(requestContext.routeKey){
    //     case '$connect':
    //         break;
    //     case '$disconnect':
    //         break;
    //     case 'default':
    //     default:
    //         code = 200;
    // }
    return {statusCode: code, event};
}