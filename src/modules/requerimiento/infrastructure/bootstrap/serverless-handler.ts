import { Handler } from 'aws-lambda';
import { ServerlessHandler } from 'src/shared/libs/middleware/serverless-handler';
import { RequerimientoModule } from './requerimiento.module';

const serverlessHandler = new ServerlessHandler({
  appModule: RequerimientoModule
});

export const handler: Handler = serverlessHandler.createHttpHandler();
