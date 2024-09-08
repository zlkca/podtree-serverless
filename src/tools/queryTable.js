const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

// Configure the AWS SDK to use DynamoDB Local
const client = new DynamoDBClient({
  region: 'us-east-1', // You can use any region
  endpoint: 'http://localhost:8000' // DynamoDB Local endpoint
});

const tableName = 'goals-dev'; // Replace with your table name
const userId = '100471422368927770526'; // Replace with the partition key value you want to query
const createdAtValue = 1622542800; // Replace with the sort key value to query (if applicable)

const queryTable = async () => {
  try {
    const queryCommand = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: '#userId = :userId', //  AND #createdAt = :createdAt
      ExpressionAttributeNames: {
        '#userId': 'userId',
        // '#createdAt': 'createdAt'
      },
      ExpressionAttributeValues: {
        ':userId': { S: userId },
        // ':createdAt': { N: createdAtValue.toString() } // Convert number to string
      }
    });

    const result = await client.send(queryCommand);
  } catch (err) {
    console.error('Error querying table:', err);
  }
};

queryTable();
