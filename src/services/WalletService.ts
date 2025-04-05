import { EventEmitter } from 'events'

export interface WalletInfo {
  address: string
  balance: number
  isTestnet: boolean
  network: 'bitcoin' | 'testnet'
}

export class WalletService extends EventEmitter {
  private connected: boolean = false
  private walletInfo: WalletInfo | null = null
  private connectionTimeout: NodeJS.Timeout | null = null

  constructor() {
    super()
  }

  async connect(): Promise<WalletInfo> {
    if (this.connected) {
      throw new Error('Wallet is already connected')
    }

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 10% chance of connection failure for realism
    if (Math.random() < 0.1) {
      throw new Error('Failed to connect to wallet. Please try again.')
    }

    this.connected = true
    this.walletInfo = {
      address: `tb1${Math.random().toString(36).substring(2, 10)}`,
      balance: Math.floor(Math.random() * 1000000),
      isTestnet: true,
      network: 'testnet'
    }

    // Simulate occasional connection drops
    this.startConnectionWatcher()

    return this.walletInfo
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
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
    this.emit('disconnected')
  }

  private startConnectionWatcher() {
    // Simulate random connection drops (5% chance every 30s)
    this.connectionTimeout = setInterval(() => {
      if (Math.random() < 0.05) {
        this.cleanup()
      }
    }, 30000)
  }

  isConnected(): boolean {
    return this.connected
  }

  getWalletInfo(): WalletInfo | null {
    return this.walletInfo
  }
}
