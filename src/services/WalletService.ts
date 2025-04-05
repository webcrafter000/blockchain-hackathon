import { EventEmitter } from 'events'

export interface WalletInfo {
  address: string
  alias?: string
  balance: number
  isTestnet: boolean
  network: 'bitcoin' | 'testnet'
  pubkey?: string
}

export interface Transaction {
  txid: string
  from: string
  to: string
  amount: number
  timestamp: number
  memo?: string
  type: 'incoming' | 'outgoing'
  status: 'pending' | 'complete' | 'failed'
}

export class WalletService extends EventEmitter {
  private connected: boolean = false
  private walletInfo: WalletInfo | null = null
  private webln: WebLNProvider | null = null
  private connectionTimeout: NodeJS.Timeout | null = null
  private transactionInterval: NodeJS.Timeout | null = null

  constructor() {
    super()
    this.setupTransactionSimulation()
  }

  async connect(): Promise<WalletInfo> {
    if (this.connected) {
      throw new Error('Wallet is already connected')
    }

    try {
      // Try to connect to Alby/WebLN first
      if (typeof window !== 'undefined' && window.webln) {
        await window.webln.enable()
        this.webln = window.webln
        
        // Get node info
        const info = await this.webln.getInfo()
        const balance = await this.webln.getBalance()
        
        this.connected = true
        this.walletInfo = {
          address: info.node.pubkey,
          alias: info.node.alias,
          balance: balance.balance,
          isTestnet: info.node.pubkey.startsWith('0'),
          network: info.node.pubkey.startsWith('0') ? 'testnet' : 'bitcoin',
          pubkey: info.node.pubkey
        }

        this.emit('connected', this.walletInfo)
        return this.walletInfo
      }

      // Fall back to simulation if no WebLN provider
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (Math.random() < 0.1) {
        throw new Error('Failed to connect to wallet. Please try again.')
      }

      this.connected = true
      this.walletInfo = {
        address: `tb1${Math.random().toString(36).substring(2, 10)}`,
        alias: 'Simulated Node',
        balance: Math.floor(Math.random() * 1000000),
        isTestnet: true,
        network: 'testnet'
      }

      this.emit('connected', this.walletInfo)
      return this.walletInfo

    } catch (error) {
      console.error('Wallet connection error:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      throw new Error('Wallet is not connected')
    }

    await new Promise(resolve => setTimeout(resolve, 500))
    this.cleanup()
  }

  private cleanup() {
    this.connected = false
    this.walletInfo = null
    this.webln = null
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
    if (this.transactionInterval) {
      clearInterval(this.transactionInterval)
      this.transactionInterval = null
    }
    this.emit('disconnected')
  }

  private setupTransactionSimulation() {
    // Generate realistic-looking transactions
    const generateTransaction = (): Transaction => {
      const isIncoming = Math.random() > 0.5
      const amount = Math.floor(Math.random() * 500000) + 1000 // 1k-500k sats
      const status = Math.random() > 0.1 ? 'complete' : 'failed'
      
      // Common payment types
      const memos = [
        'Invoice payment',
        'Lightning tip',
        'Streaming payment',
        'Merchant payment',
        'Node routing fee'
      ]

      return {
        txid: Math.random().toString(36).substring(2, 10),
        from: isIncoming ? `ln${Math.random().toString(36).substring(2, 8)}` : this.walletInfo?.address || '',
        to: isIncoming ? this.walletInfo?.address || '' : `ln${Math.random().toString(36).substring(2, 8)}`,
        amount: amount,
        timestamp: Date.now(),
        memo: memos[Math.floor(Math.random() * memos.length)],
        type: isIncoming ? 'incoming' : 'outgoing',
        status
      }
    }

    // Emit simulated transactions every 5-15 seconds when connected
    this.on('connected', () => {
      this.transactionInterval = setInterval(() => {
        if (this.connected) {
          const tx = generateTransaction()
          this.emit('transaction', tx)

          // Update wallet balance
          if (this.walletInfo && tx.status === 'complete') {
            this.walletInfo.balance += tx.type === 'incoming' ? tx.amount : -tx.amount
            this.emit('balance', this.walletInfo.balance)
          }
        }
      }, 5000 + Math.random() * 10000)
    })
  }

  isConnected(): boolean {
    return this.connected
  }

  getWalletInfo(): WalletInfo | null {
    return this.walletInfo
  }

  // Real WebLN methods when available
  async makePayment(amount: number, memo?: string): Promise<Transaction> {
    if (!this.connected) throw new Error('Wallet not connected')
    
    if (this.webln) {
      try {
        const invoice = await this.webln.makeInvoice({ amount, memo })
        const result = await this.webln.sendPayment(invoice.paymentRequest)
        
        const tx: Transaction = {
          txid: result.preimage,
          from: this.walletInfo?.address || '',
          to: 'lightning:' + invoice.paymentRequest.substring(0, 10),
          amount,
          timestamp: Date.now(),
          memo,
          type: 'outgoing',
          status: 'complete'
        }
        
        this.emit('transaction', tx)
        return tx
      } catch (error) {
        console.error('Payment error:', error)
        throw error
      }
    }
    
    // Simulate payment in mock mode
    await new Promise(resolve => setTimeout(resolve, 1000))
    const tx: Transaction = {
      txid: Math.random().toString(36).substring(2, 10),
      from: this.walletInfo?.address || '',
      to: `ln${Math.random().toString(36).substring(2, 8)}`,
      amount,
      timestamp: Date.now(),
      memo,
      type: 'outgoing',
      status: Math.random() > 0.1 ? 'complete' : 'failed'
    }
    
    this.emit('transaction', tx)
    return tx
  }
}
