import { EventEmitter } from '../utils/EventEmitter'
import type { WebLNProvider } from '../types/webln'

export interface Transaction {
  txid: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  timestamp: number;
  from: string;
  to: string;
  status: 'pending' | 'complete' | 'failed';
  memo?: string;
}

export interface WalletInfo {
  address: string;
  balance: number;
  network: string;
  alias?: string;
}

export class WalletService extends EventEmitter {
  private webln: WebLNProvider | null = null;
  private connected = false;
  private info: WalletInfo | null = null;
  private simulationInterval: number | null = null;

  constructor() {
    super();
    this.checkWebLNAvailability();
  }

  private async checkWebLNAvailability() {
    if (typeof window !== 'undefined' && window.webln) {
      this.webln = window.webln;
    }
  }

  async connect(): Promise<WalletInfo> {
    try {
      if (!this.webln) {
        throw new Error('WebLN not available');
      }

      await this.webln.enable();
      const info = await this.webln.getInfo();
      const balance = await this.webln.getBalance();

      this.info = {
        address: info.node.pubkey,
        balance: balance.balance,
        network: info.node.network || 'testnet',
        alias: info.node.alias
      };

      this.connected = true;
      this.startSimulation(); // For demo purposes
      return this.info;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      this.startSimulation(); // Fallback to simulation
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.info = null;
    this.stopSimulation();
    this.emit('disconnected');
  }

  async makePayment(amount: number, memo?: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    // For demo, create a simulated transaction
    const tx: Transaction = {
      txid: Math.random().toString(36).substring(2, 15),
      type: 'outgoing',
      amount,
      timestamp: Date.now(),
      from: this.info?.address || 'unknown',
      to: `node${Math.floor(Math.random() * 1000)}@lightning.network`,
      status: 'pending',
      memo
    };

    this.emit('transaction', tx);
    
    // Simulate transaction completion
    setTimeout(() => {
      tx.status = Math.random() > 0.1 ? 'complete' : 'failed';
      this.emit('transaction', tx);
      if (tx.status === 'complete' && this.info) {
        this.info.balance -= amount;
        this.emit('balance', this.info.balance);
      }
    }, 2000);
  }

  getWalletInfo(): WalletInfo | null {
    return this.info;
  }

  private startSimulation() {
    if (this.simulationInterval) return;

    // Initialize demo wallet info if not connected to real wallet
    if (!this.info) {
      this.info = {
        address: `node${Math.floor(Math.random() * 1000)}@lightning.network`,
        balance: 1000000,
        network: 'testnet',
        alias: 'Demo Node'
      };
    }

    this.simulationInterval = window.setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new transaction
        const isIncoming = Math.random() > 0.5;
        const amount = Math.floor(Math.random() * 500000) + 1000;
        
        const tx: Transaction = {
          txid: Math.random().toString(36).substring(2, 15),
          type: isIncoming ? 'incoming' : 'outgoing',
          amount,
          timestamp: Date.now(),
          from: isIncoming 
            ? `node${Math.floor(Math.random() * 1000)}@lightning.network`
            : this.info?.address || 'unknown',
          to: !isIncoming
            ? `node${Math.floor(Math.random() * 1000)}@lightning.network`
            : this.info?.address || 'unknown',
          status: 'pending',
          memo: this.generateRandomMemo()
        };

        this.emit('transaction', tx);

        // Simulate transaction completion
        setTimeout(() => {
          tx.status = Math.random() > 0.1 ? 'complete' : 'failed';
          this.emit('transaction', tx);
          
          if (tx.status === 'complete' && this.info) {
            this.info.balance += isIncoming ? amount : -amount;
            this.emit('balance', this.info.balance);
          }
        }, Math.random() * 3000 + 1000);
      }
    }, 5000);
  }

  private stopSimulation() {
    if (this.simulationInterval) {
      window.clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private generateRandomMemo(): string {
    const memos = [
      'Payment for services',
      'Monthly subscription',
      'Coffee ☕',
      'Lunch 🍕',
      'Thanks for the help!',
      'Split bill',
      'Project payment',
      'Donation ❤️',
      'Meeting expenses',
      'Workshop fee'
    ];
    return memos[Math.floor(Math.random() * memos.length)];
  }
}
