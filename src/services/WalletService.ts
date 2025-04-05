import EventEmitter from 'events'
import { generateRandomNode, generateRandomTxid } from '../utils/generators'

// WebLN types
interface WebLNProvider {
  enable: () => Promise<void>
  getInfo: () => Promise<{
    node: {
      alias?: string
      pubkey: string
      network?: string
    }
  }>
  getBalance: () => Promise<{
    balance: number
  }>
  sendPayment: (args: { amount: string, memo?: string }) => Promise<{
    preimage: string
  }>
}

declare global {
  interface Window {
    webln?: WebLNProvider
  }
}

export interface Transaction {
  txid: string
  type: 'incoming' | 'outgoing'
  amount: number
  from: string
  to: string
  memo?: string
  timestamp: number
  status: 'pending' | 'complete' | 'failed'
}

export interface WalletInfo {
  address: string
  balance: number
  network: string
  alias?: string
}

export class WalletService extends EventEmitter {
  private webln: WebLNProvider | null = null
  private connected: boolean = false
  private balance: number = 1_000_000 // Initial balance for simulation
  private nodeInfo = {
    alias: 'NWC',
    pubkey: '029aa35a668d3ec1b1451d6b238f9f648efb0dca9c2f9e08a29f4671fe530eb318',
    network: 'testnet'
  }
  private simulationMode: boolean = true
  private simulationInterval: NodeJS.Timeout | null = null

  constructor() {
    super()
  }

  async connect(): Promise<WalletInfo> {
    try {
      if (typeof window.webln !== 'undefined') {
        await window.webln.enable()
        this.webln = window.webln
        this.simulationMode = false
        const info = await this.webln.getInfo()
        const balance = await this.webln.getBalance()
        this.nodeInfo = {
          alias: info.node.alias || 'Unknown',
          pubkey: info.node.pubkey,
          network: info.node.network || 'mainnet'
        }
        this.balance = balance.balance || 0
      } else {
        this.simulationMode = true
        console.log('No WebLN provider found, using simulation mode')
      }

      this.connected = true
      this.emit('connected')
      return this.getWalletInfo()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw new Error('Failed to connect wallet. Please try again.')
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.webln = null
    this.stopSimulation()
    this.emit('disconnected')
  }

  async makePayment(amount: number, memo: string = ''): Promise<void> {
    if (!this.connected) {
      throw new Error('Please connect your wallet first')
    }

    if (this.simulationMode) {
      // Start transaction flow simulation after payment
      this.simulateTransactionFlow()
      
      // Simulate the initial payment
      const tx: Transaction = {
        txid: generateRandomTxid(),
        type: 'outgoing',
        amount: amount,
        from: this.nodeInfo.pubkey,
        to: generateRandomNode(),
        memo,
        timestamp: Date.now(),
        status: 'pending'
      }

      this.balance -= amount
      this.emit('transaction', tx)
      this.emit('balance', this.balance)

      // Simulate transaction completion after a delay
      setTimeout(() => {
        tx.status = Math.random() > 0.2 ? 'complete' : 'failed'
        this.emit('transaction', tx)
        if (tx.status === 'failed') {
          this.balance += amount // Refund on failure
          this.emit('balance', this.balance)
        }
      }, 2000 + Math.random() * 3000)
    } else if (this.webln) {
      try {
        const result = await this.webln.sendPayment({
          amount: amount.toString(),
          memo
        })
        // Handle real payment result
        this.balance -= amount
        this.emit('balance', this.balance)
      } catch (error) {
        console.error('Payment failed:', error)
        throw error
      }
    }
  }

  private simulateTransactionFlow() {
    if (this.simulationInterval) {
      return // Already simulating
    }

    const generateTransaction = (): Transaction => {
      const isIncoming = Math.random() > 0.4
      const amount = Math.floor(Math.random() * 500_000) + 10_000

      const tx: Transaction = {
        txid: generateRandomTxid(),
        type: isIncoming ? 'incoming' : 'outgoing',
        amount: amount,
        from: isIncoming ? generateRandomNode() : this.nodeInfo.pubkey,
        to: isIncoming ? this.nodeInfo.pubkey : generateRandomNode(),
        memo: this.getRandomMemo(),
        timestamp: Date.now(),
        status: 'pending'
      }

      if (tx.type === 'outgoing') {
        this.balance -= tx.amount
      } else {
        this.balance += tx.amount
      }

      return tx
    }

    // Simulate a stream of transactions
    this.simulationInterval = setInterval(() => {
      if (!this.connected) {
        this.stopSimulation()
        return
      }

      const tx = generateTransaction()
      this.emit('transaction', tx)
      this.emit('balance', this.balance)

      // Simulate transaction completion
      setTimeout(() => {
        tx.status = Math.random() > 0.1 ? 'complete' : 'failed'
        this.emit('transaction', tx)
        
        if (tx.status === 'failed' && tx.type === 'outgoing') {
          this.balance += tx.amount // Refund failed outgoing payments
          this.emit('balance', this.balance)
        }
      }, 2000 + Math.random() * 3000)
    }, 5000 + Math.random() * 5000)
  }

  private stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
  }

  private getRandomMemo(): string {
    const memos = [
      'Payment for services',
      'Workshop fee',
      'Split bill',
      'Lunch 🍕',
      'Thanks for the help!',
      'Donation ❤️',
      'Test payment'
    ]
    return memos[Math.floor(Math.random() * memos.length)]
  }

  getWalletInfo(): WalletInfo {
    return {
      address: this.nodeInfo.pubkey,
      balance: this.balance,
      network: this.nodeInfo.network,
      alias: this.nodeInfo.alias
    }
  }

  isConnected(): boolean {
    return this.connected
  }
}
