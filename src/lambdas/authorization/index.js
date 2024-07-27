exports.handler = async function(event, context, callback) {
    console.log(`authorization input: ${JSON.stringify(event)}`);
    const rsp = generatePolicy('me', 'Allow', event.methodArn)
    console.log(`authorization output: ${JSON.stringify(rsp)}`);
    return rsp;
}

const generatePolicy = function(principalId, effect, resource) {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource
            }]
        }
    }
}

















