import { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBCfg } from "../const.js";

const tableName = "users-dev";

export function setUserRoutes(app) {
  app.post("/users", async (req, res) => {
    res.status(200).json({ message: "users" });
  });
  app.get("/users/:id", async (req, res) => {
    const id = req.params.id;
    const user = await findUser(id);
    res.status(200).json(user);
  });
  app.patch("/users/:id", async (req, res) => {
    const id = req.params.id;
    const rsp = await patchUser(id, req.body);
    res.status(200).json(rsp);
  });

  app.put("/users", async (req, res) => {
    const id = req.params.id;
    await patchUser(id, req.body);
    res.status(200).json({ message: "users" });
  });
  app.delete("/users", async (req, res) => {
    const id = req.params.id;
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() + 30);
    const rsp = await patchUser(id, {status: 'pending_deletion', deleteTime: deleteDate.getTime()});
    res.status(200).json(rsp);
  });
};
  
export async function findUser(userId){
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
      const unmarshalledArray = data.Items.map((it) => unmarshall(it));
      return unmarshalledArray && unmarshalledArray.length > 0 ? unmarshalledArray[0] : null;
    } catch (err) {
      console.error("Error querying items:", err);
      return;
    }
  } else {
    return;
  }
}

export async function saveUser(userId, body) {
  const client = new DynamoDBClient(DynamoDBCfg);
  console.log({userId});
  if (userId != null) {
    const createdAt = new Date().getTime().toString();
    const params = {
      TableName: tableName,
      Item: {
        id: { S: userId }, // The key must be a string for the local DynamoDB
        name: { S: body.name },
        email: { S: body.email ?? "" },
        picture: { S: body.picture ?? "" },
        status: { S: 'active'},
        createdAt: { N: createdAt },
      },
    };

    try {
      await client.send(new PutItemCommand(params));
    } catch (err) {
      console.error("Error inserting item:", err);
      throw err;
    }
  } else {
    console.error("Error inserting item: no userId");
    throw new Error("no userId when save user");
  }
}

async function patchUser(userId, updates) {
  const client = new DynamoDBClient(DynamoDBCfg);

  if (!userId) {
    throw new Error("No userId provided for updating user");
  }

  // Create the update expression and attribute values dynamically
  let updateExpression = "SET ";
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updates).forEach((key, index) => {
    const attributeName = `#attr${index}`;
    const attributeValue = `:val${index}`;
    
    updateExpression += `${index > 0 ? ', ' : ''}${attributeName} = ${attributeValue}`;
    expressionAttributeNames[attributeName] = key;
    expressionAttributeValues[attributeValue] = { S: updates[key].toString() };
  });

  // Always update the updatedAt timestamp
  updateExpression += ", #updatedAt = :updatedAt";
  expressionAttributeNames["#updatedAt"] = "updatedAt";
  expressionAttributeValues[":updatedAt"] = { N: new Date().getTime().toString() };

  const params = {
    TableName: tableName,
    Key: {
      id: { S: userId }
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  };

  try {
    const command = new UpdateItemCommand(params);
    const response = await client.send(command);
    return unmarshall(response.Attributes);
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
}


