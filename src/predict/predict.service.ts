import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as tf from '@tensorflow/tfjs-node';
import { Image, createCanvas } from 'canvas';

@Injectable()
export class ModelService {
  private model;

  async downloadModel() {
    const storage = new Storage();
    const options = {
      destination: './model.json',
    };

    await storage
      .bucket('bucket-submissionmlgc-michsannr')
      .file('model-in-prod/model.json')
      .download(options);

    console.log(
      `gs://bucket-submissionmlgc-michsannr/model-in-prod/model.json downloaded to ./models/model.json.`,
    );
  }

  async loadModel() {
    this.model = await tf.loadLayersModel('file://./model.json');
  }

  getModel() {
    return this.model;
  }

  async predict(file: Express.Multer.File) {
    const imageBuffer = file.buffer;
    const model = this.getModel();

    // Ubah buffer menjadi gambar
    const img = new Image();
    img.src = imageBuffer;

    // Buat canvas dengan ukuran yang sama dengan gambar
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    // Gambar gambar ke canvas
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Dapatkan ImageData dari canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Ubah ImageData menjadi tensor 4D
    const tensor = tf.tensor3d(Array.from(imageData.data), [
      imageData.width,
      imageData.height,
      4,
    ]);

    // Lakukan preprocessing gambar di sini (misalnya, resize, normalisasi, dll.)

    // Jalankan prediksi dengan model
    const prediction = model.predict(tensor);

    // Ubah hasil prediksi menjadi array JavaScript
    const result = await prediction.array();

    return result;
  }
}
