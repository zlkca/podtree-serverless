import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';

const BUCKET_NAME = 'podtree-assets';

export const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
};

export const fetchLogoFromS3 = async (s3Key) => {
    const s3Client = new S3Client({ region: "us-east-1" });
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
        });
        const response = await s3Client.send(command);

        if (response.Body instanceof Readable) {
            return await streamToBuffer(response.Body);
        } else {
            throw new Error('Unexpected response body type');
        }
    } catch (error) {
        throw new Error(`Failed to fetch logo from S3: ${error.message}`);
    }
}
