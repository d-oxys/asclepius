import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PredictController } from './predict/predict.controller';

@Module({
  imports: [],
  controllers: [AppController, PredictController],
  providers: [AppService], // Add PredictService to providers
})
export class AppModule {}
