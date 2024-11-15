import { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand, DeleteItemCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBCfg } from "../const.js";

const tableName = "goals-dev";

async function batchSaveGoals(goals) {
  const client = new DynamoDBClient(DynamoDBCfg);
  // const marshalled = goals.map((item) => ({ PutRequest: { Item: marshall(item) } }));
  // const params = {
  //   RequestItems: {
  //     [tableName]: marshalled,
  //   },
  // };
  const params = {
    RequestItems: {
      [tableName]: goals.map((goal) => ({
        PutRequest: {
          Item: marshall(goal),
        },
      })),
    },
  };

  try {
    const data = await client.send(new BatchWriteItemCommand(params));
    console.log("Batch write successful:", data);
  } catch (err) {
    console.error("Error writing batch items:", err);
  }
}

export function setGoalRoutes(app) {
  app.post("/goals", async (req, res) => {
    // console.log('received event:', JSON.stringify(req, null, 2))
    console.log({ post_goals: req.body });
    console.log({ userId: req.get("UserId") });
    const userId = req.get("UserId");
    const body = req.body;
    const client = new DynamoDBClient(DynamoDBCfg);
    if (userId) {
      const createdAt = new Date().getTime();
      const item = {
        userId,
        name: body.name, 
        categories: body.categories.map(category => ({name: category, status: 'active'})),
        type: 'custom',
        status: 'active',
        notes: body.notes,
        startAt: body.startAt,
        endAt: body.endAt,
        createdAt
      };
      const params = {
        TableName: tableName,
        Item: marshall(item),
      };

      try {
        const data = await client.send(new PutItemCommand(params));
        console.log("Item inserted successfully:", data);
      } catch (err) {
        console.error("Error inserting item:", err);
      }
      // const response = {
      //   statusCode: 200,
      //   headers: {
      //     'Access-Control-Allow-Origin': '*',
      //     'Access-Control-Allow-Credentials': false,
      //   },
      //   body: JSON.stringify({ message: 'post goal sucessfully !' }),
      // }
      res.send({ message: "post goal sucessfully !" });
    } else {
      res.status(403).send();
    }
    // res.send({ message: "post goal sucessfully !" });
  });

  app.get("/goals", async (req, res) => {
    console.log({ userId: req.get("UserId") });
    const client = new DynamoDBClient(DynamoDBCfg);
    const userId = req.get("UserId");
    if (userId) {
      const params = {
        TableName: tableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": { S: userId },
        },
      };

      try {
        const data = await client.send(new QueryCommand(params));
        res.send(data.Items.map((it) => unmarshall(it)));
      } catch (err) {
        console.error("Error querying items:", err);
        res.status(500).send(err);
      }
    } else {
      res.status(403).send();
    }
    // res.send([
    //   {
    //     name: "goal 1",
    //     createdAt: 123,
    //   },
    //   {
    //     name: "goal 2",
    //     createdAt: 456,
    //   },
    // ]);
  });

  app.patch("/goals/:id", async (req, res) => {
    const id = req.params.id;
    const startAt = id.split("-")[1];
    const userId = req.get("UserId");
    const body = req.body;
    console.log({ body: req.body });

    const client = new DynamoDBClient(DynamoDBCfg);
    if (userId) {
      const params = {
        TableName: tableName,
        Key: {
          userId: { S: userId }, // Partition key
          startAt: { N: startAt.toString() }, // Sort key
        },
        UpdateExpression:
          "SET #nm = :name, notes = :notes,  #sts = :status", // categories = :categories,
        ExpressionAttributeValues: {
          ":name": { S: body.name },
          // ":categories": { L: body.categories.map(category => marshall(category)) },
          ":notes": { S: body.notes ?? "" },
          ":status": { S: body.status ?? "active" },
        },
        ExpressionAttributeNames: {
          "#nm": "name", // Map '#nm' to the actual attribute name 'name'
          "#sts": "status",
        },
        ReturnValues: "UPDATED_NEW",
      };
      console.log({ params });
      try {
        const data = await client.send(new UpdateItemCommand(params));
        console.log("Item updated successfully:", data);
        res.send(data);
      } catch (err) {
        console.error("Error updating item:", err);
        res.status(500).send(err);
      }
    } else {
      res.status(403).send();
    }
  });

  app.delete("/goals/:id", async (req, res) => {
    const client = new DynamoDBClient(DynamoDBCfg);
    const id = req.params.id;
    const startAt = id.split("-")[1];
    const userId = req.get("UserId");

    if (userId) {
      const params = {
        TableName: tableName,
        Key: {
          userId: { S: userId }, // Partition key
          startAt: { N: startAt }, // Sort key
        },
      };

      const deleteItemCommand = new DeleteItemCommand(params);
      const data = await client.send(deleteItemCommand);
      res.send(data);
    } else {
      res.status(403).send();
    }
  });
}
export async function generateGoals(userId){
  const createdAt = new Date().getTime();
      const goals = [
        {
          userId,
          name: 'Daily work and job', 
          categories: [
            {name: "Wealth", status: 'active', percentage: 33},
            {name: "Growth", status: 'active', percentage: 33},
            {name: "Purpose", status: 'active', percentage: 33}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Focus on improving skills, aligning work with long-term financial goals.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Build a side project', 
          categories: [
            {name: "Wealth", status: 'active', percentage: 25},
            {name: "Growth", status: 'active', percentage: 25},
            {name: "Purpose", status: 'active', percentage: 25},
            {name: "Adventure", status: 'active', percentage: 25}
          ], 
          type:'template',
          status:'active',
          notes: 'Work on a side project to generate income and learn new skills.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Travel with family', 
          categories: [
            {name: "Family", status: 'active', percentage: 33},
            {name: "Adventure", status: 'active', percentage: 33},
            {name: "Peace", status: 'active', percentage: 33}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Plan and take family trips to create bonding and explore new experiences.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Invest in personal development', 
          categories: [
            {name: "Growth", status: 'active', percentage: 33},
            {name: "Purpose", status: 'active', percentage: 33},
            {name: "Wisdom", status: 'active', percentage: 33}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Enroll in courses and engage in learning for personal growth.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Start a fitness routine', 
          categories: [
            {name: "Health", status: 'active', percentage: 50},
            {name: "Growth", status: 'active', percentage: 25},
            {name: "Purpose", status: 'active', percentage: 25}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Engage in regular exercise to improve physical and mental health.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Build meaningful relationships', 
          categories: [
            {name: "Love", status: 'active', percentage: 33},
            {name: "Family", status: 'active', percentage: 33},
            {name: "Contribution", status: 'active', percentage: 33}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Foster strong, meaningful connections with friends and loved ones.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Practice mindfulness', 
          categories: [
            {name: "Peace", status: 'active', percentage: 33},
            {name: "Wisdom", status: 'active', percentage: 33},
            {name: "Health", status: 'active', percentage: 33}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Incorporate mindfulness and meditation into daily life for mental well-being.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Explore new hobbies', 
          categories: [
            {name: "Adventure", status: 'active', percentage: 33},
            {name: "Growth", status: 'active', percentage: 33},
            {name: "Purpose", status: 'active', percentage: 33}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Try new activities and hobbies to enrich life experiences.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Volunteer for a cause', 
          categories: [
            {name: "Contribution", status: 'active', percentage: 50},
            {name: "Purpose", status: 'active', percentage: 25},
            {name: "Love", status: 'active', percentage: 25}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Contribute time to help a cause you are passionate about.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Read for wisdom', 
          categories: [
            {name: "Wisdom", status: 'active', percentage: 50},
            {name: "Growth", status: 'active', percentage: 25},
            {name: "Purpose", status: 'active', percentage: 25}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Read books that offer valuable life lessons and knowledge.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Work on personal branding', 
          categories: [
            {name: "Growth", status: 'active', percentage: 33},
            {name: "Purpose", status: 'active', percentage: 33},
            {name: "Wealth", status: 'active', percentage: 33}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Develop your personal brand for career and business growth.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Plan a digital detox', 
          categories: [
            {name: "Peace", status: 'active', percentage: 50},
            {name: "Health", status: 'active', percentage: 25},
            {name: "Adventure", status: 'active', percentage: 25}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Take regular breaks from technology for mental clarity.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Write a personal memoir', 
          categories: [
            {name: "Peace", status: 'active', percentage: 33},
            {name: "Wisdom", status: 'active', percentage: 33},
            {name: "Purpose", status: 'active', percentage: 33}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Reflect on life experiences and document personal growth and insights.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Plan and track life goals', 
          categories: [
            {name: "Purpose", status: 'active', percentage: 33},
            {name: "Growth", status: 'active', percentage: 33},
            {name: "Peace", status: 'active', percentage: 33}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Set life goals, create actionable plans, and track progress regularly.',
          endAt: createdAt,
          createdAt
        },
        {
          userId,
          name: 'Home improvment', 
          categories: [
            {name: "Peace", status: 'active', percentage: 33},
            {name: "Health", status: 'active', percentage: 33},
            {name: "Contribution", status: 'active', percentage: 33}
          ], 
          type: 'template',
          status: 'active',
          notes: 'Maintain the home for relaxation and improving the environment.',
          endAt: createdAt,
          createdAt
        }
      ];

      const dt = new Date();
      const goalsWithStartAt = goals.map(it => {
        dt.setHours(dt.getHours() + 1);
        return {
        ...it,
        startAt: dt.getTime(),
      }})
      await batchSaveGoals(goalsWithStartAt);
}

