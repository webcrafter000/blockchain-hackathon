import { EventEmitter } from '../utils/EventEmitter'
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
  risk: number
  fromAlias?: string
  toAlias?: string
  analysis?: string
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
  private transactions: Transaction[] = []
  private aiAnalysisEnabled: boolean = false
  private static readonly STORAGE_KEY = 'lightning_sentinel_state'

  constructor() {
    super()
    this.loadState()
    if (this.connected) {
      console.log('Restored previous session')
      this.emit('connected', this.getWalletInfo())
      if (this.transactions.length > 0) {
        this.simulateTransactionFlow()
      }
    }
  }

  private saveState() {
    const state = {
      connected: this.connected,
      balance: this.balance,
      nodeInfo: this.nodeInfo,
      transactions: this.transactions,
      aiAnalysisEnabled: this.aiAnalysisEnabled
    }
    localStorage.setItem(WalletService.STORAGE_KEY, JSON.stringify(state))
  }

  private loadState() {
    try {
      const savedState = localStorage.getItem(WalletService.STORAGE_KEY)
      if (savedState) {
        const state = JSON.parse(savedState)
        this.connected = state.connected
        this.balance = state.balance
        this.nodeInfo = state.nodeInfo
        this.transactions = state.transactions
        this.aiAnalysisEnabled = state.aiAnalysisEnabled ?? false
      }
    } catch (error) {
      console.error('Error loading saved state:', error)
    }
  }

  private analyzeTransaction(tx: Transaction): string {
    const amount = tx.amount
    const patterns = [
      { threshold: 500000, risk: "High-value transaction detected. Additional verification recommended." },
      { threshold: 100000, risk: "Medium-value transaction. Standard verification sufficient." },
      { threshold: 10000, risk: "Low-value transaction. Minimal risk." }
    ]
    
    let analysis = ""
    
    // Amount-based analysis
    for (const pattern of patterns) {
      if (amount >= pattern.threshold) {
        analysis = pattern.risk
        break
      }
    }
    
    // Time-based patterns
    const hour = new Date(tx.timestamp).getHours()
    if (hour < 6 || hour > 22) {
      analysis += " Transaction occurred during unusual hours."
    }
    
    // Transaction type specific analysis
    if (tx.type === 'incoming') {
      analysis += " Incoming payment verified through Lightning Network."
    } else {
      analysis += " Outgoing payment routed through optimal path."
    }
    
    return analysis
  }

  async connect(): Promise<WalletInfo> {
    try {
      // Reset state
      this.stopSimulation()
      this.connected = false
      
      // Always use simulation mode for demo
      this.simulationMode = true
      this.nodeInfo = {
        alias: 'Simulation Node',
        pubkey: '029aa35a668d3ec1b1451d6b238f9f648efb0dca9c2f9e08a29f4671fe530eb318',
        network: 'testnet'
      }
      this.balance = 1_000_000

      this.connected = true
      const walletInfo = this.getWalletInfo()
      console.log('Connected successfully:', walletInfo)
      this.emit('connected', walletInfo)
      this.saveState()
      return walletInfo
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      this.connected = false
      this.webln = null
      throw new Error(error instanceof Error ? error.message : 'Failed to connect wallet. Please try again.')
    }
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting wallet...')
    this.connected = false
    this.webln = null
    this.stopSimulation()
    localStorage.removeItem(WalletService.STORAGE_KEY)
    this.emit('disconnected')
  }

  async makePayment(amount: number, memo: string = ''): Promise<void> {
    if (!this.connected) {
      console.error('Wallet not connected')
      throw new Error('Please connect your wallet first')
    }

    console.log('Making simulated payment:', { amount, memo })
    
    // Start transaction flow simulation after payment
    this.simulateTransactionFlow()
    
    // Simulate the initial payment
    const tx: Transaction = {
      txid: generateRandomTxid(),
      type: 'outgoing',
      amount: amount,
      from: this.nodeInfo.pubkey,
      to: generateRandomNode(),
      fromAlias: this.nodeInfo.alias,
      toAlias: `node${Math.floor(Math.random() * 1000)}@lightning.network`,
      memo,
      timestamp: Date.now(),
      status: 'pending',
      risk: Math.floor(Math.random() * 30) // Random risk between 0-30%
    }

    tx.analysis = this.analyzeTransaction(tx)
    this.balance -= amount
    console.log('Emitting transaction:', tx)
    this.transactions.unshift(tx)
    this.saveState()
    this.emit('transaction', tx)
    this.emit('balance', this.balance)

    // Simulate transaction completion after a delay
    setTimeout(() => {
      tx.status = Math.random() > 0.2 ? 'complete' : 'failed'
      console.log('Transaction status updated:', tx.status)
      this.emit('transaction', tx)
      if (tx.status === 'failed') {
        this.balance += amount // Refund on failure
        this.saveState()
        this.emit('balance', this.balance)
      }
    }, 2000 + Math.random() * 3000)
  }

  private simulateTransactionFlow() {
    if (this.simulationInterval) {
      console.log('Transaction flow simulation already running')
      return
    }

    console.log('Starting transaction flow simulation')
    const generateTransaction = (): Transaction => {
      const isIncoming = Math.random() > 0.4
      const amount = Math.floor(Math.random() * 500_000) + 10_000
      const fromNode = isIncoming ? `node${Math.floor(Math.random() * 1000)}@lightning.network` : this.nodeInfo.alias
      const toNode = isIncoming ? this.nodeInfo.alias : `node${Math.floor(Math.random() * 1000)}@lightning.network`

      const tx: Transaction = {
        txid: generateRandomTxid(),
        type: isIncoming ? 'incoming' : 'outgoing',
        amount: amount,
        from: isIncoming ? generateRandomNode() : this.nodeInfo.pubkey,
        to: isIncoming ? this.nodeInfo.pubkey : generateRandomNode(),
        fromAlias: fromNode,
        toAlias: toNode,
        memo: this.getRandomMemo(),
        timestamp: Date.now(),
        status: 'pending',
        risk: Math.floor(Math.random() * 30) // Random risk between 0-30%
      }

      tx.analysis = this.analyzeTransaction(tx)

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
        console.log('Wallet disconnected, stopping simulation')
        this.stopSimulation()
        return
      }

      const tx = generateTransaction()
      console.log('Generated transaction:', tx)
      this.transactions.unshift(tx)
      this.saveState()
      this.emit('transaction', tx)
      this.emit('balance', this.balance)

      // Simulate transaction completion
      setTimeout(() => {
        tx.status = Math.random() > 0.1 ? 'complete' : 'failed'
        console.log('Transaction status updated:', tx.status)
        this.emit('transaction', tx)
        
        if (tx.status === 'failed' && tx.type === 'outgoing') {
          this.balance += tx.amount // Refund failed outgoing payments
          this.saveState()
          this.emit('balance', this.balance)
        }
      }, 2000 + Math.random() * 3000)
    }, 5000 + Math.random() * 5000)
  }

  private stopSimulation() {
    if (this.simulationInterval) {
      console.log('Stopping transaction flow simulation')
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

  getTransactions(): Transaction[] {
    return this.transactions
  }

  get isSimulationRunning(): boolean {
    return this.simulationInterval !== null
  }

  get isAiAnalysisEnabled(): boolean {
    return this.aiAnalysisEnabled
  }

  setAiAnalysisEnabled(enabled: boolean) {
    this.aiAnalysisEnabled = enabled
    this.saveState()
  }
}
