import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { ServerlessHandlerConfig, EventHandlerConfig } from './interfaces/handler.interface';

export class EventBridgeEventMiddleware {
    constructor(private readonly config: ServerlessHandlerConfig) { }

    createHandler<T = any>(config: EventHandlerConfig<T> & { getValue?: (event: any) => any }): Handler {
        return async (event: any) => {
            console.log('[EventBridge] Event Received:', JSON.stringify(event, null, 2));
            const app = await NestFactory.create(this.config.appModule);
            if (this.config.appConfigurator) {
                await this.config.appConfigurator(app);
            }

            try {
                const service = app.get(config.service);
                const method = service[config.method] as unknown as Function;

                const payload = config.getValue ? config.getValue(event) : event.detail || event;
                const args = Array.isArray(payload) ? payload : [payload];

                await method.apply(service, args);
            } catch (error) {
                console.error('[EventBridge] Error:', error.message);
                console.error('[EventBridge] Stack:', error.stack);
                throw error;
            } finally {
                await app.close();
            }
        };
    }

    // Helper for specific detail extraction if needed later
    createHandlerWithExtractor<T = any>(
        config: EventHandlerConfig<T>,
        extractor: (event: any) => any
    ): Handler {
        return async (event: any) => {
            // ... same logic but use extractor(event)
            // leaving out for now to keep it simple
            return;
        };
    }
}
