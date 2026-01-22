import { Handler } from 'aws-lambda';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ServerlessHandlerConfig, EventHandlerConfig, IServerlessHandler } from './interfaces/handler.interface';
import { ApiGatewayEventMiddleware } from './api-gateway-event.middleware';
import { EventBridgeEventMiddleware } from './event-bridge-event.middleware';
import { SqsEventMiddleware } from './sqs-event.middleware';
import { SnsEventMiddleware } from './sns-event.middleware';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';

export class ServerlessHandler implements IServerlessHandler {
  constructor(private readonly config: ServerlessHandlerConfig) {
    if (!this.config.appConfigurator) {
      this.config.appConfigurator = (app) => this.configureDefaultApp(app);
    }
  }

  private configureDefaultApp(app: INestApplication): void {
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: [
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Requested-With',
      ],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
  }

  createHttpHandler(): Handler {
    return new ApiGatewayEventMiddleware(this.config).createHandler();
  }

  createEventBridgeHandler<T = any>(config: EventHandlerConfig<T>): Handler {
    return new EventBridgeEventMiddleware(this.config).createHandler(config);
  }

  createSqsHandler<T = any>(config: EventHandlerConfig<T>): Handler {
    return new SqsEventMiddleware(this.config).createHandler(config);
  }

  createSnsHandler<T = any>(config: EventHandlerConfig<T>): Handler {
    return new SnsEventMiddleware(this.config).createHandler(config);
  }
}



