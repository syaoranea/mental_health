
// lib/s3.ts
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
})

export async function getDownloadUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!, // ajuste o nome da env se for outro
      Key: key,
    })

    // 👇 Cast para evitar conflito de tipos entre versões do SDK
    const signedUrl = await getS3SignedUrl(
      s3Client as any,
      command as any,
      { expiresIn: 3600 }
    )

    return signedUrl
  } catch (error) {
    console.error('S3 download error:', error)
    throw error
  }
}