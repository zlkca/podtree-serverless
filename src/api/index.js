const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const cors = require("cors");
const { setUserRoutes } = require("./user");
const { setCategoryRoutes } = require("./category");
const { setTaskRoutes } = require("./task");
const { setGoalRoutes } = require("./goal");
const { setAuthRoutes } = require("./auth");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
// const USERS_TABLE = process.env.USERS_TABLE;
// const client = new DynamoDBClient();
// const docClient = DynamoDBDocumentClient.from(client);

app.use(express.json());

app.post("/login", async (req, res) => {
  res.status(400).json({ message: "login" });
});
app.post("/signup", async (req, res) => {
  res.status(200).json({ message: "signup" });
});

setAuthRoutes(app);
setUserRoutes(app);
setCategoryRoutes(app);
setGoalRoutes(app);
setTaskRoutes(app);

// module.exports.handler = serverless(app);

app.listen(5000, () => {
  console.log(`Api server listening!`);
});
