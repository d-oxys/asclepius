import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ModelService } from './predict.service';

@Controller('predict')
export class PredictController {
  constructor(private modelService: ModelService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async predict(@UploadedFile() file) {
    const result = await this.modelService.predict(file);
    return result;
  }
}
