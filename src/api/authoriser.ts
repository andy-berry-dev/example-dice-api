import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { Logger } from '@aws-lambda-powertools/logger'
import type { APIGatewayRequestAuthorizerEventV2 } from 'aws-lambda'

const logger = new Logger({ serviceName: 'dice-api', logLevel: 'INFO' })
const secretsClient = new SecretsManagerClient({})

const SECRET_NAME = process.env.SECRET_NAME!

let cachedApiKey: string | undefined

const getApiKey = async (): Promise<string> => {
    if (cachedApiKey) return cachedApiKey

    const response = await secretsClient.send(new GetSecretValueCommand({
        SecretId: SECRET_NAME,
    }))

    cachedApiKey = response.SecretString!
    return cachedApiKey
}

export const handler = async (event: APIGatewayRequestAuthorizerEventV2, context: unknown) => {
    logger.addContext(context as any)

    const providedKey = event.headers?.['x-api-key']

    if (!providedKey) {
        logger.info('No API key provided')
        return { isAuthorized: false }
    }

    const expectedKey = await getApiKey()

    const isAuthorized = providedKey === expectedKey

    if (!isAuthorized) {
        logger.info('Invalid API key provided')
    }

    return { isAuthorized }
}
