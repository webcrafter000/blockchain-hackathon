import { io, Socket } from 'socket.io-client'

export interface LightningTransaction {
  id: string
  amount: number
  timestamp: number
  sender: string
  receiver: string
}

export class WebSocketService {
  private socket: Socket | null = null
  private onTransactionCallback: ((tx: LightningTransaction) => void) | null = null

  connect(url: string = 'ws://localhost:3001') {
    this.socket = io(url)

    this.socket.on('connect', () => {
      console.log('Connected to Lightning Network')
    })

    this.socket.on('transaction', (tx: LightningTransaction) => {
      if (this.onTransactionCallback) {
        this.onTransactionCallback(tx)
      }
    })

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error)
    })
  }

  onTransaction(callback: (tx: LightningTransaction) => void) {
    this.onTransactionCallback = callback
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}
