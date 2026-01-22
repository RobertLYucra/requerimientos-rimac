import { Handler } from 'aws-lambda';
import { ServerlessHandler } from 'src/shared/libs/middleware/serverless-handler';
import { UserModule } from './user.module';

const serverlessHandler = new ServerlessHandler({
  appModule: UserModule
});

export const handler: Handler = serverlessHandler.createHttpHandler();
