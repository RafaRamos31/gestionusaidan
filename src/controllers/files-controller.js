import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  }
});

//Get
export async function getFile(response, key){
  try {
    // Llama a la operación de listado de objetos
    const data = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key
      })
    );
    if(data){
      response.json({url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`});
    }
    
    return response;

  } catch (error) {
    throw error;
  }
}

//Put
export async function postFile(response, key, file){
  try {
    // Llama a la operación de listado de objetos
    const data = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read'
      })
    );
    if(data){
      response.json({url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`});
    }
    
    return response;

  } catch (error) {
    throw error;
  }
}

//Delete
export async function deleteFile(response, key){
  try {
    // Llama a la operación de listado de objetos
    const data = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key
      })
    );
    if(data){
      response.json({url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`});
    }
    return response;

  } catch (error) {
    throw error;
  }
}