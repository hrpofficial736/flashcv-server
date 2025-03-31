import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from "fs";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('certs/localhost-key.pem'),
    cert: fs.readFileSync('certs/localhost-cert.pem'),
  };
  const app = await NestFactory.create(AppModule, {httpsOptions});
  app.enableCors(
    {
      origin: process.env.CLIENT_URI,
      credentials: true
    }
  )
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 7777);
}
bootstrap();
