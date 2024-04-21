import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class FirestoreService {
  private db: Firestore;

  constructor() {
    this.db = new Firestore();
  }

  async savePrediction(id: string, data: any) {
    const predictCollection = this.db.collection('predictions');
    return predictCollection.doc(id).set(data);
  }

  async getHistories() {
    const predictCollection = this.db.collection('predictions');
    const snapshot = await predictCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, history: doc.data() }));
  }
}
