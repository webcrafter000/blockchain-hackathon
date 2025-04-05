import { EventEmitter } from 'events'

export interface Transaction {
  txid: string
  type: 'incoming' | 'outgoing'
  amount: number
  timestamp: string
  from: string
  to: string
  memo?: string
  status: 'pending' | 'complete' | 'failed'
}

declare global {
  interface Window {
    webln: any
  }
}

export class WalletService extends EventEmitter {
  private webln: any
  private connected: boolean = false
  private simulationMode: boolean = false
  private balance: number = 0

  constructor() {
    super()
  }

  async connect(): Promise<void> {
    try {
      if (typeof window.webln === 'undefined') {
        this.simulationMode = true
        this.connected = true
        this.balance = 0
        return
      }

      this.webln = window.webln
      await this.webln.enable()
      const info = await this.webln.getInfo()
      this.connected = true

      try {
        const balance = await this.webln.getBalance()
        this.balance = balance.balance || 0
        if (this.balance === 0) {
          this.simulationMode = true
        }
      } catch (e) {
        console.warn('Could not get balance, enabling simulation mode:', e)
        this.simulationMode = true
        this.balance = 0
      }

      this.emit('balance', this.balance)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      this.simulationMode = true
      this.connected = true
      this.balance = 0
      this.emit('balance', 0)
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.simulationMode = false
    this.balance = 0
    this.emit('disconnected')
  }

  async makePayment(amount: number, memo: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Please connect your wallet first')
    }

    if (this.simulationMode) {
      await this.simulatePayment(amount, memo)
      return
    }

    try {
      const response = await this.webln.sendPayment({
        amount,
        memo
      })
      
      const tx: Transaction = {
        txid: response.preimage || Math.random().toString(36).substr(2, 9),
        type: 'outgoing',
        amount: -amount,
        timestamp: new Date().toISOString(),
        from: 'Your Wallet',
        to: '029a...eb318',
        memo,
        status: 'complete'
      }

      this.balance -= amount
      this.emit('transaction', tx)
      this.emit('balance', this.balance)
    } catch (error) {
      console.error('Payment failed, falling back to simulation:', error)
      await this.simulatePayment(amount, memo)
    }
  }

  private async simulatePayment(amount: number, memo: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const tx: Transaction = {
      txid: Math.random().toString(36).substr(2, 9),
      type: 'outgoing',
      amount: -amount,
      timestamp: new Date().toISOString(),
      from: 'Your Wallet',
      to: '029a...eb318',
      memo: memo + ' (Simulated)',
      status: 'complete'
    }

    this.balance -= amount
    this.emit('transaction', tx)
    this.emit('balance', this.balance)
  }

  getWalletInfo() {
    if (!this.connected) return null
    return {
      balance: this.balance,
      simulationMode: this.simulationMode
    }
  }

  isConnected(): boolean {
    return this.connected
  }

  isSimulationMode(): boolean {
    return this.simulationMode
  }
}
