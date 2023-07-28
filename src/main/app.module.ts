import { Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(/*consumer: MiddlewareConsumer*/) {
    // consumer.apply(LoggerMiddleware).forRoutes(CatsController);
  }
}
