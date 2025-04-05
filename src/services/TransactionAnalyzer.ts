import * as tf from '@tensorflow/tfjs'

export interface TransactionData {
  amount: number
  timeOfDay: number
  dayOfWeek: number
  frequency: number
}

export class TransactionAnalyzer {
  private model: tf.LayersModel | null = null

  async initialize() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 16, activation: 'relu', inputShape: [4] }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    })

    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    })
  }

  async analyzeTransaction(tx: TransactionData): Promise<number> {
    if (!this.model) {
      await this.initialize()
    }

    const input = tf.tensor2d([[
      tx.amount / 1000000, // normalize to BTC
      tx.timeOfDay / 24,   // normalize to 0-1
      tx.dayOfWeek / 7,    // normalize to 0-1
      tx.frequency / 100   // normalize to 0-1
    ]])

    const prediction = this.model!.predict(input) as tf.Tensor
    const score = await prediction.data()
    
    input.dispose()
    prediction.dispose()

    return score[0]
  }
}
