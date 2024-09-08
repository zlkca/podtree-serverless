const env = "local"
const GoogleAuthApi = `https://www.googleapis.com/oauth2/v3` // userinfo?access_token=${user.access_token}`
const DynamoDBCfg = env == "local" ? {endpoint: "http://localhost:8000"} : {region: "us-east-1"}

module.exports = {
    GoogleAuthApi,
    DynamoDBCfg
};
   