import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export const updateStats = async (tableName: string, result: number): Promise<void> => {
    // Always increment count and sum
    await ddbClient.send(new UpdateCommand({
        TableName: tableName,
        Key: { pk: 'STATS' },
        UpdateExpression: 'ADD #count :one, #sum :result',
        ExpressionAttributeNames: {
            '#count': 'count',
            '#sum': 'sum',
        },
        ExpressionAttributeValues: {
            ':one': 1,
            ':result': result,
        },
    }))

    // Conditionally update min
    try {
        await ddbClient.send(new UpdateCommand({
            TableName: tableName,
            Key: { pk: 'STATS' },
            UpdateExpression: 'SET #min = :result',
            ConditionExpression: 'attribute_not_exists(#min) OR :result < #min',
            ExpressionAttributeNames: { '#min': 'min' },
            ExpressionAttributeValues: { ':result': result },
        }))
    } catch (error: unknown) {
        if ((error as { name: string }).name !== 'ConditionalCheckFailedException') throw error
    }

    // Conditionally update max
    try {
        await ddbClient.send(new UpdateCommand({
            TableName: tableName,
            Key: { pk: 'STATS' },
            UpdateExpression: 'SET #max = :result',
            ConditionExpression: 'attribute_not_exists(#max) OR :result > #max',
            ExpressionAttributeNames: { '#max': 'max' },
            ExpressionAttributeValues: { ':result': result },
        }))
    } catch (error: unknown) {
        if ((error as { name: string }).name !== 'ConditionalCheckFailedException') throw error
    }
}
