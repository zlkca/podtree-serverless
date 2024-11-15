import { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { getUnixTime, generateRecurringDates } from "../utils.js";
import { DynamoDBCfg } from "../const.js";
import { getWeekdayIndex } from "../utils.js";

const tableName = "tasks-dev";
const recurringTableName = "recurring-tasks-dev";

class RecurringTaskKey {
  constructor(userId, startAt) {
    this.pk = userId;
    this.sk = startAt;
  }

  marshall() {
    return {
      userId: { S: this.pk },
      startAt: { N: this.sk.toString() },
    };
  }
}

// async function getRecurringTasks(userId, query) {
//   const { start, end } = query;
//   const params = end ? {
//     TableName: recurringTableName,
//     KeyConditionExpression:
//       "userId = :userId AND startAt BETWEEN :start AND :end",
//     ExpressionAttributeValues: {
//       ":userId": { S: userId },
//       ":start": { N: start ? start.toString() : "0" },
//       ":end": { N: end ? end.toString() : "0" },
//     },
//   }
//   : {
//     TableName: recurringTableName,
//     KeyConditionExpression: "userId = :userId AND startAt <= :start",
//     ExpressionAttributeValues: {
//       ":userId": { S: userId },
//       ":start": { N: start ? start.toString() : "0" },
//     },
//   };

//   try {
//     const client = new DynamoDBClient(DynamoDBCfg);
//     const data = await client.send(new QueryCommand(params));
//     if (data.Items.length > 0) {
//       return data.Items.map((it) => unmarshall(it));
//     } else {
//       return [];
//     }
//   } catch (err) {
//     console.error("Error querying items:", err);
//     return [];
//   }
// }

// latestStartAt
// async function patchRecurringTask(key, latestStartAt) {
//   const params = {
//     TableName: recurringTableName,
//     Key: key.marshall(),
//     UpdateExpression: "SET latestStartAt = :latestStartAt",
//     // ExpressionAttributeNames: {
//     //   "latestStartAt": "latestStartAt",
//     // },
//     ExpressionAttributeValues: {
//       ":latestStartAt": { N: latestStartAt.toString() },
//     },
//   };
//   const client = new DynamoDBClient(DynamoDBCfg);
//   await client.send(new UpdateItemCommand(params));
// }

async function genRecurringTaskInstances(
  key, // RecurringTaskKey
  startAt,
  endAt,
  endAtEnabled,
  name,
  categories,
  goal,
  duration,
  frequency,
  unit,
  weekdays
) {
  const dates = generateRecurringDates(
    startAt,
    endAt,
    parseInt(frequency),
    unit,
    weekdays
  );
  console.log({dates});

  const now = new Date();
  const client = new DynamoDBClient(DynamoDBCfg);

  for (let i = 0; i < dates.length; i++) {
    const payload = {
      userId: key.pk,
      type: "recurring",
      name,
      categories,
      goal,
      duration,
      completed: false,
      startAt: dates[i],
      endAt: dates[i],
      startedAt: 0,
      endedAt: 0,
      createdAt: getUnixTime(now.toISOString())
    };
    const params = {
      TableName: tableName,
      Item: marshall(payload)
    };
    await client.send(new PutItemCommand(params));
  }

  // if(!endAtEnabled){
  //   const nextLastStartAt = dates[dates.length - 1].toISOString();
  //   await patchRecurringTask(key, getUnixTime(nextLastStartAt));
  // }
}

async function queryTasks(userId, query, fields=[]) {
  const { start, end } = query;
  
  const params = start && end ? {
    TableName: tableName,
    KeyConditionExpression:
      "userId = :userId AND startAt BETWEEN :start AND :end",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
      ":start": { N: start? start.toString() : "0" },
      ":end": { N: end? end.toString() : "0" },
    },
  }
  :
  {
    TableName: tableName,
    KeyConditionExpression:
      "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": { S: userId }
    },
  };

  const client = new DynamoDBClient(DynamoDBCfg);
  const data = await client.send(new QueryCommand(params));
  if (data.Items.length > 0) {
    if(fields.length == 0){ // all fields
      return data.Items.map((it) => unmarshall(it));
    }else{
      return data.Items.map((it) => {
        const item = unmarshall(it);
        const filteredItem = {};
        fields.forEach((field) => {
          filteredItem[field] = item[field];
        });
        return filteredItem;
      });
    }
  } else {
    return [];
  }
}

