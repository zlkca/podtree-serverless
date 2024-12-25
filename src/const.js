export const env = "dev"
export const GoogleAuthApi = `https://www.googleapis.com/oauth2/v3` // userinfo?access_token=${user.access_token}`
export const DynamoDBCfg = env == "dev" ? {endpoint: "http://localhost:8000"} : {region: "us-east-1"}


   