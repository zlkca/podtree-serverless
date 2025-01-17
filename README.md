## Deploy
```
npm prune --production
npm i serverless-webpack --save-dev
serverless deploy
```
## Create Layer
```
mkdir mongodb-layer
cd mongodb-layer
mkdir -p nodejs
cd nodejs
npm init -y
npm install mongodb --save
cd ..
zip -r mongodb-layer.zip nodejs
```
## Debug

### Debug with https
```
openssl req -newkey rsa:2048 -nodes -keyout server.key -x509 -days 365 -out server.crt
```
### Debug in VS Code:
make sure you have global serverless installed
Add Debug Configuration: Create a .vscode/launch.json file:
```
{
   "version": "0.2.0",
   "configurations": [
       {
           "type": "node",
           "request": "launch",
           "name": "Debug Serverless Offline",
           "runtimeExecutable": "serverless",
           "args": ["offline", "--stage", "dev"],
           "cwd": "${workspaceFolder}",
           "skipFiles": ["<node_internals>/**"],
           "sourceMaps": true
       }
   ]
}
```
Open VS Code Debug panel.
Select Debug Serverless Offline and click "Start Debugging."


### Debug in console
Run serverless-offline in Debug Mode:

```
node --inspect-brk ./node_modules/.bin/serverless offline --stage dev
```
Attach a Debugger:

Open Chrome and navigate to chrome://inspect.
Select your debugging session to start debugging.

### Run single function
```
serverless invoke local --function hello --stage dev --data '{"key": "value"}'
```
Input Event: Pass input data (--data) as JSON to simulate an AWS event.
Environment Variables: Automatically loaded from .env or serverless.yml.

### Simulate API Gateway Locally
After running serverless offline, you can access your endpoints in a local API Gateway simulator.
```
serverless offline --stage dev
```
Open a browser to check:
http://localhost:3000/dev/hello


## Test

Post on /login
```
curl -X POST localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "exampleUser",
    "password": "examplePassword"
  }'
```
## Usage

### Deployment

In order to deploy the example, you need to run the following command:

```
$ serverless deploy
```

After running deploy, you should see output similar to:

```bash
Deploying aws-node-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-project-dev (112s)

functions:
  hello: aws-node-project-dev-hello (1.5 kB)
```

### Invocation

After successful deployment, you can invoke the deployed function by using the following command:

```bash
serverless invoke --function hello
```

Which should result in response similar to the following:

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": {}\n}"
}
```

### Local development

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function hello
```

Which should result in response similar to the following:

```
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```
