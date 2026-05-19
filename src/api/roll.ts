import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { Logger } from '@aws-lambda-powertools/logger'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { randomUUID } from 'node:crypto'

const logger = new Logger({ serviceName: 'dice-api', logLevel: 'INFO' })
const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const snsClient = new SNSClient({})

const TABLE_NAME = process.env.TABLE_NAME!
const TOPIC_ARN = process.env.TOPIC_ARN!
const DIRECT_PUBLISH_ENABLED = process.env.DIRECT_PUBLISH_ENABLED === 'true'

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    logger.addContext(context)
    logger.logEventIfEnabled(event)

    const rollId = randomUUID()
    const result = Math.floor(Math.random() * 6) + 1
    const timestamp = new Date().toISOString()

    await ddbClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            pk: `ROLL#${rollId}`,
            rollId,
            result,
            timestamp,
        },
    }))

    logger.info('Roll recorded', { rollId, result })

    if (DIRECT_PUBLISH_ENABLED) {
        await snsClient.send(new PublishCommand({
            TopicArn: TOPIC_ARN,
            Message: JSON.stringify({ rollId, result, timestamp }),
        }))

        logger.info('Published to SNS', { rollId })
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollId, result, timestamp }),
    }
}
