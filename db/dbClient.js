import { MongoClient, ServerApiVersion } from "mongodb";
// import dotenv from 'dotenv';
// import path from 'path';

// Specify the .env file location
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

export function getDBClient(){
//   DB_USERNAME=podtree
// DB_PASSWORD=ibYIdykB4JHHmhYH
// DB_HOST=podtree-cluster-dev.zxbwg.mongodb.net
// DB_APP_NAME=podtree-cluster-dev
// DB_NAME=podtree
  const username = 'podtree'; // process.env.DB_USERNAME;
  const password = 'ibYIdykB4JHHmhYH'; // process.env.DB_PASSWORD;
  const host = 'podtree-cluster-dev.zxbwg.mongodb.net'; // process.env.DB_HOST;
  const appName = 'podtree-cluster-dev'; // process.env.APP_NAME;
  const connectionString = `mongodb+srv://${username}:${password}@${host}/?retryWrites=true&w=majority&appName=${appName}`;
  console.log({username, password, host, appName});
  console.log({connectionString})
  return new MongoClient(
    connectionString, 
    {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // family: 4,
      maxConnecting: 10,
      maxPoolSize: 100,
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1
    }
  );
}

export async function connectDB(dbClient){
  const dbName = 'podtree'; // process.env.DB_NAME;
  await dbClient.connect();
  return dbClient.db(dbName);
}