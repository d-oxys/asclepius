import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PredictController } from './predict/predict.controller';
import { ModelService } from './predict/predict.service';

@Module({
  imports: [],
  controllers: [AppController, PredictController],
  providers: [AppService, ModelService],
})
export class AppModule {}
