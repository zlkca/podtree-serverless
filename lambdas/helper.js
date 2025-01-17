// Helper: Format API Gateway response
export const formatResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "https://admin.podtree.ca",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
    },
    body: JSON.stringify(body),
});