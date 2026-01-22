import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { ServerlessHandlerConfig, EventHandlerConfig } from './interfaces/handler.interface';

export class SqsEventMiddleware {
    constructor(private readonly config: ServerlessHandlerConfig) { }

    createHandler<T = any>(config: EventHandlerConfig<T>): Handler {
        return async (event: any) => {
            console.log('[SQS] Batch Received:', event.Records.length);
            const app = await NestFactory.create(this.config.appModule);
            if (this.config.appConfigurator) {
                await this.config.appConfigurator(app);
            }

            try {
                const service = app.get(config.service);
                const method = service[config.method] as unknown as Function;
                await method.apply(service, [event]);
            } catch (error) {
                console.error('[SQS] Error:', error.message);
                throw error;
            } finally {
                await app.close();
            }
        };
    }
}
