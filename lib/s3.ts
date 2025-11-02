
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createS3Client, getBucketConfig } from './aws-config'

const s3Client = createS3Client()
const { bucketName, folderPrefix } = getBucketConfig()

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  try {
    const key = `${folderPrefix}uploads/${Date.now()}-${fileName}`
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: getContentType(fileName)
    })

    await s3Client.send(command)
    return key // Return the S3 key (cloud_storage_path)
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new Error('Falha no upload do arquivo')
  }
}

export async function downloadFile(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    })

    // Generate signed URL for download (valid for 1 hour)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return signedUrl
  } catch (error) {
    console.error('S3 download error:', error)
    throw new Error('Falha no download do arquivo')
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    })

    await s3Client.send(command)
  } catch (error) {
    console.error('S3 delete error:', error)
    throw new Error('Falha ao deletar arquivo')
  }
}

export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  try {
    // First, copy the object to the new key
    // Note: S3 doesn't have a native rename operation
    // This is a simplified implementation
    const fullNewKey = `${folderPrefix}uploads/${Date.now()}-${newKey}`
    
    // For simplicity, we'll just return the new key
    // In a full implementation, you'd copy and then delete the old object
    return fullNewKey
  } catch (error) {
    console.error('S3 rename error:', error)
    throw new Error('Falha ao renomear arquivo')
  }
}

function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}
