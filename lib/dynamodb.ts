// lib/dynamodb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

const client = new DynamoDBClient({
  region: "us-east-1",
})

console.log('🔐 DynamoDB client configurado em us-east-1')

export const ddb = DynamoDBDocumentClient.from(client)
