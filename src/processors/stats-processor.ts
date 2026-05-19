import { Logger } from '@aws-lambda-powertools/logger'
import type { SQSHandler } from 'aws-lambda'
import { updateStats } from '../utils/update-stats.js'

const logger = new Logger({ serviceName: 'dice-api', logLevel: 'INFO' })

const TABLE_NAME = process.env.TABLE_NAME!

export const handler: SQSHandler = async (event, context) => {
    logger.addContext(context)
    logger.logEventIfEnabled(event)

    for (const record of event.Records) {
        const snsMessage = JSON.parse(record.body)
        const payload = JSON.parse(snsMessage.Message)
        const { rollId, result } = payload as { rollId: string; result: number }

        logger.info('Processing roll for stats', { rollId, result })

        await updateStats(TABLE_NAME, result)
    }
}
