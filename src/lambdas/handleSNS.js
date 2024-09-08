const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require("@aws-sdk/client-apigatewaymanagementapi");
const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

exports.handler = async function(event) {
    const { Records } = event;
    const snsMessage = Records[0].Sns.Message;

    // Initialize DynamoDB client
    const dynamoDBClient = new DynamoDBClient();

    const params = {
        TableName: "users-dev",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": { S: "123" },
        },
      };
    

    try {
        const result = await dynamoDBClient.send(new QueryCommand(params));
        const activeConnectionIds = result.Items.map(item => item.connectionId.S);

        // Initialize API Gateway Management API client
        const url = `https://${result.Items[0].domainName.S}/${result.Items[0].stage.S}`;
        const apiClient = new ApiGatewayManagementApiClient({
            apiVersion: '2018-11-29',
            endpoint: url,
        });

        // Send message to active connections
        for (const connectionId of activeConnectionIds) {
            await apiClient.send(new PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: JSON.stringify({
                    message: snsMessage,
                }),
            }));
        }
    } catch (err) {
        console.error("Error sending messages to WebSocket connections:", err);
    }
}