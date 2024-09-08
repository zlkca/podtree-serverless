const {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { unmarshall, marshall } = require("@aws-sdk/util-dynamodb");
const { getUnixTime, generateNextRecurringDates, generateRecurringDates } = require("../utils");
const { DynamoDBCfg } = require("../const");


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

async function getRecurringTasks(userId, query) {
  const { start, end } = query;
  const params = end ? {
    TableName: recurringTableName,
    KeyConditionExpression:
      "userId = :userId AND startAt BETWEEN :start AND :end",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
      ":start": { N: start ? start.toString() : "0" },
      ":end": { N: end ? end.toString() : "0" },
    },
  }
  : {
    TableName: recurringTableName,
    KeyConditionExpression: "userId = :userId AND startAt <= :start",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
      ":start": { N: start ? start.toString() : "0" },
    },
  };

  try {
    const client = new DynamoDBClient(DynamoDBCfg);
    const data = await client.send(new QueryCommand(params));
    if (data.Items.length > 0) {
      return data.Items.map((it) => unmarshall(it));
    } else {
      return [];
    }
  } catch (err) {
    console.error("Error querying items:", err);
    return [];
  }
}

// latestStartAt
async function patchRecurringTask(key, latestStartAt) {
  const params = {
    TableName: recurringTableName,
    Key: key.marshall(),
    UpdateExpression: "SET latestStartAt = :latestStartAt",
    // ExpressionAttributeNames: {
    //   "latestStartAt": "latestStartAt",
    // },
    ExpressionAttributeValues: {
      ":latestStartAt": { N: latestStartAt.toString() },
    },
  };
  const client = new DynamoDBClient(DynamoDBCfg);
  await client.send(new UpdateItemCommand(params));
}

async function genRecurringTaskInstances(
  key, // RecurringTaskKey
  nextStartAt,
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
  const dates = endAtEnabled ?
  await generateRecurringDates(
    parseInt(key.sk),
    parseInt(frequency),
    unit,
    parseInt(nextStartAt),
    parseInt(endAt),
    weekdays
  )
  : await generateNextRecurringDates(
    parseInt(nextStartAt),
    parseInt(frequency),
    unit,
    weekdays
  );

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
      startAt: getUnixTime(dates[i].toISOString()),
      endAt: getUnixTime(dates[i].toISOString()),
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

  if(!endAtEnabled){
    const nextLastStartAt = dates[dates.length - 1].toISOString();
    await patchRecurringTask(key, getUnixTime(nextLastStartAt));
  }
}

async function queryTasks(userId, query) {
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
    return data.Items.map((it) => unmarshall(it));
  } else {
    return [];
  }
}

async function saveTask(userId, body) {
  const client = new DynamoDBClient(DynamoDBCfg);
  const createdAt = body.createdAt ? body.createdAt.toString() : "";
  const categories = body.categories ? body.categories : [];
  const goal = body.goal ? body.goal : "";
  const startAt = getUnixTime(body.startDate + "T" + body.startTime);
  const endAt = body.endAt ? getUnixTime(body.endAt) : 0;
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
    // Item: {
    //   userId: { S: userId },
    //   type: { S: body.type ? body.type : "instance" },
    //   name: { S: name },
    //   // notes: { S: body.notes? body.notes : "" },
    //   categories: { S: categories },
    //   goal: { S: goal },
    //   duration: { S: duration },
    //   unit: { S: unit },
    //   frequency: { N: frequency },
    //   weekdays: {S: weekdays },
    //   endAtEnabled: { BOOL: body.endAtEnabled ? body.endAtEnabled.toString() : "false" },
    //   completed: { BOOL: body.completed ? body.completed.toString() : "false" },
    //   startAt: { N: startAt },
    //   endAt: { N: endAt },
    //   startedAt: { N: "0" },
    //   endedAt: { N: "0" },
    //   createdAt: { N: createdAt },
    // },
  };
  try {
    await client.send(new PutItemCommand(params));
    if (body.type === "recurring") {
        await genRecurringTaskInstances(
          key,
          startAt, // ?
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

function setTaskRoutes(app) {
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
    // const { start } = req.query;

    if (userId) {
      try {
        // const recurringTasks = await getRecurringTasks(userId, req.query);

        // recurringTasks.forEach((task) => {
        //   if(task.latestStartAt < start){

        //   }
        //   task.type = "recurring";
        // });

        const data = await queryTasks(userId, req.query);
        if (data.length > 0) {
          res.send(data);
        } else {
          res.send([]);
        }
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
      let total = 0;
      items.forEach((it) => {
        if(it.categories && it.categories.length > 0){
          it.categories.forEach((category) => {
            if (map[category.name]) {
              map[category.name].value += category.percentage;
            } else {
              map[category.name] = {
                id: category.name,
                value: category.percentage,
                label: category.name,
              };
            }
            total += category.percentage;
          });
        }
      });

      const data = [];
      Object.keys(map).forEach((k) => data.push(map[k]));
      res.send({categories: data, total});
    } else {
      res.status(403).send();
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
          "SET #nm = :name, completed = :completed, endAt = :endAt, goal = :goal, category = :category",
        ExpressionAttributeValues: {
          ":name": { S: body.name },
          ":goal": { S: body.goal ?? "" },
          ":category": { S: body.category ?? "" },
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

module.exports = {
  saveTask,
  setTaskRoutes,
};
