const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

// Configure the AWS SDK to use DynamoDB Local
const client = new DynamoDBClient({
  // region: 'us-east-1', // You can use any region
  endpoint: 'http://localhost:8000' // DynamoDB Local endpoint
});

const tableName = 'goals-dev'; // Replace with your table name

const createTable = async () => {
  try {
    const createTableCommand = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },  // Partition key
        { AttributeName: 'startAt', KeyType: 'RANGE' }
        // { AttributeName: 'createdAt', KeyType: 'RANGE' } // Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' }, // String type
        { AttributeName: 'startAt', AttributeType: 'N' },
        // { AttributeName: 'createdAt', AttributeType: 'N' } // Number type
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    const result = await client.send(createTableCommand);
    console.log('Table created successfully:', result);
  } catch (err) {
    console.error('Error creating table:', err);
  }
};

createTable();
