import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ModelService } from './predict.service';
import { FirestoreService } from './firestore.service';
import { v4 as uuidv4 } from 'uuid';
import { HttpExceptionFilter } from './http-exception.filter';

@Controller('predict')
@UseFilters(new HttpExceptionFilter())
export class PredictController {
  constructor(
    private readonly modelService: ModelService,
    private readonly firestoreService: FirestoreService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 1000000 } }))
  async predict(@UploadedFile() file) {
    if (!file) {
      throw new HttpException(
        {
          status: 'fail',
          message: 'Image file is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const imageBuffer = file.buffer;
    let result;
    try {
      result = await this.modelService.predict(imageBuffer);
    } catch (error) {
      throw new HttpException(
        {
          status: 'fail',
          message: 'Terjadi kesalahan dalam melakukan prediksi',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = {
      status: 'success',
      message: 'Model is predicted successfully',
      data: {
        id: uuidv4(),
        result: result > 0.5 ? 'Cancer' : 'Non-cancer',
        suggestion:
          result > 0.5
            ? 'Segera periksa ke dokter!'
            : 'Tidak ada tindakan lebih lanjut yang diperlukan',
        createdAt: new Date().toISOString(),
      },
    };

    await this.firestoreService.savePrediction(response.data.id, response.data);

    return response;
  }

  @Get('histories')
  async getHistories() {
    const histories = await this.firestoreService.getHistories();
    return {
      status: 'success',
      data: histories,
    };
  }
}
