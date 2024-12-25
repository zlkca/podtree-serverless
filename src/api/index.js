import express from "express";
// import serverless from "serverless-http";
import bodyParser from "body-parser";
import cors from "cors";
import { setUserRoutes } from "./user.js";
import { setCategoryRoutes } from "./category.js";
import { setTaskRoutes } from "./task.js";
import { setGoalRoutes } from "./goal.js";
import { setAuthRoutes } from "./auth.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
// const USERS_TABLE = process.env.USERS_TABLE;
// const client = new DynamoDBClient();
// const docClient = DynamoDBDocumentClient.from(client);

app.use(express.json());


setAuthRoutes(app);
setUserRoutes(app);
setCategoryRoutes(app);
setGoalRoutes(app);
setTaskRoutes(app);


app.listen(5000, () => {
  console.log(`Api server listening!`);
});

// export const handler = serverless(app);