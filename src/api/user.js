const {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { DynamoDBCfg } = require("../const");

const tableName = "users-dev";

function setUserRoutes(app) {
  app.post("/users", async (req, res) => {
    res.status(200).json({ message: "users" });
  });
  app.get("/users", async (req, res) => {
    res.send([]);
  });
  app.patch("/users", async (req, res) => {
    res.status(200).json({ message: "users" });
  });
  app.delete("/users", async (req, res) => {
    res.status(200).json({ message: "users" });
  });
};
  
async function findUser(userId){
  const client = new DynamoDBClient(DynamoDBCfg);
  if (userId) {
    const params = {
      TableName: tableName,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": { S: userId },
      },
    };

    try {
      const data = await client.send(new QueryCommand(params));
      return data.Items.find((it) => unmarshall(it));
    } catch (err) {
      return;
    }
  } else {
    return;
  }
}

async function saveUser(userId, body) {
  const client = new DynamoDBClient(DynamoDBCfg);
  if (userId) {
    const createdAt = new Date().getTime().toString();
    const params = {
      TableName: tableName,
      Item: {
        id: { S: userId }, // The key must be a string for the local DynamoDB
        name: { S: body.name },
        email: { S: body.email ?? "" },
        picture: { S: body.picture ?? "" },
        createdAt: { N: createdAt },
      },
    };

    try {
      await client.send(new PutItemCommand(params));
    } catch (err) {
      console.error("Error inserting item:", err);
    }
  } else {
    console.error("Error inserting item: no userId");
  }
}

module.exports = {
  findUser,
  saveUser,
  setUserRoutes,
}