export async function saveTask(userId, body) {
  const client = new DynamoDBClient(DynamoDBCfg);
  const createdAt = body.createdAt ? body.createdAt.toString() : "";
  const categories = body.categories ? JSON.stringify(body.categories) : "";
  const goal = body.goal ? body.goal : "";
  const startAt = body.startAt ?? "";
  const endAt = body.endAt ?? "";
  const duration = body.duration ? body.duration : "15m";
  const frequency = body.frequency ? body.frequency.toString() : "1";
  const unit = body.unit ? body.unit : "day";
  const weekdays = body.weekdays;
  const name = body.name ? body.name : "";
  const key = new RecurringTaskKey(userId, startAt);

  const payload = {
      userId,
      type: body.type ? body.type : "instance",
      name: name ,
      // notes: { S: body.notes? body.notes : "" },
      categories,
      goal,
      duration,
      unit,
      frequency,
      weekdays,
      endAtEnabled: body.endAtEnabled ? body.endAtEnabled : false ,
      completed: body.completed ? body.completed.toString : false,
      startAt: startAt,
      endAt,
      startedAt: startAt,
      endedAt: startAt,
      createdAt,
    };
  const params = {
    TableName: body.type === "recurring" ? recurringTableName : tableName,
    Item: marshall(payload),
  };
  try {
    await client.send(new PutItemCommand(params));// save recurring or instance
    
    if (body.type === "recurring") {
        await genRecurringTaskInstances(
          key,
          startAt, // utc timestamp
          endAt,
          body.endAtEnabled,
          name,
          categories,
          goal,
          duration,
          frequency,
          unit,
          JSON.parse(weekdays)
        );
    }
    return;
  } catch (err) {
    console.error("Error inserting item:", err);
    return;
  }
}

export function setTaskRoutes(app) {
  app.post("/tasks", async (req, res) => {
    const userId = req.get("UserId");
    const body = req.body;
    if (userId) {
      try {
        const data = await saveTask(userId, body);
        res.send(data);
      } catch (err) {
        console.error("Error inserting item:", err);
        res.status(500).send(err);
      }
    } else {
      res.status(403).send();
    }
  });

  app.get("/tasks", async (req, res) => {
    const userId = req.get("UserId");

    if (userId) {
      try {
        const data = await queryTasks(userId, req.query);
        if (data.length > 0) {
          const ds = data.map(it => {
            return {...it, categories: JSON.parse(it.categories), weekdays: []}
          })
          res.status(200).json(ds);
        } else {
          res.status(200).json([]);
        }
      } catch (err) {
        console.error("Error querying items:", err);
        res.status(500).send(err);
      }
    } else {
      res.status(403).send();
    }
  });

  app.get("/taskMap", async (req, res) => {
    const userId = req.get("UserId");

    if (userId) {
      try {
        const data = await queryTasks(userId, req.query, ['userId', 'startAt', 'name', 'completed']);
        const arr = [];
        const map = {};

        data.forEach((it) => {
          const index = getWeekdayIndex(it.startAt);
          if (map[it.name] !== undefined) {
            map[it.name].push({index, completed: it.completed});
          } else {
            map[it.name] = [{index, completed: it.completed}];
          }
        });
        
        Object.keys(map).forEach((key) => {
          arr.push({name: key, items: map[key]});
        });

        res.status(200).json(arr);
      } catch (err) {
        console.error("Error querying items:", err);
        res.status(500).send(err);
      }
    } else {
      res.status(403).send();
    }
  });

  app.get("/analyse/tasks", async (req, res) => {
    const userId = req.get("UserId");
    const map = {};
    if (userId) {
      const items = await queryTasks(userId, req.query);
      let nCompleted = 0;
      let nIncompleted = 0;

      items.forEach((it) => {
        if (it.completed) {
          nCompleted++;
        } else {
          nIncompleted++;
        }
        const cats = JSON.parse(it.categories);
        if(cats && cats.length > 0){
          cats.forEach((category) => {
            if (map[category]) {
              map[category] += 1;
            } else {
              map[category] = 1;
            }
          });
        }
      });

      res.status(200).json({categoryDistribution: map, nCompleted, nIncompleted});
    } else {
      res.status(403).json();
    }
  });

  app.patch("/tasks/:id", async (req, res) => {
    const id = req.params.id;
    const startAt = id.split("-")[1];
    const userId = req.get("UserId");
    const body = req.body;
    const client = new DynamoDBClient(DynamoDBCfg);
    if (userId) {
      const params = {
        TableName: tableName,
        Key: {
          userId: { S: userId }, // Partition key
          startAt: { N: startAt }, // Sort key
        },
        UpdateExpression:
          "SET #nm = :name, completed = :completed, endAt = :endAt, goal = :goal, categories = :categories",
        ExpressionAttributeValues: {
          ":name": { S: body.name },
          ":goal": { S: body.goal ?? "" },
          ":categories": { S: JSON.stringify(body.categories) ?? '[]' },
          ":completed": { BOOL: body.completed ?? "false" },
          ":endAt": { N: body.endAt ? body.endAt.toString() : "0" },
        },
        ExpressionAttributeNames: {
          "#nm": "name", // Map '#nm' to the actual attribute name 'name'
        },
        ReturnValues: "UPDATED_NEW",
      };
      try {
        const data = await client.send(new UpdateItemCommand(params));
        res.send(data);
      } catch (err) {
        console.error("Error updating item:", err);
        res.status(500).send(err);
      }
    } else {
      res.status(403).send();
    }
  });

  app.delete("/tasks/:id", async (req, res) => {
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
