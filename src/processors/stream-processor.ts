import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { Logger } from '@aws-lambda-powertools/logger'
import type { DynamoDBStreamHandler } from 'aws-lambda'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'

const logger = new Logger({ serviceName: 'dice-api', logLevel: 'INFO' })
const snsClient = new SNSClient({})

const TOPIC_ARN = process.env.TOPIC_ARN!

export const handler: DynamoDBStreamHandler = async (event, context) => {
    logger.addContext(context)
    logger.logEventIfEnabled(event)

    for (const record of event.Records) {
        if (record.eventName !== 'INSERT') {
            logger.info('Skipping non-INSERT event', { eventName: record.eventName })
            continue
        }

        const newImage = record.dynamodb?.NewImage
        if (!newImage) continue

        const item = unmarshall(newImage as Record<string, AttributeValue>)

        // Only process roll items, not STATS
        if (!item.pk?.startsWith('ROLL#')) continue

        const message = {
            rollId: item.rollId,
            result: item.result,
            timestamp: item.timestamp,
        }

        await snsClient.send(new PublishCommand({
            TopicArn: TOPIC_ARN,
            Message: JSON.stringify(message),
        }))

        logger.info('Published stream event to SNS', { rollId: item.rollId })
    }
}
