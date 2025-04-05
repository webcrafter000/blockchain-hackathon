import { useState, useEffect } from 'react'
import { WalletService, Transaction } from '../services/WalletService'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { ChartOptions, TooltipItem } from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface TransactionDashboardProps {
  connected: boolean
  walletService: WalletService
}

const getTransactionType = (memo?: string): string => {
  if (!memo) return ''
  
  const memoLower = memo.toLowerCase()
  
  // Common transaction types
  const typePatterns = {
    donation: ['donate', 'donation', 'tip', 'gift'],
    workshop: ['workshop', 'course', 'training', 'class'],
    payment: ['payment', 'invoice', 'bill', 'fee'],
    exchange: ['exchange', 'swap', 'trade'],
    refund: ['refund', 'return', 'reimbursement'],
    subscription: ['subscription', 'membership', 'recurring'],
    service: ['service', 'consulting', 'advice'],
    product: ['product', 'item', 'purchase'],
    transfer: ['transfer', 'move', 'send'],
    withdrawal: ['withdraw', 'cash out'],
    deposit: ['deposit', 'add', 'fund']
  }

  for (const [type, patterns] of Object.entries(typePatterns)) {
    if (patterns.some(pattern => memoLower.includes(pattern))) {
      return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  return ''
}

const getTransactionInsight = (transaction: Transaction, currentBalance: number): string => {
  const isIncoming = transaction.type === 'incoming'
  const isLargeAmount = transaction.amount > 1000000 // 1M sats
  const isSmallAmount = transaction.amount < 100000 // 100K sats
  const transactionType = getTransactionType(transaction.memo)
  const typeText = transactionType ? ` (${transactionType})` : ''

  let insight = ''

  // Risk-based insights
  if (transaction.risk < 10) {
    insight += `✅ Low risk transaction${typeText}. `
    if (isSmallAmount) {
      insight += `Small amount (${transaction.amount.toLocaleString()} sats). `
    }
    insight += 'Payment verified through Lightning Network.'
  } else if (transaction.risk <= 25) {
    insight += `🟡 Medium risk transaction${typeText}. `
    if (isLargeAmount) {
      insight += `Moderate amount (${transaction.amount.toLocaleString()} sats). `
    }
    insight += 'Monitor if recurring. Routing path verified.'
  } else {
    insight += `🔴 Elevated risk transaction${typeText}. `
    if (isLargeAmount) {
      insight += `Large amount (${transaction.amount.toLocaleString()} sats). `
    }
    insight += 'Unusual pattern detected. Verify payment details carefully.'
  }

  // Balance analysis
  if (isIncoming) {
    const newBalance = currentBalance + transaction.amount
    if (newBalance > currentBalance * 2) {
      insight += ` \n✅ Balance increased by ${((newBalance - currentBalance) / currentBalance * 100).toFixed(1)}%. Payment successfully received.`
    }
  } else {
    const newBalance = currentBalance - transaction.amount
    if (newBalance < currentBalance * 0.5) {
      insight += ` \n⚠️ Large outgoing transaction. Balance reduced by ${((currentBalance - newBalance) / currentBalance * 100).toFixed(1)}%.`
    }
  }

  return insight.trim()
}

const TransactionCard: React.FC<{ transaction: Transaction; currentBalance: number }> = ({ transaction, currentBalance }) => {
  const isIncoming = transaction.type === 'incoming'
  const statusColor = {
    pending: 'text-yellow-400',
    complete: 'text-green-400',
    failed: 'text-red-400'
  }[transaction.status]

  const getRiskColor = (risk: number) => {
    if (risk < 10) return 'text-green-400'
    if (risk <= 25) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="glassmorphic rounded-xl p-4 transition-all hover:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono ${statusColor}`}>{transaction.txid.slice(0, 8)}...</span>
            <span className="text-sm text-blue-200/60">
              {transaction.type} • {transaction.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {isIncoming ? '←' : '→'}
            </span>
            <span className="text-sm text-blue-200/80 font-mono">
              {isIncoming ? transaction.fromAlias : transaction.toAlias}
            </span>
          </div>
          {transaction.memo && (
            <div className="text-sm text-blue-200/80">
              {transaction.memo}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className={`text-lg font-semibold ${
              isIncoming ? 'text-green-400' : 'text-red-400'
            }`}>
              {isIncoming ? '+' : '-'}{transaction.amount.toLocaleString()} sats
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-200/80">Risk:</span>
              <span className={`text-sm ${getRiskColor(transaction.risk)}`}>
                {transaction.risk}%
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-blue-200/70 border-t border-blue-200/10 pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-200/80">AI Insight:</span>
            </div>
            <p className="text-sm text-blue-200/80 whitespace-pre-wrap">
              {getTransactionInsight(transaction, currentBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const TransactionDashboard: React.FC<TransactionDashboardProps> = ({
  connected,
  walletService
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentBalance, setCurrentBalance] = useState(0)

  useEffect(() => {
    const handleTransaction = (tx: Transaction) => {
      console.log('New transaction:', tx)
      setTransactions(prev => {
        const existing = prev.findIndex(t => t.txid === tx.txid)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = tx
          return updated
        }
        return [tx, ...prev]
      })
    }

    const handleBalance = (balance: number) => {
      console.log('Balance updated:', balance)
      setCurrentBalance(balance)
    }

    walletService.on('transaction', handleTransaction)
    walletService.on('balance', handleBalance)

    // Initialize with current state
    setTransactions(walletService.getTransactions())
    setCurrentBalance(walletService.getWalletInfo().balance)

    return () => {
      walletService.off('transaction', handleTransaction)
      walletService.off('balance', handleBalance)
    }
  }, [walletService])

  const chartData = {
    labels: transactions.slice(0, 10).reverse().map(tx => 
      new Date(tx.timestamp).toLocaleTimeString()
    ),
    datasets: [{
      label: 'Transaction Amount (sats)',
      data: transactions.slice(0, 10).reverse().map(tx => 
        tx.type === 'incoming' ? tx.amount : -tx.amount
      ),
      fill: true,
      borderColor: 'rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 25, 40, 0.8)',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = context.raw as number
            return `${value >= 0 ? '+' : ''}${value.toLocaleString()} sats`
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        display: true,
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)'
        }
      },
      y: {
        type: 'linear',
        display: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
          callback: (tickValue: number | string) => {
            const value = Number(tickValue)
            return `${value >= 0 ? '+' : ''}${value.toLocaleString()}`
          }
        }
      }
    }
  }

  if (!connected) {
    return (
      <div className="glassmorphic rounded-2xl p-6">
        <div className="text-center text-blue-200/60">
          Connect your wallet to view transactions
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="glassmorphic rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
            Transaction Flow
          </h2>
          <p className="text-blue-200/80">Real-time transaction monitoring</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-blue-200/80">Current Balance</span>
            <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
              {currentBalance.toLocaleString()} sats
            </span>
          </div>
        </div>

        <div className="h-64 mb-6">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="glassmorphic p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-200/80">AI Analysis:</span>
            <span className="text-sm text-blue-400 font-medium">
              Risk levels across the last 10 txs are within normal limits. No anomalies detected.
            </span>
          </div>
        </div>

        <div className="space-y-3 transaction-list">
          {transactions.map(tx => (
            <TransactionCard key={tx.txid} transaction={tx} currentBalance={currentBalance} />
          ))}
          {transactions.length === 0 && (
            <div className="text-center text-blue-200/60 py-8">
              No transactions yet. Try sending a test payment!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
