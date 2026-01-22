import { configure } from '@codegenie/serverless-express';
import { NestFactory } from '@nestjs/core';
import { Handler, Context, Callback } from 'aws-lambda';
import { ServerlessHandlerConfig } from './interfaces/handler.interface';

export class ApiGatewayEventMiddleware {
    private cachedServer: Handler;
    private cachedApp: any;

    constructor(private readonly config: ServerlessHandlerConfig) { }

    private async bootstrap() {
        if (!this.cachedApp) {
            this.cachedApp = await NestFactory.create(this.config.appModule);
            if (this.config.appConfigurator) {
                await this.config.appConfigurator(this.cachedApp);
            }
            await this.cachedApp.init();
        }
        return this.cachedApp;
    }

    createHandler(): Handler {
        return async (event: any, context: Context, callback: Callback) => {
            if (!this.cachedServer) {
                const app = await this.bootstrap();
                const expressHandler = app.getHttpAdapter().getInstance();
                this.cachedServer = configure({ app: expressHandler });
            }
            return this.cachedServer(event, context, callback);
        };
    }
}
