exports.handler = async function(event) {
    return {
        statusCode: 200,
        headers: {Authorization: "testAuth"},
        body:"hi handle goals"
    }
}