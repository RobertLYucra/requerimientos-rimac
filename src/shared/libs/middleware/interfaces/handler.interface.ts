import { Type } from '@nestjs/common';
import { Handler } from 'aws-lambda';

export interface ServerlessHandlerConfig {
  appModule: Type<any>;
  appConfigurator?: (app: any) => void | Promise<void>;
}

export interface EventHandlerConfig<T = any> {
  service: Type<T>;
  method: keyof T;
  getValue?: (event: any) => any;
}

export interface IServerlessHandler {
  createHttpHandler(): Handler;
  createEventBridgeHandler<T = any>(config: EventHandlerConfig<T>): Handler;
  createSqsHandler<T = any>(config: EventHandlerConfig<T>): Handler;
  createSnsHandler<T = any>(config: EventHandlerConfig<T>): Handler;
}
