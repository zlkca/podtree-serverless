const {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  BatchWriteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { DynamoDBCfg } = require("../const");

const tableName = "categories-dev";

function setCategoryRoutes(app) {
  app.post("/categories", async (req, res) => {
    res.status(200).json({ message: "categories" });
  });
  app.get("/categories", async (req, res) => {
    const userId = req.get("UserId");
    if (userId) {
      try {
        const data = await findCategories(userId);
        res.status(200).json(data);
      } catch (err) {
        console.error("Error querying items:", err);
        res.status(500).send(err);
      }
    } else {
      res.status(403).send([]);
    }
  });
  app.patch("/categories", async (req, res) => {
    res.status(200).json({ message: "categories" });
  });
  app.delete("/categories", async (req, res) => {
    res.status(200).json({ message: "categories" });
  });
}

async function findCategories(userId) {
  const client = new DynamoDBClient(DynamoDBCfg);
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
      return data.Items.map((it) => unmarshall(it));
    } catch (err) {
      console.error("Error querying items:", err);
      return [];
    }
  } else {
    return [];
  }
}

async function saveCategory(categoryId, body) {
  const client = new DynamoDBClient(DynamoDBCfg);
  if (categoryId) {
    const createdAt = new Date().getTime().toString();
    const params = {
      TableName: tableName,
      Item: {
        categoryId: { S: categoryId }, // The key must be a string for the local DynamoDB
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
    console.error("Error inserting item: no categoryId");
  }
}

async function batchSaveCategories(userId, categories) {
  const client = new DynamoDBClient(DynamoDBCfg);
  const params = {
    RequestItems: {
      [tableName]: categories.map((category) => ({
        PutRequest: {
          Item: {
            userId: { S: userId },
            name: { S: category.name },
            type: { S: category.type },
            notes: { S: category.notes ?? "" },
            status: { S: category.status },
          },
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

async function generateCategories(userId) {
  await batchSaveCategories(userId, [
    {
      name: "Health",
      type: "template",
      status: "active",
      notes:
        "Health is the foundation of a fulfilling life. Physical and mental well-being allow you to fully engage with the world, pursue your passions, and maintain energy and focus.",
    },
    {
      name: "Wealth",
      type: "template",
      status: "active",
      notes:
        "Wealth provides security and freedom. It enables you to explore opportunities, and achieve financial independence. It also helps reduce stress, gives you control over your time, and allows you to support those you care about.",
    },
    {
      name: "Family",
      type: "template",
      status: "active",
      notes:
        "Family offers love, support, and a sense of belonging. Strong family connections are a source of comfort and joy, providing emotional stability and shared experiences that enrich your life.",
    },
    {
      name: "Growth",
      type: "template",
      status: "active",
      notes:
        "Personal growth and self-improvement ensures that you continue evolving and adapting, it helps you to overcome challenges, achieve your goals, and reach your full potential. It also keeps life exciting and rewarding.",
    },
    {
      name: "Love",
      type: "template",
      status: "active",
      notes:
        "Love is the deep connection that nurtures and fulfills us. it provides meaning and purpose, creating a sense of intimacy and trust. It is central to happiness and emotional well-being.",
    },
    {
      name: "Wisdom",
      type: "template",
      status: "active",
      notes:
        "Wisdom is the application of knowledge and experience to make better decisions and lead a more thoughtful life. It helps you understand the world, navigate complexity, and offering a sense of clarity and peace.",
    },
    {
      name: "Peace",
      type: "template",
      status: "active",
      notes:
        "Peace brings inner calm and harmony. It helps you manage stress, avoid conflict, and maintain a balanced life. Achieving peace allows for greater emotional resilience, mindfulness, and appreciation for the present moment.",
    },
    {
      name: "Adventure",
      type: "template",
      status: "active",
      notes:
        "By seeking adventure, you step outside your comfort zone, learn about the world and yourself, and foster a sense of curiosity and exploration. It keeps life vibrant and dynamic.",
    },
    {
      name: "Contribution",
      type: "template",
      status: "active",
      notes:
        "By contributing to others or your community, you create a positive impact and gain a sense of purpose. Helping others fosters connection and enhances your own sense of fulfillment.",
    },
    {
      name: "Purpose",
      type: "template",
      status: "active",
      notes:
        "Purpose is the driving force behind your success. It helps you set clear goals, make choices, and live a life aligned with your values and aspirations.",
    },
    {
      name: "Self Actualization",
      type: "template",
      status: "active",
      notes:
        "Self-actualization is the process of becoming who you want to be. It involves making decisions, changing your life, and becoming the best version of yourself.",
    },
  ]);
}

module.exports = {
  findCategories,
  saveCategory,
  setCategoryRoutes,
  generateCategories,
};
