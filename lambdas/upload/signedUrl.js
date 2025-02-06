import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl, S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { formatResponse } from "../helper";


const s3 = new S3Client({ region: "us-east-1" });

export const handler = async (event) => {
  console.log({ event });
  const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
  const schoolId = headers.schoolid;
  const { method, path } = requestContext.http;
  const bucketName = "podtree-assets";

  switch (method) {

    case 'POST':
      if (path.includes('signedUrls')) {
        try {
          const { fileName, fileType, category } = JSON.parse(body);
          console.log({ fileName, fileType, category });
          const s3Key = `${schoolId}/${category}/${fileName}`;
          console.log({ s3Key });
          const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            ContentType: fileType,
          });
          const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
          // const presigner = new S3RequestPresigner(s3.config);
          // const signedUrl = await presigner.presign(command, { expiresIn: 3600 });
          return { signedUrl };
        } catch (error) {
          console.log({ error });
          return formatResponse(500, { message: 'Error generating signed url' });
        }
      } else if(path === '/getSignedUrl'){
        const { fileName, category } = JSON.parse(body);
        console.log({ fileName, category });
        const s3Key = `${schoolId}/${category}/${fileName}`;
        console.log({ s3Key });
        const params = {
          Bucket: bucketName,
          Key: s3Key,
        };

        const command = new GetObjectCommand(params);
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        console.log({ signedUrl });
        return { signedUrl };
      } else {
        return formatResponse(400, { message: 'Invalid upload request' });
      }
  }

  return formatResponse(405, { error: `Method ${method} not allowed` });
};


// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// const Busboy = require("busboy");

// const s3 = new S3Client({ region: "us-east-1" });

// const getFolderFromUrl = (path) => {
//     const pathParts = path.split("/");
//     return pathParts[pathParts.length - 1];
// }

// export const handler = async (event) => {
//     const { requestContext, headers, body, pathParameters, queryStringParameters } = event;
//     const schoolId = headers.schoolid;
//     const category = pathParameters.category;
//     // const folder = getFolderFromUrl(requestContext.http.path);
//     const bucketName = "podtree-assets";
//     let response;
//     const metadata = {};

//     const busboy = new Busboy.Busboy({
//         headers: event.headers,
//     });

//     return new Promise((resolve, reject) => {
//         busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
//             const key = `${schoolId}/${category}/${filename}`;
//             console.log({key});
//             try {
//                 const uploadParams = {
//                     Bucket: bucketName,
//                     Key: key,
//                     Body: file,
//                     ContentType: mimetype,
//                 };

//                 await s3.send(new PutObjectCommand(uploadParams));
//                 metadata.fileKey = key;
//                 metadata.filename = filename;
//             } catch (error) {
//                 console.log({error});
//                 reject({
//                     statusCode: 500,
//                     body: JSON.stringify({ message: "Error uploading file", error }),
//                 });
//             }
//         });

//         busboy.on("field", (fieldname, val) => {
//             metadata[fieldname] = val; // Capture additional form fields
//         });

//         busboy.on("finish", async () => {
//             // Save metadata to your database
//             try {
//                 // Replace with your DynamoDB saving logic
//                 console.log("Saving metadata to DB:", metadata);

//                 response = {
//                     statusCode: 200,
//                     body: JSON.stringify({ message: "File uploaded successfully", metadata }),
//                 };
//                 resolve(response);
//             } catch (error) {
//                 console.log({error});
//                 reject({
//                     statusCode: 500,
//                     body: JSON.stringify({ message: "Error saving metadata", error }),
//                 });
//             }
//         });

//         busboy.write(event.body, event.isBase64Encoded ? "base64" : "binary");
//         busboy.end();
//     });
// };
