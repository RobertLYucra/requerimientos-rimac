import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { ServerlessHandlerConfig, EventHandlerConfig } from './interfaces/handler.interface';

export class SnsEventMiddleware {
    constructor(private readonly config: ServerlessHandlerConfig) { }

    createHandler<T = any>(config: EventHandlerConfig<T>): Handler {
        return async (event: any) => {
            console.log('[SNS] Event Received:', JSON.stringify(event, null, 2));
            const app = await NestFactory.create(this.config.appModule);
            if (this.config.appConfigurator) {
                await this.config.appConfigurator(app);
            }

            try {
                const service = app.get(config.service);
                const method = service[config.method] as unknown as Function;

                const payload = config.getValue ? config.getValue(event) : event;
                const args = Array.isArray(payload) ? payload : [payload];

                await method.apply(service, args);
            } catch (error) {
                console.error('[SNS] Error:', error.message);
                throw error;
            } finally {
                await app.close();
            }
        };
    }
}
