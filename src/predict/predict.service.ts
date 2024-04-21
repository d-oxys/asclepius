import { Injectable, OnModuleInit } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';
import * as jpeg from 'jpeg-js';
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class ModelService implements OnModuleInit {
  private model: tf.GraphModel;
  private modelPromise: Promise<tf.GraphModel>;

  async onModuleInit(): Promise<void> {
    this.model = await this.loadModel();
  }

  constructor() {
    this.modelPromise = this.loadModel();
  }

  private modelUrl: string = process.env.MODEL_URL;

  async loadModel(): Promise<tf.GraphModel> {
    const model = await tf.loadGraphModel(this.modelUrl);
    return model;
  }
  async predict(imageBuffer: Buffer) {
    console.log('Starting prediction...');
    // Convert imageBuffer to tensor
    const tensor = this.imageToTensor(imageBuffer);
    const prediction = this.model.predict(tensor);
    // Interpret the prediction
    const label = this.interpretPrediction(prediction);
    return label;
  }

  interpretPrediction(prediction) {
    // Assuming your model outputs a single number between 0 and 1
    const predictionValue = prediction.dataSync()[0];
    return predictionValue;
  }

  imageToTensor(imageBuffer: Buffer) {
    const TO_UINT8ARRAY = true;
    const { width, height, data } = jpeg.decode(imageBuffer, {
      useTArray: true,
    });
    let offset = 0; // offset into original data
    let buffer = new Uint8Array(width * height * 3);
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset];
      buffer[i + 1] = data[offset + 1];
      buffer[i + 2] = data[offset + 2];

      offset += 4;
    }
    let tensor = tf.tensor3d(buffer, [width, height, 3]);
    // Add a dimension for the batch
    tensor = tensor.expandDims(0);
    // Resize to the expected model input size
    tensor = tf.image.resizeBilinear(tensor, [224, 224]);

    return tensor;
  }
}
