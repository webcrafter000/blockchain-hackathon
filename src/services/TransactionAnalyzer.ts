export interface TransactionData {
  txid: string
  from: string
  to: string
  amount: number
  timestamp: number
  frequency: number
  isFlagged: boolean
}

export class TransactionAnalyzer {
  private flaggedAddresses = new Set(['tb1qxy', 'tb1qyz', 'tb1qzw']) // Simulated flagged addresses

  calculateRiskScore(tx: TransactionData): number {
    let risk = 0
    
    // Amount-based risk
    if (tx.amount > 500000) risk += 30
    if (tx.amount < 500) risk += 10
    
    // Frequency-based risk
    if (tx.frequency > 5) risk += 20
    
    // Flagged address risk
    if (this.flaggedAddresses.has(tx.to)) risk += 40
    
    // Time-based risk (unusual hours)
    const hour = new Date(tx.timestamp).getHours()
    if (hour >= 0 && hour <= 4) risk += 15
    
    return Math.min(risk, 99)
  }

  generateExplanation(tx: TransactionData): string {
    // High-risk patterns
    if (this.flaggedAddresses.has(tx.to) && tx.amount > 500000) {
      return " High-value transfer to flagged address raises significant laundering risk"
    }
    
    if (tx.frequency > 5 && tx.amount < 1000) {
      return " Pattern of micro-transactions suggests possible fee optimization or probing"
    }
    
    if (tx.amount > 700000) {
      const hour = new Date(tx.timestamp).getHours()
      if (hour >= 0 && hour <= 4) {
        return " Large transfer during unusual hours indicates potential OTC activity"
      }
      return " High-value transfer with normal timing pattern"
    }
    
    if (tx.amount < 100) {
      return " Extremely small transfer could be a dusting attack attempt"
    }
    
    if (tx.frequency > 3) {
      return " Multiple transactions suggest active Lightning Network routing node"
    }
    
    // Normal patterns
    const patterns = [
      " Transaction follows normal Lightning Network payment pattern",
      " Standard value transfer with typical timing",
      " Regular Lightning Network routing activity",
      " Common transaction size and frequency for this time period"
    ]
    
    return patterns[Math.floor(Math.random() * patterns.length)]
  }

  async analyzeTransaction(tx: TransactionData): Promise<{
    riskScore: number
    explanation: string
  }> {
    const riskScore = this.calculateRiskScore(tx)
    const explanation = this.generateExplanation(tx)
    
    return {
      riskScore,
      explanation
    }
  }

  // Helper to generate realistic-looking transaction data
  generateMockTransaction(): TransactionData {
    const addresses = [
      'tb1qxy', 'tb1qyz', 'tb1qzw',  // flagged
      'tb1abc', 'tb1def', 'tb1ghi',  // normal
      'tb1jkl', 'tb1mno', 'tb1pqr'   // normal
    ]
    
    return {
      txid: Math.random().toString(36).substring(2, 10),
      from: addresses[Math.floor(Math.random() * addresses.length)],
      to: addresses[Math.floor(Math.random() * addresses.length)],
      amount: Math.floor(Math.random() * 1000000),
      timestamp: Date.now(),
      frequency: Math.floor(Math.random() * 10),
      isFlagged: Math.random() > 0.8
    }
  }
}
