
import { S3Client } from '@aws-sdk/client-s3'

export interface BucketConfig {
  bucketName: string
  folderPrefix: string
}

export function getBucketConfig(): BucketConfig {
  return {
    bucketName: process.env.AWS_BUCKET_NAME || '',
    folderPrefix: process.env.AWS_FOLDER_PREFIX || ''
  }
}

export function createS3Client(): S3Client {
  return new S3Client({})
}
